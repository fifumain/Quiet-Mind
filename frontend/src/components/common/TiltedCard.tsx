import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const MAX_TILT_DEG = 10;

interface TiltedCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Subtle 3D tilt that follows a drag — reactbits.dev's "Tilted Card", built
 * on a pan gesture so it responds to touch-drag on mobile and mouse-drag on
 * web alike. Only used on non-interactive cards (no onPress underneath) to
 * avoid fighting a tap gesture for the same surface.
 */
export function TiltedCard({ children, style }: TiltedCardProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      rotateY.value = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, e.translationX / 8));
      rotateX.value = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, -e.translationY / 8));
    })
    .onEnd(() => {
      rotateX.value = withSpring(0);
      rotateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}
