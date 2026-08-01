import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text } from '../../../../src/components/common/AppText';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { GlassCard } from '../../../../src/components/common/GlassCard';
import { HeartButton } from '../../../../src/components/common/HeartButton';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../../src/components/common/ScreenContainer';
import { useFavoriteQuoteIds, useQuote, useToggleFavoriteQuote } from '../../../../src/hooks/useQuotes';
import { theme } from '../../../../src/theme/theme';

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quoteQuery = useQuote(Number(id));
  const favoriteIds = useFavoriteQuoteIds();
  const toggleFavorite = useToggleFavoriteQuote();
  const isFavorited = favoriteIds.data?.quote_ids.includes(Number(id)) ?? false;

  if (quoteQuery.isLoading) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }
  if (!quoteQuery.data) {
    return (
      <ScreenContainer>
        <EmptyState message="Quote not found." />
      </ScreenContainer>
    );
  }

  const quote = quoteQuery.data;

  return (
    <ScreenContainer>
      <GlassCard style={styles.card}>
        <HeartButton
          isFavorited={isFavorited}
          onPress={() => toggleFavorite.mutate({ id: Number(id), isFavorited })}
          style={styles.heart}
        />
        <Text style={styles.text}>"{quote.text}"</Text>
        <Text style={styles.author}>— {quote.author.name}</Text>
        {quote.author.bio ? <Text style={styles.bio}>{quote.author.bio}</Text> : null}
        {quote.source ? <Text style={styles.source}>{quote.source}</Text> : null}
        <Text style={styles.categories}>{quote.categories.map((c) => c.name).join(' · ')}</Text>
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { position: 'relative' },
  heart: { position: 'absolute', top: theme.spacing.md, right: theme.spacing.md },
  text: { fontSize: theme.fontSize.xl, lineHeight: 36, fontWeight: '600', color: theme.colors.textPrimary },
  author: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary, marginTop: theme.spacing.md },
  bio: { fontSize: theme.fontSize.md, lineHeight: 22, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
  source: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.sm },
  categories: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.md },
});
