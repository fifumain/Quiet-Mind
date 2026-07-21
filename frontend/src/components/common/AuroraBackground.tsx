interface AuroraBackgroundProps {
  colorStops?: [string, string, string];
  amplitude?: number;
  blend?: number;
  speed?: number;
}

// Native fallback — no DOM/canvas to mount a WebGL renderer into, and the
// `ogl` package must never even be required() on native. GlassBackground's
// plain gradient carries the visual on iOS/Android.
export function AuroraBackground(_props: AuroraBackgroundProps) {
  return null;
}
