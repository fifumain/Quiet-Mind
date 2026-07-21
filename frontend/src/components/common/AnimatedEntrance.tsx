import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AnimatedEntranceProps {
  index?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Staggered fade+slide-up entrance, reused across list cards, today's
 * cards, and chat bubbles — inspired by reactbits.dev's "Animated List".
 */
export function AnimatedEntrance({ index = 0, children, style }: AnimatedEntranceProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 12) * 60)
        .duration(420)
        .springify()
        .damping(16)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
