import { useEffect } from 'react';
import { Platform, Text, type TextStyle } from 'react-native';
import { theme } from '../../theme/theme';
import { injectKeyframes } from './injectKeyframes';

interface ShinyTextProps {
  children: string;
  style?: TextStyle;
}

/**
 * A light sweep travels across the text — reactbits.dev's "Shiny Text". Web
 * clips a moving gradient to the glyphs; native has no background-clip:text,
 * so it falls back to the muted colour (no shimmer, still legible).
 */
export function ShinyText({ children, style }: ShinyTextProps) {
  useEffect(() => {
    injectKeyframes(
      'shiny-text',
      `@keyframes rb-shine { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }`,
    );
  }, []);

  if (Platform.OS === 'web') {
    const webStyle = {
      backgroundImage: `linear-gradient(110deg, ${theme.colors.textMuted} 40%, ${theme.colors.textPrimary} 50%, ${theme.colors.textMuted} 60%)`,
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      animationName: 'rb-shine',
      animationDuration: '4s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear',
    } as unknown as TextStyle;
    return <Text style={[style, webStyle]}>{children}</Text>;
  }

  return <Text style={[style, { color: theme.colors.textMuted }]}>{children}</Text>;
}
