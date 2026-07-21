import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, type SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { theme } from '../../theme/theme';

const SPARK_COUNT = 6;
const SPARK_DISTANCE = 22;

interface ClickSparkProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Small particle burst at the tap point on press — reactbits.dev's "Click Spark". */
export function ClickSpark({ children, onPress, disabled, style }: ClickSparkProps) {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);

  const handlePress = (event: { nativeEvent: { locationX: number; locationY: number } }) => {
    const { locationX, locationY } = event.nativeEvent;
    const id = Date.now() + Math.random();
    setBursts((prev) => [...prev, { id, x: locationX, y: locationY }]);
    setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 420);
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled} style={[styles.wrap, style]}>
      {children}
      {bursts.map((burst) => (
        <Burst key={burst.id} x={burst.x} y={burst.y} />
      ))}
    </Pressable>
  );
}

function Burst({ x, y }: { x: number; y: number }) {
  const progress = useSharedValue(0);
  progress.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });

  return (
    <>
      {Array.from({ length: SPARK_COUNT }).map((_, i) => {
        const angle = (i / SPARK_COUNT) * Math.PI * 2;
        return <SparkDot key={i} x={x} y={y} angle={angle} progress={progress} />;
      })}
    </>
  );
}

function SparkDot({
  x,
  y,
  angle,
  progress,
}: {
  x: number;
  y: number;
  angle: number;
  progress: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = progress.value * SPARK_DISTANCE;
    return {
      opacity: 1 - progress.value,
      transform: [
        { translateX: x + Math.cos(angle) * distance - 2 },
        { translateY: y + Math.sin(angle) * distance - 2 },
      ],
    };
  });

  return <Animated.View pointerEvents="none" style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
  },
});
