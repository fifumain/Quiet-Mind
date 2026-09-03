import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../common/AppText';
import { injectKeyframes } from '../landing/injectKeyframes';
import { noPointer } from '../common/noPointer';
import { theme } from '../../theme/theme';
import type { FlowingMenuRowProps } from './FlowingMenuRow';

/**
 * reactbits.dev's "Flowing Menu": each row idles as a plain label, and on
 * hover a solid panel slides in from whichever edge — top or bottom — the
 * cursor entered from, carrying a horizontally-looping marquee of the same
 * label. Leaving slides it back out toward the edge the cursor left from,
 * rather than always retreating the way it came.
 *
 * Direction is read straight off the raw DOM MouseEvent's `clientY` against
 * the row's own bounding rect — the same "read a live DOM property from a ref
 * inside a plain onMouseEnter/onMouseLeave" trick GlareHover uses, just with
 * the event kept instead of discarded, since here the direction depends on it.
 * The panel's transform is mutated directly rather than through React state,
 * so hovering never re-renders the row.
 */
const REPEAT = 6;

/**
 * Kept as a plain object rather than folded into the `styles` StyleSheet
 * below: RNW's `StyleSheet.create` runs every entry through a dev-mode
 * validator that silently deletes `animationName` (it wants the newer
 * `animationKeyframes` API instead, which takes the keyframe object directly
 * rather than a name string injected into a stylesheet elsewhere). Passing it
 * as a plain object in the `style` array — exactly how Marquee.tsx's own
 * track animation gets through — bypasses that validator entirely.
 */
const trackAnimationStyle = {
  animationName: 'rb-flowing-menu-track',
  animationDuration: '14s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
} as unknown as object;

export function FlowingMenuRow({ label, Icon, onPress }: FlowingMenuRowProps) {
  const panelRef = useRef<View>(null);

  useEffect(() => {
    injectKeyframes(
      'flowing-menu-track',
      `@keyframes rb-flowing-menu-track { from { transform: translateX(0); } to { transform: translateX(-${100 / REPEAT}%); } }`,
    );
    // Parked off the bottom edge on mount. Set imperatively rather than
    // through the `panel` StyleSheet entry, purely to keep every transform on
    // this element going through the one `el.style.transform` code path below
    // instead of half living in a StyleSheet array RNW would have to resolve
    // the same percentage strings through anyway.
    const el = panelRef.current as unknown as HTMLElement | null;
    if (el) el.style.transform = 'translateY(101%)';
  }, []);

  const edgeOf = (e: { clientY?: number; currentTarget?: EventTarget | null }): 'top' | 'bottom' => {
    const el = e.currentTarget as HTMLElement | null;
    if (!el || typeof e.clientY !== 'number') return 'bottom';
    const rect = el.getBoundingClientRect();
    return e.clientY - rect.top < rect.height / 2 ? 'top' : 'bottom';
  };

  const slide = (edge: 'top' | 'bottom', visible: boolean) => {
    const el = panelRef.current as unknown as HTMLElement | null;
    if (!el) return;
    if (visible) {
      // Snap to the entry edge with no transition, then animate in — otherwise
      // the panel would visibly travel from wherever it last exited to.
      el.style.transitionDuration = '0ms';
      el.style.transform = `translateY(${edge === 'top' ? '-101%' : '101%'})`;
      // Forces the browser to apply the transform above before the next line
      // re-enables the transition, or the two would get batched into one frame
      // and the "snap" would never actually happen.
      void el.offsetHeight;
      el.style.transitionDuration = '480ms';
      el.style.transform = 'translateY(0%)';
    } else {
      el.style.transitionDuration = '480ms';
      el.style.transform = `translateY(${edge === 'top' ? '-101%' : '101%'})`;
    }
  };

  return (
    <View
      style={styles.row}
      // @ts-expect-error — onMouseEnter/onMouseLeave pass the raw DOM MouseEvent through on web.
      onMouseEnter={(e) => slide(edgeOf(e), true)}
      // @ts-expect-error — see above.
      onMouseLeave={(e) => slide(edgeOf(e), false)}
    >
      <Pressable onPress={onPress} style={styles.pressable} accessibilityRole="button" accessibilityLabel={label}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.iconWrap}>
          <Icon size={20} color={theme.colors.textPrimary} strokeWidth={2} />
        </View>
      </Pressable>

      <View ref={panelRef} style={[styles.panel, noPointer]}>
        <View style={[styles.track, trackAnimationStyle]}>
          {Array.from({ length: REPEAT }).map((_, i) => (
            <View key={i} style={styles.trackItem}>
              <Text style={styles.trackText}>{label}</Text>
              <Icon size={22} color={theme.gradient[0]} strokeWidth={2} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'relative',
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: theme.glass.border,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 84,
    paddingHorizontal: theme.spacing.lg,
  },
  label: { fontFamily: theme.fonts.display, fontSize: 24, color: theme.colors.textPrimary },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    overflow: 'hidden',
    // Only `transitionProperty`/`-timing-function` live here; `slide()` is the
    // sole place that sets `transitionDuration` and `transform`, so idle vs.
    // hovered can never end up disagreeing about which one is current.
    transitionProperty: 'transform',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  } as unknown as object,
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
    width: 'max-content',
  } as unknown as object,
  trackItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  trackText: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 22,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: theme.gradient[0],
  },
});
