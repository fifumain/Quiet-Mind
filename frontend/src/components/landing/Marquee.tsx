import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { glassBlur, theme } from '../../theme/theme';
import { injectKeyframes } from './injectKeyframes';

// Two copies only loop seamlessly if a single copy is already wider than the
// viewport. With a short pill list (topics) a single copy is often narrower
// than the screen, so the second copy's seam becomes visible mid-scroll and
// the loop reads as an abrupt restart instead of one continuous strip.
// Repeating N times keeps the same absolute scroll speed (the translate
// distance is always exactly one copy's width, from -100/N %) while making
// it very unlikely the whole track is ever narrower than the viewport.
const REPEAT = 4;

/**
 * Infinite horizontal ticker of pills — reactbits.dev's "Logo Loop", here
 * carrying topics/authors. Web animates a duplicated track with a CSS
 * keyframe translate; native renders a single static row (no marquee).
 */
export function Marquee({ items }: { items: string[] }) {
  useEffect(() => {
    injectKeyframes(
      'marquee',
      `@keyframes rb-marquee { from { transform: translateX(0); } to { transform: translateX(-${100 / REPEAT}%); } }`,
    );
  }, []);

  const isWeb = Platform.OS === 'web';
  const track = isWeb ? Array.from({ length: REPEAT }, () => items).flat() : items;

  const trackStyle = isWeb
    ? ({
        flexDirection: 'row',
        gap: theme.spacing.sm,
        animationName: 'rb-marquee',
        animationDuration: '32s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
        width: 'max-content',
      } as unknown as object)
    : { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' as const, justifyContent: 'center' as const };

  return (
    // One backdrop-filter on the static viewport instead of one per pill —
    // with REPEAT copies that's dozens of live-animating blur regions
    // collapsed into a single, unmoving one (the pills underneath are just a
    // flat translucent fill, no per-pill blur), which is what was making the
    // ticker stutter.
    <View style={[styles.viewport, glassBlur(14)]}>
      <View style={trackStyle}>
        {track.map((item, i) => (
          <View key={`${item}-${i}`} style={styles.pill}>
            <Text style={styles.pillText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { overflow: 'hidden', width: '100%' },
  pill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    backgroundColor: theme.glass.fillSubtle,
  },
  pillText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: '600' },
});
