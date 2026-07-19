import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { useQuote } from '../../../../src/hooks/useQuotes';
import { theme } from '../../../../src/theme/theme';

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quoteQuery = useQuote(Number(id));

  if (quoteQuery.isLoading) return <LoadingSpinner />;
  if (!quoteQuery.data) return <EmptyState message="Quote not found." />;

  const quote = quoteQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>"{quote.text}"</Text>
      <Text style={styles.author}>— {quote.author.name}</Text>
      {quote.author.bio ? <Text style={styles.bio}>{quote.author.bio}</Text> : null}
      {quote.source ? <Text style={styles.source}>{quote.source}</Text> : null}
      <Text style={styles.categories}>
        {quote.categories.map((category) => category.name).join(', ')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  text: { fontSize: theme.fontSize.xl, fontStyle: 'italic' },
  author: { fontSize: theme.fontSize.lg, color: '#444' },
  bio: { fontSize: theme.fontSize.md, color: '#666' },
  source: { fontSize: theme.fontSize.sm, color: '#888' },
  categories: { fontSize: theme.fontSize.sm, color: '#888', marginTop: theme.spacing.md },
});
