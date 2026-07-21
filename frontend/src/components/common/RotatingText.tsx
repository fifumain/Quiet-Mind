import { useEffect, useState } from 'react';
import { Text, type TextStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface RotatingTextProps {
  phrases: string[];
  interval?: number;
  style?: TextStyle;
}

/** Cycles through phrases with a crossfade — reactbits.dev's "Rotating Text". */
export function RotatingText({ phrases, interval = 3200, style }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % phrases.length), interval);
    return () => clearInterval(timer);
  }, [phrases.length, interval]);

  return (
    <Animated.View key={index} entering={FadeIn.duration(350)} exiting={FadeOut.duration(250)}>
      <Text style={style}>{phrases[index]}</Text>
    </Animated.View>
  );
}
