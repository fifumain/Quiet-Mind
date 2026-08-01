import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Text } from '../../../src/components/common/AppText';
import { AnimatedEntrance } from '../../../src/components/common/AnimatedEntrance';
import { ClickSpark } from '../../../src/components/common/ClickSpark';
import { CountUp } from '../../../src/components/common/CountUp';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../src/components/common/ScreenContainer';
import { FilterBar } from '../../../src/components/library/FilterBar';
import { ListItem } from '../../../src/components/library/ListItem';
import { useBooks, useFavoriteBookIds, useToggleFavoriteBook } from '../../../src/hooks/useBooks';
import { useCategories, useFavoriteQuoteIds, useQuotes, useToggleFavoriteQuote } from '../../../src/hooks/useQuotes';
import { glassBlur, theme } from '../../../src/theme/theme';

type Segment = 'quotes' | 'books';

export default function LibraryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  // Deliberately capped at 2 columns — a calm reading list, not a dense mosaic.
  const columns = width >= 900 ? 2 : 1;

  const [segment, setSegment] = useState<Segment>('quotes');
  const [category, setCategory] = useState<string | undefined>(undefined);
  // Only the debounced value lives here; FilterBar owns the raw keystrokes so
  // typing doesn't re-render this screen (and with it, every list row).
  const [search, setSearch] = useState('');

  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.results ?? [];

  const filters = useMemo(() => ({ category, search: search || undefined }), [category, search]);
  const quotesQuery = useQuotes(filters, { enabled: segment === 'quotes' });
  const booksQuery = useBooks(filters, { enabled: segment === 'books' });

  const activeQuery = segment === 'quotes' ? quotesQuery : booksQuery;
  const quotesData = quotesQuery.data;
  const booksData = booksQuery.data;
  const quoteItems = useMemo(
    () => quotesData?.pages.flatMap((page) => page?.results ?? []) ?? [],
    [quotesData],
  );
  const bookItems = useMemo(
    () => booksData?.pages.flatMap((page) => page?.results ?? []) ?? [],
    [booksData],
  );

  const total = activeQuery.data?.pages[0]?.count ?? 0;

  const favoriteQuoteIds = useFavoriteQuoteIds();
  const favoriteBookIds = useFavoriteBookIds();
  const favoriteQuoteIdSet = useMemo(() => new Set(favoriteQuoteIds.data?.quote_ids ?? []), [favoriteQuoteIds.data]);
  const favoriteBookIdSet = useMemo(() => new Set(favoriteBookIds.data?.book_ids ?? []), [favoriteBookIds.data]);
  const toggleFavoriteQuote = useToggleFavoriteQuote();
  const toggleFavoriteBook = useToggleFavoriteBook();

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={[styles.segment, glassBlur()]}>
          <SegmentButton label="Quotes" active={segment === 'quotes'} onPress={() => setSegment('quotes')} />
          <SegmentButton label="Books" active={segment === 'books'} onPress={() => setSegment('books')} />
        </View>
        <TouchableOpacity style={[styles.historyLink, glassBlur()]} onPress={() => router.navigate('/library/history')}>
          <Text style={styles.historyLinkText}>Time Capsule</Text>
        </TouchableOpacity>
      </View>
      <FilterBar
        categories={categories}
        selectedCategory={category}
        onSelectCategory={setCategory}
        onSearch={setSearch}
      />
      {!activeQuery.isLoading ? (
        <Text style={styles.total}>
          <CountUp target={total} /> {segment === 'quotes' ? 'quotes' : 'books'} found
        </Text>
      ) : null}
    </View>
  );

  // Explicit "load more" instead of infinite scroll — keeps the screen calm.
  const footer = activeQuery.hasNextPage ? (
    <ClickSpark style={styles.moreSparkWrap} onPress={() => activeQuery.fetchNextPage()}>
      <View style={[styles.moreButton, glassBlur()]}>
        <Text style={styles.moreText}>{activeQuery.isFetchingNextPage ? 'Loading…' : 'Show more'}</Text>
      </View>
    </ClickSpark>
  ) : null;

  const columnWrapper = columns > 1 ? { gap: theme.spacing.md } : undefined;

  // Hoisted out of JSX: an inline renderItem is a new function identity every
  // render, which makes VirtualizedList re-render every mounted cell.
  const renderQuote = useCallback(
    ({ item, index }: { item: (typeof quoteItems)[number]; index: number }) => {
      const isFavorited = favoriteQuoteIdSet.has(item.id);
      return (
        <AnimatedEntrance index={index} style={styles.cell}>
          <ListItem
            title={`"${item.text}"`}
            subtitle={item.author.name}
            onPress={() => router.navigate(`/library/quotes/${item.id}`)}
            isFavorited={isFavorited}
            onToggleFavorite={() => toggleFavoriteQuote.mutate({ id: item.id, isFavorited })}
          />
        </AnimatedEntrance>
      );
    },
    [favoriteQuoteIdSet, router, toggleFavoriteQuote],
  );

  const renderBook = useCallback(
    ({ item, index }: { item: (typeof bookItems)[number]; index: number }) => {
      const isFavorited = favoriteBookIdSet.has(item.id);
      return (
        <AnimatedEntrance index={index} style={styles.cell}>
          <ListItem
            title={item.title}
            subtitle={item.author.name}
            onPress={() => router.navigate(`/library/books/${item.id}`)}
            isFavorited={isFavorited}
            onToggleFavorite={() => toggleFavoriteBook.mutate({ id: item.id, isFavorited })}
          />
        </AnimatedEntrance>
      );
    },
    [favoriteBookIdSet, router, toggleFavoriteBook],
  );

  /**
   * Defaults would keep ~21 viewports mounted; with a 20-item page that means
   * nothing is actually virtualised and every row (a blurred glass panel)
   * stays live. These bring it back to a real window.
   */
  const virtualization = {
    initialNumToRender: 6,
    windowSize: 5,
    maxToRenderPerBatch: 8,
    // NB: no `removeClippedSubviews` — on react-native-web it detaches cells in
    // a way that leaves gaps in the grid. The window settings above already do
    // the heavy lifting.
  } as const;

  return (
    <ScreenContainer title="Library" scroll={false}>
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
          ListEmptyComponent={<EmptyState message="Nothing found." />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderQuote}
          {...virtualization}
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
          ListEmptyComponent={<EmptyState message="Nothing found." />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderBook}
          {...virtualization}
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
  segmentButtonActive: { backgroundColor: theme.glass.selected },
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
