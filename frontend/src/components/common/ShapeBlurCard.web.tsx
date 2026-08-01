import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { noPointer } from './noPointer';

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
 *
 * The rect is cached rather than measured per mousemove: `getBoundingClientRect`
 * forces a synchronous layout, and with a list of these the cursor crossing the
 * screen triggered one flush per card per pointer event.
 */
export function ShapeBlurCard({ children, style }: ShapeBlurCardProps) {
  const wrapRef = useRef<View>(null);
  const glowRef = useRef<View>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Invalidate on anything that can move the element; re-measured lazily on
    // the next hover rather than eagerly here.
    const invalidate = () => {
      rectRef.current = null;
    };
    window.addEventListener('resize', invalidate);
    document.addEventListener('scroll', invalidate, { capture: true, passive: true });
    return () => {
      window.removeEventListener('resize', invalidate);
      document.removeEventListener('scroll', invalidate, true);
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleMove = (event: { nativeEvent: { clientX: number; clientY: number } }) => {
    const wrap = wrapRef.current as unknown as HTMLDivElement | null;
    const glow = glowRef.current as unknown as HTMLDivElement | null;
    if (!wrap || !glow) return;

    if (!rectRef.current) rectRef.current = wrap.getBoundingClientRect();
    const rect = rectRef.current;
    const { clientX, clientY } = event.nativeEvent;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Coalesce to one style write per frame — pointermove fires far more often
    // than the compositor can repaint a backdrop-filtered panel.
    if (frameRef.current != null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      glow.style.background = `radial-gradient(180px circle at ${x}px ${y}px, rgba(245,246,240,0.16), transparent 70%)`;
    });
  };

  const handleLeave = () => {
    rectRef.current = null;
    const glow = glowRef.current as unknown as HTMLDivElement | null;
    if (glow) glow.style.background = 'transparent';
  };

  return (
    // @ts-expect-error — onMouseMove/onMouseLeave pass through to the underlying DOM node on web.
    <View ref={wrapRef} style={[styles.wrap, style]} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <View ref={glowRef} style={[StyleSheet.absoluteFill, noPointer]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', overflow: 'hidden' },
});
