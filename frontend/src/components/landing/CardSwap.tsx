import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';

interface CardSwapProps {
  items: ReactNode[];
  width?: number;
  height?: number;
  // Accepted for API parity with CardSwap.web.tsx; unused in the static stack.
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  skew?: number;
  onActiveChange?: (index: number) => void;
}

// Native fallback — no 3D-perspective DOM layer to drive the swap
// choreography, so the cards just stack vertically at a fixed size (which
// also keeps them equal-height). The web build (CardSwap.web.tsx) animates.
export function CardSwap({ items, width = 320, height = 300, onActiveChange }: CardSwapProps) {
  useEffect(() => {
    onActiveChange?.(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.column}>
      {items.map((item, i) => (
        <View key={i} style={{ width, height }}>
          {item}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { gap: theme.spacing.lg, alignItems: 'center' },
});
