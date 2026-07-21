// Native fallback — no CSS background-image/mix-blend-mode to draw the grain
// with; the plain gradient in GlassBackground carries the look on iOS/Android.
export function NoiseOverlay() {
  return null;
}
