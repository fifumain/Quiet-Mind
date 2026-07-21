import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

interface ScrollRevealProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

// Native fallback — no IntersectionObserver / scroll viewport hook here, so
// children render immediately. The web build (ScrollReveal.web.tsx) does the
// scroll-triggered fade+rise.
export function ScrollReveal({ children, style }: ScrollRevealProps) {
  return <View style={style}>{children}</View>;
}
