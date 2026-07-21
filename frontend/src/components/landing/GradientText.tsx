import { useEffect } from 'react';
import { Platform, Text, type TextStyle } from 'react-native';
import { theme } from '../../theme/theme';
import { injectKeyframes } from './injectKeyframes';

interface GradientTextProps {
  children: string;
  style?: TextStyle;
  colors?: string[];
  speed?: number;
}

/**
 * Gradient-filled text that drifts back and forth — reactbits.dev's
 * "Gradient Text". On web this clips a moving CSS linear-gradient to the
 * glyphs (background-position animated via CSS keyframes, alternating for a
 * yoyo motion — no animation library needed); native RN has no
 * background-clip:text, so it falls back to the solid accent colour (still
 * on-brand, just not gradient/animated).
 */
export function GradientText({
  children,
  style,
  colors = [theme.colors.accent, theme.colors.textPrimary, theme.colors.accent],
  speed = 6,
}: GradientTextProps) {
  useEffect(() => {
    injectKeyframes(
      'gradient-text',
      `@keyframes rb-gradient-text { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }`,
    );
  }, []);

  if (Platform.OS === 'web') {
    // Repeat the first colour at the end so the alternating sweep loops seamlessly.
    const gradientColors = [...colors, colors[0]].join(', ');
    const webStyle = {
      backgroundImage: `linear-gradient(90deg, ${gradientColors})`,
      backgroundSize: '300% 100%',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      animationName: 'rb-gradient-text',
      animationDuration: `${speed}s`,
      animationIterationCount: 'infinite',
      animationTimingFunction: 'ease-in-out',
      animationDirection: 'alternate',
    } as unknown as TextStyle;
    return <Text style={[style, webStyle]}>{children}</Text>;
  }

  return <Text style={[style, { color: colors[0] }]}>{children}</Text>;
}
