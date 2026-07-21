import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

interface CardSwapProps {
  items: ReactNode[];
  width?: number;
  height?: number;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  skew?: number;
  /** Called with the index of the item currently at the front of the stack. */
  onActiveChange?: (index: number) => void;
}

interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Adapted from reactbits.dev's "Card Swap" — a 3D stack of cards that
 * auto-cycles: the front card drops, slides to the back, and the rest
 * promote forward. The original drives it with GSAP; this reproduces the
 * same choreography with direct DOM transform mutations + CSS transitions
 * (no extra dependency). Web-only: CardSwap.tsx renders a static stack on
 * native, which has no 3D-perspective DOM layer to animate.
 */
export function CardSwap({
  items,
  width = 420,
  height = 340,
  cardDistance = 52,
  verticalDistance = 60,
  delay = 3400,
  skew = 5,
  onActiveChange,
}: CardSwapProps) {
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  // Ref so a fresh inline callback each render doesn't retrigger the effect
  // below and reset the animation cycle.
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  useEffect(() => {
    const total = items.length;
    if (total === 0) return;

    const slot = (i: number): Slot => ({
      x: i * cardDistance,
      y: -i * verticalDistance,
      z: -i * cardDistance * 1.5,
      zIndex: total - i,
    });

    const place = (el: HTMLDivElement, s: Slot, animate: boolean, extraY = 0) => {
      el.style.transition = animate ? `transform 0.65s ${EASE}` : 'none';
      el.style.transform = `translate(-50%, -50%) translate3d(${s.x}px, ${s.y + extraY}px, ${s.z}px) skewY(${skew}deg)`;
      el.style.zIndex = String(s.zIndex);
    };

    let order = Array.from({ length: total }, (_, i) => i);

    // Initial placement, no animation.
    order.forEach((idx, i) => {
      const el = nodes.current[idx];
      if (el) place(el, slot(i), false);
    });
    onActiveChangeRef.current?.(order[0]);

    const dropTimers: ReturnType<typeof setTimeout>[] = [];

    const swap = () => {
      if (order.length < 2) return;
      const [front, ...rest] = order;
      const frontEl = nodes.current[front];
      if (!frontEl) return;

      // 1) Front card drops downward, still in front.
      place(frontEl, slot(0), true, height * 0.85);

      // 2) After the drop, promote the rest forward and send the front to back.
      const t = setTimeout(() => {
        rest.forEach((idx, i) => {
          const el = nodes.current[idx];
          if (el) place(el, slot(i), true);
        });
        const back = slot(total - 1);
        frontEl.style.zIndex = String(back.zIndex);
        place(frontEl, back, true);
        order = [...rest, front];
        onActiveChangeRef.current?.(order[0]);
      }, 360);
      dropTimers.push(t);
    };

    const interval = setInterval(swap, delay);
    return () => {
      clearInterval(interval);
      dropTimers.forEach(clearTimeout);
    };
  }, [items.length, width, height, cardDistance, verticalDistance, delay, skew]);

  const perspectiveStyle = { perspective: '1000px' } as unknown as object;

  return (
    <View style={[styles.container, { width, height }, perspectiveStyle]}>
      {items.map((item, i) => (
        <View
          key={i}
          ref={(node) => {
            nodes.current[i] = node as unknown as HTMLDivElement | null;
          }}
          style={[styles.card, { width, height }]}
        >
          {item}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  card: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    // transform + zIndex are driven imperatively in the effect.
  },
});
