import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AnimatedEntrance } from '../../../src/components/common/AnimatedEntrance';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../src/components/common/ScreenContainer';
import { TiltedCard } from '../../../src/components/common/TiltedCard';
import { FeaturedBookCard } from '../../../src/components/today/FeaturedBookCard';
import { QuoteOfTheDayCard } from '../../../src/components/today/QuoteOfTheDayCard';
import { useLogout } from '../../../src/hooks/useAuth';
import { useFeaturedBook } from '../../../src/hooks/useBooks';
import { useQuoteOfTheDay } from '../../../src/hooks/useQuotes';
import { theme } from '../../../src/theme/theme';

export default function TodayScreen() {
  const router = useRouter();
  const qotd = useQuoteOfTheDay();
  const featuredBook = useFeaturedBook();
  const logout = useLogout();
  const { width } = useWindowDimensions();
  const twoColumn = width >= 800;

  // flex: 1 keeps both cards in a row the same height regardless of content length.
  const cardStyle = twoColumn ? { flex: 1 } : undefined;

  const quoteBlock = qotd.isLoading ? (
    <LoadingSpinner />
  ) : qotd.data ? (
    <AnimatedEntrance index={0} style={cardStyle}>
      <QuoteOfTheDayCard quote={qotd.data.quote} style={cardStyle} />
    </AnimatedEntrance>
  ) : (
    <EmptyState message="Цитата дня ещё не задана." />
  );

  const bookBlock = featuredBook.isLoading ? (
    <LoadingSpinner />
  ) : featuredBook.data ? (
    <AnimatedEntrance index={1} style={cardStyle}>
      <TiltedCard style={cardStyle}>
        <FeaturedBookCard book={featuredBook.data.book} style={cardStyle} />
      </TiltedCard>
    </AnimatedEntrance>
  ) : (
    <EmptyState message="Книга недели ещё не выбрана." />
  );

  return (
    <ScreenContainer title="Сегодня">
      <View style={[styles.grid, twoColumn && styles.gridWide]}>
        <View style={styles.col}>{quoteBlock}</View>
        <View style={styles.col}>{bookBlock}</View>
      </View>

      <Pressable onPress={() => router.navigate('/library/history')} style={styles.historyLink}>
        <Text style={styles.historyLinkText}>Look back at past days →</Text>
      </Pressable>

      <Pressable onPress={() => logout.mutate()} disabled={logout.isPending} style={styles.logout}>
        <Text style={styles.logoutText}>Выйти</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { gap: theme.spacing.md },
  gridWide: { flexDirection: 'row' },
  col: { flex: 1, gap: theme.spacing.md },
  historyLink: { marginTop: theme.spacing.lg, alignItems: 'center' },
  historyLinkText: { color: theme.colors.accent, fontSize: theme.fontSize.sm, fontWeight: '600' },
  logout: { marginTop: theme.spacing.xl, alignItems: 'center' },
  logoutText: { color: theme.colors.danger, fontSize: theme.fontSize.sm, fontWeight: '600' },
});
