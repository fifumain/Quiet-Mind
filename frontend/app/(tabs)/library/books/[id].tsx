import { useLocalSearchParams } from 'expo-router';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { useBook } from '../../../../src/hooks/useBooks';
import { theme } from '../../../../src/theme/theme';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookQuery = useBook(Number(id));

  if (bookQuery.isLoading) return <LoadingSpinner />;
  if (!bookQuery.data) return <EmptyState message="Book not found." />;

  const book = bookQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {book.cover_image ? <Image source={{ uri: book.cover_image }} style={styles.cover} /> : null}
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>
        {book.author.name}
        {book.publication_year ? ` · ${book.publication_year}` : ''}
      </Text>
      {book.description ? <Text style={styles.description}>{book.description}</Text> : null}
      <Text style={styles.categories}>{book.categories.map((category) => category.name).join(', ')}</Text>
      {book.external_url ? (
        <Pressable onPress={() => Linking.openURL(book.external_url!)}>
          <Text style={styles.link}>More info</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  cover: { width: 120, height: 180, borderRadius: theme.radius.sm, marginBottom: theme.spacing.md },
  title: { fontSize: theme.fontSize.xl, fontWeight: '600' },
  author: { fontSize: theme.fontSize.lg, color: '#444' },
  description: { fontSize: theme.fontSize.md, color: '#666' },
  categories: { fontSize: theme.fontSize.sm, color: '#888', marginTop: theme.spacing.md },
  link: { color: '#06c', textDecorationLine: 'underline', marginTop: theme.spacing.md },
});
