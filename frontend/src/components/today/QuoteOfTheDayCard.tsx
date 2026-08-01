import { StyleSheet, type ViewStyle } from 'react-native';
import { Text } from '../common/AppText';
import type { components } from '../../api/generated/schema';
import { useFavoriteQuoteIds, useToggleFavoriteQuote } from '../../hooks/useQuotes';
import { theme } from '../../theme/theme';
import { GlassCard } from '../common/GlassCard';
import { HeartButton } from '../common/HeartButton';

type Quote = components['schemas']['Quote'];

export function QuoteOfTheDayCard({ quote, style }: { quote: Quote; style?: ViewStyle }) {
  // The quote of the day is a regular Quote row under the hood (same id),
  // so favoriting it here just toggles the same FavoriteQuote used
  // everywhere else — no separate "favorite quote of the day" concept, and
  // no risk of duplicating it in the Saved list.
  const favoriteIds = useFavoriteQuoteIds();
  const toggleFavorite = useToggleFavoriteQuote();
  const isFavorited = favoriteIds.data?.quote_ids.includes(quote.id) ?? false;

  return (
    <GlassCard style={[styles.card, style]}>
      <HeartButton
        isFavorited={isFavorited}
        onPress={() => toggleFavorite.mutate({ id: quote.id, isFavorited })}
        style={styles.heart}
      />
      <Text style={styles.label}>Quote of the day</Text>
      <Text style={styles.text}>"{quote.text}"</Text>
      <Text style={styles.attrib}>
        — {quote.author.name}
        {quote.source ? `, ${quote.source}` : ''}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { position: 'relative' },
  heart: { position: 'absolute', top: theme.spacing.md, right: theme.spacing.md },
  label: {
    fontSize: theme.fontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  text: {
    fontSize: theme.fontSize.lg,
    lineHeight: 30,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  attrib: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
});
