import type { ReactNode } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface GlareHoverProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * A diagonal light streak sweeps across the surface on hover — reactbits.dev's
 * "Glare Hover". Toggled by mutating the glare layer's transform/opacity
 * directly via ref on mouseenter/leave (same no-re-render trick as
 * ShapeBlurCard) rather than React state, so hovering never triggers a
 * re-render of whatever this wraps.
 */
export function GlareHover({ children, style }: GlareHoverProps) {
  const glareRef = useRef<View>(null);

  const setGlare = (visible: boolean) => {
    const el = glareRef.current as unknown as HTMLDivElement | null;
    if (!el) return;
    el.style.transform = `translateX(${visible ? '260%' : '-40%'}) skewX(-20deg)`;
    el.style.opacity = visible ? '1' : '0';
  };

  return (
    // @ts-expect-error — onMouseEnter/onMouseLeave pass through to the underlying DOM node on web.
    <View style={[styles.wrap, style]} onMouseEnter={() => setGlare(true)} onMouseLeave={() => setGlare(false)}>
      <View ref={glareRef} pointerEvents="none" style={styles.glare} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', overflow: 'hidden' },
  glare: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    left: '-10%',
    width: '40%',
    backgroundColor: 'rgba(245,246,240,0.14)',
    opacity: 0,
    transitionProperty: 'transform, opacity',
    transitionDuration: '650ms',
    transitionTimingFunction: 'ease',
  } as unknown as ViewStyle,
});
