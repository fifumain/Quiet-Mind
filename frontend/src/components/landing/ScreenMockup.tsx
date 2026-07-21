import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { glassBlur, theme } from '../../theme/theme';

type ScreenKind = 'today' | 'chat' | 'library';

/**
 * A stylized, static render of one app screen inside a browser frame, for
 * the landing showcase. Not the real screens (no data/nav) — just their
 * look: the forest gradient and glass cards, small enough to sit in a grid.
 */
export function ScreenMockup({ kind, caption }: { kind: ScreenKind; caption: string }) {
  return (
    <View style={styles.frame}>
      <View style={styles.chrome}>
        <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
        <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.18)' }]} />
        <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
      </View>
      <LinearGradient colors={theme.gradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.screen}>
        {kind === 'today' ? <TodayMock /> : kind === 'chat' ? <ChatMock /> : <LibraryMock />}
      </LinearGradient>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

function MiniCard({ children }: { children: ReactNode }) {
  return <View style={[styles.card, glassBlur(12)]}>{children}</View>;
}

function TodayMock() {
  return (
    <View style={styles.mockBody}>
      <Text style={styles.label}>Quote of the day</Text>
      <MiniCard>
        <Text style={styles.quote}>"Be one."</Text>
        <Text style={styles.meta}>Marcus Aurelius</Text>
      </MiniCard>
      <MiniCard>
        <Text style={styles.bookTitle}>Daring Greatly</Text>
        <Text style={styles.meta}>Brené Brown</Text>
      </MiniCard>
    </View>
  );
}

function ChatMock() {
  return (
    <View style={styles.mockBody}>
      <View style={[styles.bubble, styles.bubbleUser]}>
        <Text style={styles.bubbleText}>I've been anxious…</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleAlex, glassBlur(12)]}>
        <Text style={styles.bubbleText}>What's on your mind?</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleUser]}>
        <Text style={styles.bubbleText}>Work and deadlines.</Text>
      </View>
    </View>
  );
}

function LibraryMock() {
  return (
    <View style={styles.mockBody}>
      <View style={styles.pillsRow}>
        <View style={[styles.miniPill, styles.miniPillActive]}>
          <Text style={styles.miniPillText}>Quotes</Text>
        </View>
        <View style={styles.miniPill}>
          <Text style={styles.miniPillTextMuted}>Books</Text>
        </View>
      </View>
      <MiniCard>
        <Text style={styles.quote}>"Wherever you go…"</Text>
      </MiniCard>
      <MiniCard>
        <Text style={styles.quote}>"You can't stop the waves…"</Text>
      </MiniCard>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fills its parent so every instance is the same size (e.g. inside a
  // fixed-size CardSwap card) — fixes the uneven-height problem.
  frame: { width: '100%', height: '100%', borderRadius: theme.radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.glass.border },
  chrome: {
    flexDirection: 'row',
    gap: 5,
    padding: 10,
    backgroundColor: '#12180F',
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  screen: { flex: 1, padding: theme.spacing.md },
  caption: {
    padding: theme.spacing.sm,
    backgroundColor: theme.glass.fillSubtle,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  mockBody: { gap: theme.spacing.sm, flex: 1 },
  card: {
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: 3,
  },
  label: { fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.textMuted, fontWeight: '700' },
  quote: { fontSize: theme.fontSize.xs, color: theme.colors.textPrimary, fontWeight: '600' },
  bookTitle: { fontSize: theme.fontSize.sm, color: theme.colors.textPrimary, fontWeight: '700' },
  meta: { fontSize: 10, color: theme.colors.textSecondary },
  bubble: { maxWidth: '85%', borderRadius: theme.radius.md, paddingVertical: 7, paddingHorizontal: 11 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: theme.glass.fillStrong, borderBottomRightRadius: 3 },
  bubbleAlex: {
    alignSelf: 'flex-start',
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderBottomLeftRadius: 3,
  },
  bubbleText: { fontSize: 10, color: theme.colors.textPrimary },
  pillsRow: { flexDirection: 'row', gap: 5 },
  miniPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.glass.border },
  miniPillActive: { backgroundColor: theme.glass.fillStrong, borderColor: 'transparent' },
  miniPillText: { fontSize: 10, color: theme.colors.textPrimary, fontWeight: '600' },
  miniPillTextMuted: { fontSize: 10, color: theme.colors.textMuted, fontWeight: '600' },
});
