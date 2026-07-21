import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

interface ScrollRevealProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

/**
 * Fades + rises its children the first time they scroll into view —
 * reactbits.dev's "Scroll Reveal" / "Animated Content". Web uses an
 * IntersectionObserver on the underlying DOM node; native has no scroll
 * viewport hook here, so ScrollReveal.tsx just renders children as-is.
 */
export function ScrollReveal({ children, style, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<View>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current as unknown as HTMLElement | null;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const revealStyle = {
    opacity: visible ? 1 : 0,
    transform: [{ translateY: visible ? 0 : 32 }],
    transitionProperty: 'opacity, transform',
    transitionDuration: '700ms',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    transitionDelay: `${delay}ms`,
  } as unknown as ViewStyle;

  return (
    <View ref={ref} style={[style, revealStyle]}>
      {children}
    </View>
  );
}
