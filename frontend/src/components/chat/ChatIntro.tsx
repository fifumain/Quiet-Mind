import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../common/AppText';
import { AnimatedEntrance } from '../common/AnimatedEntrance';
import { glassBlur, theme } from '../../theme/theme';

/**
 * First-run state for the chat.
 *
 * Replaces what used to be a single rotating line of centred text. A blank
 * prompt is the hardest thing to answer — especially for someone who opened a
 * psychology app because they're not feeling great — so this offers concrete
 * openers that send on tap, and states plainly what Alex is and isn't before
 * the first message rather than burying that in a footer.
 */

const STARTERS = [
  'I am anxious about work',
  'I want to make sense of a relationship',
  "I can't make a decision",
  'I just want to talk it out',
];

export function ChatIntro({ onPick }: { onPick: (text: string) => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <AnimatedEntrance index={0}>
          <Text style={styles.title}>Where would you like to start?</Text>
          <Text style={styles.lede}>
            Alex listens and asks guiding questions. Now and then it will bring up an idea, a book or a
            quote from psychology — but never a diagnosis or instructions on what to do.
          </Text>
        </AnimatedEntrance>

        <View style={styles.starters}>
          {STARTERS.map((s, i) => (
            <AnimatedEntrance key={s} index={i + 1}>
              <Pressable
                onPress={() => onPick(s)}
                style={[styles.starter, glassBlur(12)]}
                accessibilityRole="button"
                accessibilityLabel={`Start a conversation: ${s}`}
              >
                <Text style={styles.starterText}>{s}</Text>
              </Pressable>
            </AnimatedEntrance>
          ))}
        </View>

        <AnimatedEntrance index={STARTERS.length + 1}>
          <Text style={styles.disclaimer}>
            Alex is a companion, not a therapist. If things are hard right now, please reach out to a
            professional or a helpline.
          </Text>
        </AnimatedEntrance>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', paddingVertical: theme.spacing.lg },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: theme.spacing.lg },
  title: { fontFamily: theme.fonts.display, fontSize: theme.fontSize.lg, color: theme.colors.textPrimary },
  lede: {
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  starters: { gap: theme.spacing.sm },
  starter: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  starterText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textPrimary },
  disclaimer: {
    fontSize: theme.fontSize.xs,
    lineHeight: 19,
    color: theme.colors.textMuted,
    borderLeftWidth: 2,
    borderLeftColor: theme.glass.border,
    paddingLeft: theme.spacing.md,
  },
});
