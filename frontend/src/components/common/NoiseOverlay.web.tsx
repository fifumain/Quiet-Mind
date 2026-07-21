import { StyleSheet, View } from 'react-native';

// Static fractal-noise grain via an inline SVG filter (data URI) — cheaper
// than reactbits.dev's animated canvas noise and plenty for taking the flat
// "plastic" edge off a CSS gradient. Web-only: RN has no CSS background-image.
const NOISE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function NoiseOverlay() {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundImage: `url("${NOISE_SVG}")`,
          opacity: 0.05,
          mixBlendMode: 'overlay',
        } as object,
      ]}
    />
  );
}
