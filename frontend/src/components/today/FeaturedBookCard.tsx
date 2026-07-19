import { StyleSheet, Text, View } from 'react-native';
import type { components } from '../../api/generated/schema';
import { theme } from '../../theme/theme';

type Book = components['schemas']['Book'];

export function FeaturedBookCard({ book }: { book: Book }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author.name}</Text>
      {book.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {book.description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    gap: theme.spacing.xs,
  },
  title: { fontSize: theme.fontSize.lg, fontWeight: '600' },
  author: { fontSize: theme.fontSize.md, color: '#444' },
  description: { fontSize: theme.fontSize.sm, color: '#666' },
});
