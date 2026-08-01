import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';
import { AuroraBackground } from './AuroraBackground';
import { NoiseOverlay } from './NoiseOverlay';

/**
 * The forest gradient every screen sits on. On web, a live WebGL aurora
 * (see AuroraBackground.web.tsx) plays over the static gradient; native
 * has no canvas to mount it into, so AuroraBackground.tsx there is a no-op
 * and the plain gradient alone carries the look.
 */
export function GlassBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <AuroraBackground colorStops={[theme.auroraStops[0], theme.auroraStops[1], theme.auroraStops[2]]} />
      {/*
       * Contrast floor. The aurora is deliberately saturated, which means a
       * bright ribbon would otherwise become the backdrop for whatever text is
       * over it. This veil caps how light the background can ever get, so the
       * readability guarantees in theme.ts hold no matter where the ribbons
       * drift. It sits above the aurora and below all content.
       */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.scrim]} />
      <NoiseOverlay />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { backgroundColor: theme.scrim },
});
