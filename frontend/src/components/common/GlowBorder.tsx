import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { theme } from '../../theme/theme';

interface GlowBorderProps {
  children: ReactNode;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}

/**
 * Soft pulsing glow behind a control — reactbits.dev's "Star Border" /
 * "Electric Border", simplified to an animated halo since RN's shadow API
 * can't animate a gradient border the way CSS can.
 */
export function GlowBorder({ children, active = true, style, radius = theme.radius.md }: GlowBorderProps) {
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    if (!active) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [active, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: active ? pulse.value : 0,
  }));

  return (
    <Animated.View style={style}>
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { borderRadius: radius + 6 }, glowStyle]}
      />
      <Animated.View style={[styles.content, { borderRadius: radius }]}>{children}</Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  content: { overflow: 'hidden' },
});
