import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../common/AppText';
import { theme } from '../../theme/theme';
import { ActCopy } from './ActCopy';
import { ScrollReveal } from './ScrollReveal';
import { ACTS, STAGE_OUTRO } from './stageData';

/**
 * The gallery without the pin.
 *
 * Used on native (no scroll-driven pinning to hook into) and on web when the
 * visitor has asked for reduced motion. Same acts, same words, same portraits —
 * laid out as stacked sections that fade up on entry, so the page still reads
 * correctly once the choreography is gone.
 */
export function StageStatic({ hero, scale }: { hero: ReactNode; scale: number }) {
  return (
    <View>
      <View style={styles.heroBlock}>{hero}</View>

      {ACTS.map((act) => (
        <ScrollReveal key={act.id} style={styles.act}>
          <View style={[styles.glow, { backgroundColor: act.glow }, { pointerEvents: 'none' }]} />
          <Image
            source={act.portrait}
            style={[styles.portrait, { aspectRatio: act.aspect }]}
            contentFit="contain"
            accessibilityElementsHidden
          />
          <ActCopy act={act} scale={scale} />
        </ScrollReveal>
      ))}

      <ScrollReveal style={styles.outro}>
        <Text style={styles.outroEyebrow}>{STAGE_OUTRO.eyebrow}</Text>
        <Text style={styles.outroTitle}>{STAGE_OUTRO.title}</Text>
        <Text style={styles.outroBody}>{STAGE_OUTRO.body}</Text>
        <View style={styles.outroPoints}>
          {STAGE_OUTRO.points.map((p) => (
            <View key={p.title} style={styles.outroPoint}>
              <Text style={styles.outroPointTitle}>{p.title}</Text>
              <Text style={styles.outroPointBody}>{p.body}</Text>
            </View>
          ))}
        </View>
      </ScrollReveal>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBlock: { paddingBottom: theme.spacing.xl },
  act: {
    position: 'relative',
    paddingVertical: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '14%',
    left: '8%',
    width: '84%',
    height: 240,
    borderRadius: 999,
    opacity: 0.32,
    // A blur this wide is the whole effect; without it the ellipse reads as a
    // solid pill instead of light.
    ...({ filter: 'blur(120px)' } as object),
  },
  portrait: {
    // Capped rather than full-bleed: stacked in normal flow, a 112%-height
    // portrait would push the quote a screen and a half down the page.
    height: 340,
    maxWidth: '100%',
    marginBottom: theme.spacing.xl,
  },
  outro: {
    paddingVertical: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  outroEyebrow: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 3.4,
    textTransform: 'uppercase',
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
  },
  outroTitle: {
    fontFamily: theme.fonts.display,
    fontSize: 36,
    lineHeight: 42,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  outroBody: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.md,
    lineHeight: 27,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 560,
  },
  outroPoints: { marginTop: theme.spacing.lg, gap: theme.spacing.md, width: '100%', maxWidth: 620 },
  outroPoint: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    gap: 5,
  },
  outroPointTitle: { fontFamily: theme.fonts.bodyBold, fontSize: theme.fontSize.sm, color: theme.colors.accent },
  outroPointBody: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.xs,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
});
