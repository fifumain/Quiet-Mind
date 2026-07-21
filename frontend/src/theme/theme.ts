import { Platform } from 'react-native';

/**
 * "Forest" glassmorphism design system.
 * The whole app lives on one dark forest gradient; surfaces are translucent
 * glass panels over it. Single visual world by design — no light/dark switch.
 */
export const theme = {
  // Background gradient (top -> bottom), used by GlassBackground.
  gradient: ['#0E1F16', '#1E3B29', '#4C7A5C', '#A8C99B'] as const,

  colors: {
    // Text on the glass/gradient.
    textPrimary: '#F5F6F0',
    textSecondary: 'rgba(245,246,240,0.72)',
    textMuted: 'rgba(245,246,240,0.55)',
    accent: '#E3D9A0', // warm sand — active states, highlights
    danger: '#E8B0A0',
  },

  // Translucent glass surfaces layered over the gradient.
  glass: {
    fill: 'rgba(255,255,255,0.13)',
    fillStrong: 'rgba(255,255,255,0.20)',
    fillSubtle: 'rgba(255,255,255,0.09)',
    border: 'rgba(255,255,255,0.22)',
    borderStrong: 'rgba(255,255,255,0.30)',
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  fontSize: { xs: 13, sm: 15, md: 17, lg: 22, xl: 28 },
  radius: { sm: 10, md: 16, lg: 20, pill: 999 },
};

/**
 * backdrop-filter blur works on web (via react-native-web passthrough) but not
 * in plain RN Views — native builds will layer expo-blur later. Returning the
 * web style only on web keeps native from choking on the unknown prop.
 */
export function glassBlur(amount = 18) {
  if (Platform.OS !== 'web') return {};
  return {
    backdropFilter: `blur(${amount}px)`,
    WebkitBackdropFilter: `blur(${amount}px)`,
  } as const;
}
