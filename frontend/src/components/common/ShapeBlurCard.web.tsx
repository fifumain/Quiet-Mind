import type { ReactNode } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface ShapeBlurCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Adapted from reactbits.dev's "Shape Blur" — the original renders one
 * WebGL (three.js) shader per instance, tracking the cursor to carve a
 * sharp reveal out of a blurred shape. Running one WebGL context per card
 * across a whole grid (Library can show a dozen+ at once) would burn
 * through the browser's concurrent-context limit and tank scroll perf, so
 * this ports the same idea — a soft light that follows the cursor — as a
 * cheap CSS radial-gradient mutated directly via ref (no React re-render
 * per mousemove). Web-only: native has no persistent pointer to track.
 */
export function ShapeBlurCard({ children, style }: ShapeBlurCardProps) {
  const wrapRef = useRef<View>(null);
  const glowRef = useRef<View>(null);

  const handleMove = (event: { nativeEvent: { clientX: number; clientY: number } }) => {
    const wrap = wrapRef.current as unknown as HTMLDivElement | null;
    const glow = glowRef.current as unknown as HTMLDivElement | null;
    if (!wrap || !glow) return;
    const rect = wrap.getBoundingClientRect();
    const { clientX, clientY } = event.nativeEvent;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    glow.style.background = `radial-gradient(180px circle at ${x}px ${y}px, rgba(245,246,240,0.16), transparent 70%)`;
  };

  const handleLeave = () => {
    const glow = glowRef.current as unknown as HTMLDivElement | null;
    if (glow) glow.style.background = 'transparent';
  };

  return (
    // @ts-expect-error — onMouseMove/onMouseLeave pass through to the underlying DOM node on web.
    <View ref={wrapRef} style={[styles.wrap, style]} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <View ref={glowRef} pointerEvents="none" style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', overflow: 'hidden' },
});
