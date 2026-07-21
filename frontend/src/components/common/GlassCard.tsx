import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { glassBlur, theme } from '../../theme/theme';
import { ShapeBlurCard } from './ShapeBlurCard';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
}

/**
 * Translucent glass panel over the gradient. Wrapped in ShapeBlurCard so
 * every non-chat card (Today, Library, quote/book detail) gets the
 * cursor-follow glow — see ShapeBlurCard for why that's a lightweight CSS
 * adaptation rather than one WebGL context per card.
 */
export function GlassCard({ children, style, strong }: GlassCardProps) {
  return (
    <ShapeBlurCard style={[styles.card, strong && styles.strong, glassBlur(), style]}>
      {children}
    </ShapeBlurCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.glass.fill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  strong: {
    backgroundColor: theme.glass.fillStrong,
    borderColor: theme.glass.borderStrong,
  },
});
