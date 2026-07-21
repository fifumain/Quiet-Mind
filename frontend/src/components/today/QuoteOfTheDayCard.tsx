import { StyleSheet, Text, type ViewStyle } from 'react-native';
import type { components } from '../../api/generated/schema';
import { theme } from '../../theme/theme';
import { GlassCard } from '../common/GlassCard';

type Quote = components['schemas']['Quote'];

export function QuoteOfTheDayCard({ quote, style }: { quote: Quote; style?: ViewStyle }) {
  return (
    <GlassCard style={style}>
      <Text style={styles.label}>Цитата дня</Text>
      <Text style={styles.text}>"{quote.text}"</Text>
      <Text style={styles.attrib}>
        — {quote.author.name}
        {quote.source ? `, ${quote.source}` : ''}
      </Text>
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
  text: {
    fontSize: theme.fontSize.lg,
    lineHeight: 30,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  attrib: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
});
