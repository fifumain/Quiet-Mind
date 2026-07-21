import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { AnimatedEntrance } from '../../../src/components/common/AnimatedEntrance';
import { ClickSpark } from '../../../src/components/common/ClickSpark';
import { CountUp } from '../../../src/components/common/CountUp';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../src/components/common/ScreenContainer';
import { FilterBar } from '../../../src/components/library/FilterBar';
import { ListItem } from '../../../src/components/library/ListItem';
import { useBooks } from '../../../src/hooks/useBooks';
import { useCategories, useQuotes } from '../../../src/hooks/useQuotes';
import { glassBlur, theme } from '../../../src/theme/theme';

type Segment = 'quotes' | 'books';

export default function LibraryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  // Deliberately capped at 2 columns — a calm reading list, not a dense mosaic.
  const columns = width >= 900 ? 2 : 1;

  const [segment, setSegment] = useState<Segment>('quotes');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.results ?? [];

  const filters = useMemo(() => ({ category, search: search || undefined }), [category, search]);
  const quotesQuery = useQuotes(filters);
  const booksQuery = useBooks(filters);

  const activeQuery = segment === 'quotes' ? quotesQuery : booksQuery;
  const quoteItems = quotesQuery.data?.pages.flatMap((page) => page?.results ?? []) ?? [];
  const bookItems = booksQuery.data?.pages.flatMap((page) => page?.results ?? []) ?? [];

  const total = activeQuery.data?.pages[0]?.count ?? 0;

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={[styles.segment, glassBlur()]}>
          <SegmentButton label="Цитаты" active={segment === 'quotes'} onPress={() => setSegment('quotes')} />
          <SegmentButton label="Книги" active={segment === 'books'} onPress={() => setSegment('books')} />
        </View>
        <TouchableOpacity style={[styles.historyLink, glassBlur()]} onPress={() => router.navigate('/library/history')}>
          <Text style={styles.historyLinkText}>Time Capsule</Text>
        </TouchableOpacity>
      </View>
      <FilterBar
        categories={categories}
        selectedCategory={category}
        onSelectCategory={setCategory}
        search={searchInput}
        onChangeSearch={setSearchInput}
      />
      {!activeQuery.isLoading ? (
        <Text style={styles.total}>
          <CountUp target={total} /> {segment === 'quotes' ? 'цитат' : 'книг'} найдено
        </Text>
      ) : null}
    </View>
  );

  // Explicit "load more" instead of infinite scroll — keeps the screen calm.
  const footer = activeQuery.hasNextPage ? (
    <ClickSpark style={styles.moreSparkWrap} onPress={() => activeQuery.fetchNextPage()}>
      <View style={[styles.moreButton, glassBlur()]}>
        <Text style={styles.moreText}>{activeQuery.isFetchingNextPage ? 'Загрузка…' : 'Показать ещё'}</Text>
      </View>
    </ClickSpark>
  ) : null;

  const columnWrapper = columns > 1 ? { gap: theme.spacing.md } : undefined;

  return (
    <ScreenContainer title="Библиотека" scroll={false}>
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
          ListEmptyComponent={<EmptyState message="Ничего не найдено." />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <AnimatedEntrance index={index} style={styles.cell}>
              <ListItem
                title={`"${item.text}"`}
                subtitle={item.author.name}
                onPress={() => router.navigate(`/library/quotes/${item.id}`)}
              />
            </AnimatedEntrance>
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
          ListEmptyComponent={<EmptyState message="Ничего не найдено." />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <AnimatedEntrance index={index} style={styles.cell}>
              <ListItem
                title={item.title}
                subtitle={item.author.name}
                onPress={() => router.navigate(`/library/books/${item.id}`)}
              />
            </AnimatedEntrance>
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
  header: { gap: theme.spacing.lg, marginBottom: theme.spacing.sm },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  historyLink: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  historyLinkText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.accent },
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
  list: { gap: theme.spacing.md, paddingBottom: theme.spacing.xl, maxWidth: 900, width: '100%', alignSelf: 'center' },
  cell: { flex: 1 },
  total: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
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
});
