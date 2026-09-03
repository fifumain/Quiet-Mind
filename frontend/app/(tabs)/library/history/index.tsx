import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../../../../src/components/common/AppText';
import { CountUp } from '../../../../src/components/common/CountUp';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../../src/components/common/ScreenContainer';
import { GradientText } from '../../../../src/components/landing/GradientText';
import { HistoryEntry } from '../../../../src/components/library/HistoryEntry';
import { useFeaturedBookHistory } from '../../../../src/hooks/useBooks';
import { useMoodHistory } from '../../../../src/hooks/useMood';
import { useQuoteOfTheDayHistory } from '../../../../src/hooks/useQuotes';
import { glassBlur, theme } from '../../../../src/theme/theme';
import type { MoodValue } from '../../../../src/api/endpoints/mood';

type Segment = 'quotes' | 'books' | 'mood';

const MOOD_LABELS: Record<MoodValue, string> = {
  great: 'Great',
  good: 'Good',
  okay: 'Okay',
  low: 'Low',
  struggling: 'Struggling',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Hand-rolled to avoid any Intl/ICU-data edge cases across native runtimes,
// and split-then-construct to sidestep UTC-parsing timezone shifts on bare
// "YYYY-MM-DD" strings.
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('quotes');

  const quoteHistory = useQuoteOfTheDayHistory();
  const bookHistory = useFeaturedBookHistory();
  const moodHistory = useMoodHistory();

  const activeQuery = segment === 'quotes' ? quoteHistory : segment === 'books' ? bookHistory : moodHistory;
  const quoteItems = quoteHistory.data?.pages.flatMap((page) => page?.results ?? []) ?? [];
  const bookItems = bookHistory.data?.pages.flatMap((page) => page?.results ?? []) ?? [];
  const moodItems = moodHistory.data?.pages.flatMap((page) => page?.results ?? []) ?? [];
  const total = activeQuery.data?.pages[0]?.count ?? 0;

  const loadMore = () => {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) activeQuery.fetchNextPage();
  };

  const header = (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backLink} onPress={() => router.navigate('/library')}>
        <Text style={styles.backLinkText}>← Library</Text>
      </TouchableOpacity>

      <GradientText style={styles.title}>Time Capsule</GradientText>
      <Text style={styles.subtitle}>Every quote of the day and book of the week, from the very first one.</Text>

      <View style={[styles.segment, glassBlur()]}>
        <SegmentButton label="Quotes of the day" active={segment === 'quotes'} onPress={() => setSegment('quotes')} />
        <SegmentButton label="Books of the week" active={segment === 'books'} onPress={() => setSegment('books')} />
        <SegmentButton label="Mood" active={segment === 'mood'} onPress={() => setSegment('mood')} />
      </View>

      {!activeQuery.isLoading ? (
        <Text style={styles.total}>
          <CountUp target={total} /> {segment === 'quotes' ? 'days' : segment === 'books' ? 'weeks' : 'check-ins'} of
          history
        </Text>
      ) : null}
    </View>
  );

  const footer = activeQuery.isFetchingNextPage ? <LoadingSpinner /> : null;

  return (
    <ScreenContainer scroll={false}>
      {activeQuery.isLoading ? (
        <>
          {header}
          <LoadingSpinner />
        </>
      ) : segment === 'mood' ? (
        <FlatList
          key="mood"
          data={moodItems}
          keyExtractor={(item) => item.date}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          ListEmptyComponent={<EmptyState message="No mood check-ins yet." />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          renderItem={({ item, index }) => (
            <HistoryEntry
              index={index}
              isLast={index === moodItems.length - 1 && !moodHistory.hasNextPage}
              isCurrent={false}
              dateLabel={formatDate(item.date)}
              title={MOOD_LABELS[item.mood]}
              subtitle={item.note || 'No note'}
              // No detail screen for a mood entry — HistoryEntry renders it as
              // a plain, non-interactive row when onPress is omitted.
            />
          )}
        />
      ) : segment === 'quotes' ? (
        <FlatList
          key="quotes"
          data={quoteItems}
          keyExtractor={(item) => item.day}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          ListEmptyComponent={<EmptyState message="No quotes of the day yet." />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          renderItem={({ item, index }) => (
            <HistoryEntry
              index={index}
              isLast={index === quoteItems.length - 1 && !quoteHistory.hasNextPage}
              isCurrent={index === 0}
              dateLabel={formatDate(item.day)}
              title={`"${item.quote.text}"`}
              subtitle={item.quote.author.name}
              body={item.quote.source || undefined}
              onPress={() => router.navigate(`/library/quotes/${item.quote.id}`)}
            />
          )}
        />
      ) : (
        <FlatList
          key="books"
          data={bookItems}
          keyExtractor={(item) => item.week_start}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          ListEmptyComponent={<EmptyState message="No books of the week yet." />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          renderItem={({ item, index }) => (
            <HistoryEntry
              index={index}
              isLast={index === bookItems.length - 1 && !bookHistory.hasNextPage}
              isCurrent={index === 0}
              dateLabel={`Week of ${formatDate(item.week_start)}`}
              title={item.book.title}
              subtitle={item.book.author.name}
              body={item.book.description || undefined}
              onPress={() => router.navigate(`/library/books/${item.book.id}`)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.segmentButton, active && styles.segmentButtonActive]} onPress={onPress}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { gap: theme.spacing.md, marginBottom: theme.spacing.md },
  backLink: { alignSelf: 'flex-start' },
  backLinkText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.accent },
  title: { fontSize: theme.fontSize.xl, fontWeight: '700' },
  subtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  segment: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 4,
    padding: 3,
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.md,
  },
  segmentButton: { paddingHorizontal: theme.spacing.md, paddingVertical: 6, borderRadius: theme.radius.sm },
  segmentButtonActive: { backgroundColor: theme.glass.selected },
  segmentText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textMuted },
  segmentTextActive: { color: theme.colors.textPrimary },
  total: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  list: { paddingBottom: theme.spacing.xl, maxWidth: 700, width: '100%', alignSelf: 'center' },
});
