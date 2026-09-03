import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from '../../../src/components/common/AppText';
import { AnimatedEntrance } from '../../../src/components/common/AnimatedEntrance';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { ScreenContainer } from '../../../src/components/common/ScreenContainer';
import { TiltedCard } from '../../../src/components/common/TiltedCard';
import { FeaturedBookCard } from '../../../src/components/today/FeaturedBookCard';
import { MoodPrompt } from '../../../src/components/today/MoodPrompt';
import { QuoteOfTheDayCard } from '../../../src/components/today/QuoteOfTheDayCard';
import { useLogout } from '../../../src/hooks/useAuth';
import { useFeaturedBook } from '../../../src/hooks/useBooks';
import { useChatMessages } from '../../../src/hooks/useChat';
import { useQuoteOfTheDay } from '../../../src/hooks/useQuotes';
import { glassBlur, theme } from '../../../src/theme/theme';

export default function TodayScreen() {
  const router = useRouter();
  const qotd = useQuoteOfTheDay();
  const featuredBook = useFeaturedBook();
  const chat = useChatMessages();
  const logout = useLogout();
  const { width } = useWindowDimensions();
  const twoColumn = width >= 800;

  // Nothing on this screen otherwise tells a new user that the chat — the
  // actual product — exists. Shown only until they've sent a first message.
  const showWelcome = !chat.isLoading && (chat.data?.length ?? 0) === 0;

  // flex: 1 keeps both cards in a row the same height regardless of content length.
  const cardStyle = twoColumn ? { flex: 1 } : undefined;

  const quoteBlock = qotd.isLoading ? (
    <LoadingSpinner />
  ) : qotd.data ? (
    <AnimatedEntrance index={0} style={cardStyle}>
      <QuoteOfTheDayCard quote={qotd.data.quote} style={cardStyle} />
    </AnimatedEntrance>
  ) : (
    <EmptyState message="No quote of the day yet." />
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
    <EmptyState message="No book of the week yet." />
  );

  return (
    <ScreenContainer title="Today">
      {showWelcome ? (
        <AnimatedEntrance index={0}>
          <View style={[styles.welcome, glassBlur()]}>
            <Text style={styles.welcomeTitle}>Start with a conversation</Text>
            <Text style={styles.welcomeText}>
              Alex listens and asks guiding questions — no diagnoses, no advice. The quote and the book
              below are simply something to think about.
            </Text>
            <Pressable
              onPress={() => router.navigate('/chat')}
              style={styles.welcomeCta}
              accessibilityRole="button"
            >
              <Text style={styles.welcomeCtaText}>Open the chat</Text>
            </Pressable>
          </View>
        </AnimatedEntrance>
      ) : null}

      <MoodPrompt />

      <View style={[styles.grid, twoColumn && styles.gridWide]}>
        <View style={styles.col}>{quoteBlock}</View>
        <View style={styles.col}>{bookBlock}</View>
      </View>

      <Pressable onPress={() => router.navigate('/library/history')} style={styles.historyLink}>
        <Text style={styles.historyLinkText}>Look back at past days →</Text>
      </Pressable>

      <Pressable onPress={() => logout.mutate()} disabled={logout.isPending} style={styles.logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { gap: theme.spacing.md },
  gridWide: { flexDirection: 'row' },
  col: { flex: 1, gap: theme.spacing.md },
  welcome: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  welcomeTitle: { fontFamily: theme.fonts.display, fontSize: theme.fontSize.lg, color: theme.colors.textPrimary },
  welcomeText: { fontSize: theme.fontSize.sm, lineHeight: 22, color: theme.colors.textSecondary },
  welcomeCta: {
    marginTop: theme.spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  welcomeCtaText: { fontWeight: '700', fontSize: theme.fontSize.sm, color: theme.gradient[0] },
  historyLink: { marginTop: theme.spacing.lg, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  historyLinkText: { color: theme.colors.accent, fontSize: theme.fontSize.sm, fontWeight: '600' },
  logout: { marginTop: theme.spacing.xl, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  logoutText: { color: theme.colors.danger, fontSize: theme.fontSize.sm, fontWeight: '600' },
});
