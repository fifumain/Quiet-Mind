import { useEffect, useRef, useState } from 'react';
import { Text, type TextStyle } from 'react-native';

interface CountUpProps {
  target: number;
  duration?: number;
  style?: TextStyle;
}

/** Animates a number counting up to its target — reactbits.dev's "Count Up", plain RN. */
export function CountUp({ target, duration = 700, style }: CountUpProps) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = Date.now();
    let frame: ReturnType<typeof requestAnimationFrame>;

    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return <Text style={style}>{value}</Text>;
}
