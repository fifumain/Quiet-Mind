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
      <AuroraBackground colorStops={[theme.gradient[0], theme.gradient[2], theme.gradient[3]]} />
      <NoiseOverlay />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
