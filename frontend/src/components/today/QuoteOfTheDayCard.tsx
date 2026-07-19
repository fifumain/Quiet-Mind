import { StyleSheet, Text, View } from 'react-native';
import type { components } from '../../api/generated/schema';
import { theme } from '../../theme/theme';

type Quote = components['schemas']['Quote'];

export function QuoteOfTheDayCard({ quote }: { quote: Quote }) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>"{quote.text}"</Text>
      <Text style={styles.author}>— {quote.author.name}</Text>
      {quote.source ? <Text style={styles.source}>{quote.source}</Text> : null}
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
  text: { fontSize: theme.fontSize.lg, fontStyle: 'italic' },
  author: { fontSize: theme.fontSize.md, color: '#444' },
  source: { fontSize: theme.fontSize.sm, color: '#888' },
});
