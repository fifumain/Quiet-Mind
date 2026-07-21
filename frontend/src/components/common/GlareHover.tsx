import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

interface GlareHoverProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Native fallback — no hover state on touch, so the light sweep from
// GlareHover.web.tsx has nothing to trigger it. Just passes children through.
export function GlareHover({ children, style }: GlareHoverProps) {
  return <View style={style}>{children}</View>;
}
