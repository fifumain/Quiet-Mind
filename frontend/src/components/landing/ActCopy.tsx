import { StyleSheet, View } from 'react-native';
import { Text } from '../common/AppText';
import { theme } from '../../theme/theme';
import { anim } from './animMarker';
import type { Act } from './stageData';

/**
 * The text half of one gallery act.
 *
 * Every animatable part carries a `data-anim` marker instead of a forwarded ref.
 * The engine selects them out of its own layer (`[data-anim="line"]` and
 * friends), which keeps a ten-property choreography from turning into ten ref
 * callbacks threaded through props — and lets the static fallback render the
 * exact same markup with nothing wired up at all.
 */
export function ActCopy({ act, scale }: { act: Act; scale: number }) {
  const quote = Math.round(60 * scale);

  return (
    <View style={styles.wrap}>
      {/* Oversized index, set at 4% opacity behind the text. Editorial furniture:
          it gives the column a sense of place in a series. */}
      <Text
        {...anim('ghost')}
        style={[styles.ghost, { fontSize: Math.round(210 * scale), lineHeight: Math.round(210 * scale) }]}
      >
        {act.index}
      </Text>

      <View style={styles.maskRow}>
        <View {...anim('eyebrow')}>
          <Text style={styles.eyebrow}>{act.theme}</Text>
        </View>
      </View>

      <View {...anim('rule')} style={styles.rule} />

      <View style={styles.quote}>
        {act.lines.map((line, i) => (
          // One mask per line: the reveal has to be able to run per line, and a
          // single clip box around the whole quote would slide it as a block.
          <View key={i} style={[styles.lineMask, { paddingBottom: Math.round(quote * 0.18), marginBottom: -Math.round(quote * 0.18) }]}>
            <View {...anim('line')}>
              <Text style={[styles.line, { fontSize: quote, lineHeight: Math.round(quote * 1.04) }]}>{line}</Text>
            </View>
          </View>
        ))}
      </View>

      <View {...anim('meta')} style={styles.metaRow}>
        <Text style={styles.name}>{act.name}</Text>
        <Text style={styles.years}>{act.years}</Text>
        {act.source ? <Text style={styles.years}>· {act.source}</Text> : null}
      </View>

      <View {...anim('application')} style={styles.applicationWrap}>
        <Text style={styles.application}>{act.application}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', maxWidth: 620 },
  ghost: {
    position: 'absolute',
    top: -40,
    left: -26,
    fontFamily: theme.fonts.display,
    color: 'rgba(245,246,240,0.045)',
    letterSpacing: -6,
  },
  maskRow: { overflow: 'hidden', alignSelf: 'flex-start' },
  eyebrow: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 3.4,
    textTransform: 'uppercase',
    color: theme.colors.accent,
  },
  rule: {
    height: 1,
    width: 72,
    marginTop: 14,
    marginBottom: 22,
    backgroundColor: 'rgba(227,217,160,0.55)',
    // Grows from the left, so the origin has to be pinned there.
    ...({ transformOrigin: 'left center' } as object),
  },
  quote: { alignSelf: 'flex-start' },
  lineMask: { overflow: 'hidden', alignSelf: 'flex-start' },
  line: {
    fontFamily: theme.fonts.display,
    color: theme.colors.textPrimary,
    letterSpacing: -1.2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 26, flexWrap: 'wrap' },
  name: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: theme.colors.textPrimary,
  },
  years: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textFaint, letterSpacing: 0.6 },
  applicationWrap: { marginTop: 26, maxWidth: 470 },
  application: {
    fontFamily: theme.fonts.body,
    fontSize: 16,
    lineHeight: 28,
    color: theme.colors.textSecondary,
  },
});
