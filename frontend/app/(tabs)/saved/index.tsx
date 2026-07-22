import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { ClickSpark } from '../../../src/components/common/ClickSpark';
import { CountUp } from '../../../src/components/common/CountUp';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { RotatingText } from '../../../src/components/common/RotatingText';
import { ScreenContainer } from '../../../src/components/common/ScreenContainer';
import { GradientText } from '../../../src/components/landing/GradientText';
import { SavedCard } from '../../../src/components/saved/SavedCard';
import { useFavoriteBooks, useToggleFavoriteBook } from '../../../src/hooks/useBooks';
import { useFavoriteQuotes, useToggleFavoriteQuote } from '../../../src/hooks/useQuotes';
import { glassBlur, theme } from '../../../src/theme/theme';

type Segment = 'quotes' | 'books';

const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatSavedAt(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS_RU[m - 1]} ${y}`;
}

export default function SavedScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 2 : 1;

  const [segment, setSegment] = useState<Segment>('quotes');
  const [pendingRemovals, setPendingRemovals] = useState<Set<number>>(new Set());

  const favoriteQuotes = useFavoriteQuotes();
  const favoriteBooks = useFavoriteBooks();
  const toggleFavoriteQuote = useToggleFavoriteQuote();
  const toggleFavoriteBook = useToggleFavoriteBook();

  const activeQuery = segment === 'quotes' ? favoriteQuotes : favoriteBooks;
  const quoteItems = (favoriteQuotes.data?.pages.flatMap((page) => page?.results ?? []) ?? []).filter(
    (item) => !pendingRemovals.has(item.id),
  );
  const bookItems = (favoriteBooks.data?.pages.flatMap((page) => page?.results ?? []) ?? []).filter(
    (item) => !pendingRemovals.has(item.id),
  );
  const total = (segment === 'quotes' ? quoteItems : bookItems).length;

  const removeQuote = (favoriteId: number, quoteId: number) => {
    setPendingRemovals((prev) => new Set(prev).add(favoriteId));
    toggleFavoriteQuote.mutate({ id: quoteId, isFavorited: true });
  };
  const removeBook = (favoriteId: number, bookId: number) => {
    setPendingRemovals((prev) => new Set(prev).add(favoriteId));
    toggleFavoriteBook.mutate({ id: bookId, isFavorited: true });
  };

  const header = (
    <View style={styles.header}>
      <GradientText style={styles.title}>Избранное</GradientText>
      <Text style={styles.subtitle}>Цитаты и книги, которые вы решили сохранить.</Text>

      <View style={[styles.segment, glassBlur()]}>
        <SegmentButton label="Цитаты" active={segment === 'quotes'} onPress={() => setSegment('quotes')} />
        <SegmentButton label="Книги" active={segment === 'books'} onPress={() => setSegment('books')} />
      </View>

      {!activeQuery.isLoading ? (
        <Text style={styles.total}>
          <CountUp target={total} /> {segment === 'quotes' ? 'сохранённых цитат' : 'сохранённых книг'}
        </Text>
      ) : null}
    </View>
  );

  const footer = activeQuery.hasNextPage ? (
    <ClickSpark style={styles.moreSparkWrap} onPress={() => activeQuery.fetchNextPage()}>
      <View style={[styles.moreButton, glassBlur()]}>
        <Text style={styles.moreText}>{activeQuery.isFetchingNextPage ? 'Загрузка…' : 'Показать ещё'}</Text>
      </View>
    </ClickSpark>
  ) : null;

  const empty = (
    <View style={styles.empty}>
      <Text style={styles.emptyGlyph}>♡</Text>
      <RotatingText
        style={styles.emptyText}
        phrases={[
          'Пока пусто.',
          'Нажмите ♡ на любой цитате или книге, чтобы сохранить её здесь.',
        ]}
      />
    </View>
  );

  const columnWrapper = columns > 1 ? { gap: theme.spacing.md } : undefined;

  return (
    <ScreenContainer scroll={false}>
      {activeQuery.isLoading ? (
        <>
          {header}
          <LoadingSpinner />
        </>
      ) : segment === 'quotes' ? (
        <FlatList
          key={`q${columns}`}
          data={quoteItems}
          numColumns={columns}
          columnWrapperStyle={columnWrapper}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          ListEmptyComponent={empty}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(Math.min(index, 12) * 60).duration(420).springify().damping(16)}
              exiting={FadeOut.duration(200)}
              style={styles.cell}
            >
              <SavedCard
                title={`"${item.quote.text}"`}
                subtitle={item.quote.author.name}
                savedAtLabel={formatSavedAt(item.created_at)}
                onPress={() => router.navigate(`/library/quotes/${item.quote.id}`)}
                onRemove={() => removeQuote(item.id, item.quote.id)}
              />
            </Animated.View>
          )}
        />
      ) : (
        <FlatList
          key={`b${columns}`}
          data={bookItems}
          numColumns={columns}
          columnWrapperStyle={columnWrapper}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          ListEmptyComponent={empty}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(Math.min(index, 12) * 60).duration(420).springify().damping(16)}
              exiting={FadeOut.duration(200)}
              style={styles.cell}
            >
              <SavedCard
                title={item.book.title}
                subtitle={item.book.author.name}
                savedAtLabel={formatSavedAt(item.created_at)}
                onPress={() => router.navigate(`/library/books/${item.book.id}`)}
                onRemove={() => removeBook(item.id, item.book.id)}
              />
            </Animated.View>
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
  segmentButtonActive: { backgroundColor: theme.glass.fillStrong },
  segmentText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textMuted },
  segmentTextActive: { color: theme.colors.textPrimary },
  total: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  list: { gap: theme.spacing.md, paddingBottom: theme.spacing.xl, maxWidth: 900, width: '100%', alignSelf: 'center' },
  cell: { flex: 1 },
  moreSparkWrap: { alignSelf: 'center', marginTop: theme.spacing.sm },
  moreButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.pill,
  },
  moreText: { color: theme.colors.textPrimary, fontSize: theme.fontSize.sm, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: theme.spacing.xl * 2, gap: theme.spacing.md },
  emptyGlyph: { fontSize: 40, color: 'rgba(232,176,160,0.5)' },
  emptyText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 280 },
});
