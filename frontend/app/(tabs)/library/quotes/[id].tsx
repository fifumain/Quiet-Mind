import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { GlassCard } from '../../../../src/components/common/GlassCard';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../../src/components/common/ScreenContainer';
import { useQuote } from '../../../../src/hooks/useQuotes';
import { theme } from '../../../../src/theme/theme';

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quoteQuery = useQuote(Number(id));

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
        <EmptyState message="Цитата не найдена." />
      </ScreenContainer>
    );
  }

  const quote = quoteQuery.data;

  return (
    <ScreenContainer>
      <GlassCard>
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
  text: { fontSize: theme.fontSize.xl, lineHeight: 36, fontWeight: '600', color: theme.colors.textPrimary },
  author: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary, marginTop: theme.spacing.md },
  bio: { fontSize: theme.fontSize.md, lineHeight: 22, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
  source: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.sm },
  categories: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.md },
});
