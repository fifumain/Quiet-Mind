import { useLocalSearchParams } from 'expo-router';
import { Image, Linking, Pressable, StyleSheet, Text } from 'react-native';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { GlassCard } from '../../../../src/components/common/GlassCard';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../../src/components/common/ScreenContainer';
import { TiltedCard } from '../../../../src/components/common/TiltedCard';
import { useBook } from '../../../../src/hooks/useBooks';
import { theme } from '../../../../src/theme/theme';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookQuery = useBook(Number(id));

  if (bookQuery.isLoading) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }
  if (!bookQuery.data) {
    return (
      <ScreenContainer>
        <EmptyState message="Книга не найдена." />
      </ScreenContainer>
    );
  }

  const book = bookQuery.data;

  return (
    <ScreenContainer>
      <GlassCard>
        {book.cover_image ? (
          <TiltedCard>
            <Image source={{ uri: book.cover_image }} style={styles.cover} />
          </TiltedCard>
        ) : null}
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>
          {book.author.name}
          {book.publication_year ? ` · ${book.publication_year}` : ''}
        </Text>
        {book.description ? <Text style={styles.description}>{book.description}</Text> : null}
        <Text style={styles.categories}>{book.categories.map((c) => c.name).join(' · ')}</Text>
        {book.external_url ? (
          <Pressable onPress={() => Linking.openURL(book.external_url!)}>
            <Text style={styles.link}>Подробнее</Text>
          </Pressable>
        ) : null}
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cover: { width: 120, height: 180, borderRadius: theme.radius.sm, marginBottom: theme.spacing.md },
  title: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.textPrimary },
  author: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary, marginTop: 4 },
  description: {
    fontSize: theme.fontSize.md,
    lineHeight: 23,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  categories: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.md },
  link: { color: theme.colors.accent, fontWeight: '600', marginTop: theme.spacing.md },
});
