import { StyleSheet, Text, type ViewStyle } from 'react-native';
import type { components } from '../../api/generated/schema';
import { theme } from '../../theme/theme';
import { GlassCard } from '../common/GlassCard';

type Book = components['schemas']['Book'];

export function FeaturedBookCard({ book, style }: { book: Book; style?: ViewStyle }) {
  return (
    <GlassCard style={style}>
      <Text style={styles.label}>Книга недели</Text>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author.name}</Text>
      {book.description ? <Text style={styles.description}>{book.description}</Text> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: theme.fontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  title: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 3 },
  author: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  description: { fontSize: theme.fontSize.sm, lineHeight: 21, color: theme.colors.textSecondary },
});
