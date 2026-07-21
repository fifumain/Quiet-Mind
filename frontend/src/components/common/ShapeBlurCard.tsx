import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

interface ShapeBlurCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Native fallback — no persistent pointer to track (touch has no hover),
// so the cursor-follow glow from ShapeBlurCard.web.tsx has nothing to key
// off of here. Just passes children through.
export function ShapeBlurCard({ children, style }: ShapeBlurCardProps) {
  return <View style={style}>{children}</View>;
}
