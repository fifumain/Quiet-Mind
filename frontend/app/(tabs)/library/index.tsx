import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { FilterBar } from '../../../src/components/library/FilterBar';
import { ListItem } from '../../../src/components/library/ListItem';
import { useBooks } from '../../../src/hooks/useBooks';
import { useCategories, useQuotes } from '../../../src/hooks/useQuotes';
import { theme } from '../../../src/theme/theme';

type Segment = 'quotes' | 'books';

export default function LibraryScreen() {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('quotes');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Simple debounce so we don't fire a request on every keystroke.
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
  const isEmpty = segment === 'quotes' ? quoteItems.length === 0 : bookItems.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentButton, segment === 'quotes' && styles.segmentButtonActive]}
          onPress={() => setSegment('quotes')}
        >
          <Text style={[styles.segmentText, segment === 'quotes' && styles.segmentTextActive]}>Quotes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, segment === 'books' && styles.segmentButtonActive]}
          onPress={() => setSegment('books')}
        >
          <Text style={[styles.segmentText, segment === 'books' && styles.segmentTextActive]}>Books</Text>
        </TouchableOpacity>
      </View>

      <FilterBar
        categories={categories}
        selectedCategory={category}
        onSelectCategory={setCategory}
        search={searchInput}
        onChangeSearch={setSearchInput}
      />

      {activeQuery.isLoading ? (
        <LoadingSpinner />
      ) : isEmpty ? (
        <EmptyState message="Nothing found." />
      ) : segment === 'quotes' ? (
        <FlatList
          data={quoteItems}
          keyExtractor={(item) => String(item.id)}
          onEndReached={() => quotesQuery.hasNextPage && quotesQuery.fetchNextPage()}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <ListItem
              title={`"${item.text}"`}
              subtitle={item.author.name}
              onPress={() => router.push(`/(tabs)/library/quotes/${item.id}`)}
            />
          )}
        />
      ) : (
        <FlatList
          data={bookItems}
          keyExtractor={(item) => String(item.id)}
          onEndReached={() => booksQuery.hasNextPage && booksQuery.fetchNextPage()}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              subtitle={item.author.name}
              onPress={() => router.push(`/(tabs)/library/books/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  segmentRow: { flexDirection: 'row', padding: theme.spacing.md, gap: theme.spacing.sm },
  segmentButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  segmentButtonActive: { backgroundColor: '#333', borderColor: '#333' },
  segmentText: { color: '#333' },
  segmentTextActive: { color: '#fff' },
});
