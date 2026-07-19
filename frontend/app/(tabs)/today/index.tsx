import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { FeaturedBookCard } from '../../../src/components/today/FeaturedBookCard';
import { QuoteOfTheDayCard } from '../../../src/components/today/QuoteOfTheDayCard';
import { useLogout } from '../../../src/hooks/useAuth';
import { useFeaturedBook } from '../../../src/hooks/useBooks';
import { useQuoteOfTheDay } from '../../../src/hooks/useQuotes';
import { theme } from '../../../src/theme/theme';

export default function TodayScreen() {
  const qotd = useQuoteOfTheDay();
  const featuredBook = useFeaturedBook();
  const logout = useLogout();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Quote of the day</Text>
      {qotd.isLoading ? (
        <LoadingSpinner />
      ) : qotd.data ? (
        <QuoteOfTheDayCard quote={qotd.data.quote} />
      ) : (
        <EmptyState message="No quote of the day set yet." />
      )}

      <Text style={styles.sectionTitle}>Featured book</Text>
      {featuredBook.isLoading ? (
        <LoadingSpinner />
      ) : featuredBook.data ? (
        <FeaturedBookCard book={featuredBook.data.book} />
      ) : (
        <EmptyState message="No featured book set yet." />
      )}

      <Pressable onPress={() => logout.mutate()} disabled={logout.isPending} style={styles.logoutButton}>
        <Text style={styles.logout}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: '600', marginTop: theme.spacing.md },
  logoutButton: { marginTop: theme.spacing.xl, alignItems: 'center' },
  logout: { textDecorationLine: 'underline', color: '#c00' },
});
