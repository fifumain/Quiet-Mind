import { Platform } from 'react-native';

/**
 * "Forest" glassmorphism design system.
 * The whole app lives on one dark forest gradient; surfaces are translucent
 * glass panels over it. Single visual world by design — no light/dark switch.
 */
export const theme = {
  /**
   * Background gradient (top -> bottom), used by GlassBackground.
   * Deliberately kept in a dark range: the gradient is viewport-fixed, so a
   * light stop would sit permanently under the bottom of every screen (where
   * the nav bar and the chat composer live) and sink text contrast there.
   * The green character comes from `auroraStops` instead, which is decorative.
   */
  gradient: ['#0E1F16', '#16301F', '#1F3A29', '#2A4A34'] as const,

  /**
   * Colours for the animated aurora — kept saturated, because the colour is
   * what gives the app its character. It's safe to keep them vivid only
   * because `scrim` below caps how much luminance ever reaches the text.
   */
  auroraStops: ['#13291C', '#3E7A57', '#58A97A'] as const,

  /**
   * Dark veil painted over the aurora and under all content. This is what
   * guarantees a contrast floor: without it a bright aurora ribbon becomes the
   * text backdrop and every readability guarantee below is off by 2-3x.
   */
  scrim: 'rgba(10,22,15,0.45)',

  colors: {
    // Text on the glass/gradient. Alphas are chosen so all three levels clear
    // 4.5:1 on the darkest AND lightest surface in the system (see the audit).
    textPrimary: '#F5F6F0',
    textSecondary: 'rgba(245,246,240,0.82)',
    textMuted: 'rgba(245,246,240,0.74)',
    /** Decorative only — never for text that carries information. */
    textFaint: 'rgba(245,246,240,0.58)',
    accent: '#E3D9A0', // warm sand — active states, highlights
    danger: '#E8B0A0',
  },

  /**
   * Glass surfaces. These *darken* what's behind them rather than lightening:
   * on a dark theme a white scrim raises the surface luminance and destroys
   * text contrast (especially over a bright aurora ribbon). A dark scrim plus
   * a light hairline border gives the same "frosted" read and keeps contrast
   * independent of whatever is drifting behind the panel.
   * Ordering is by prominence: `fillStrong` is the least-dark (most raised).
   */
  glass: {
    fillStrong: 'rgba(11,26,18,0.28)',
    fill: 'rgba(11,26,18,0.40)',
    fillSubtle: 'rgba(11,26,18,0.52)',
    border: 'rgba(255,255,255,0.42)',
    borderStrong: 'rgba(255,255,255,0.54)',
    /**
     * Selected/active affordance for chips, segments and tabs. Accent-tinted
     * rather than "lighter", because every surface fill here darkens — so
     * "more prominent" has to be signalled by hue, not by luminance.
     */
    selected: 'rgba(227,217,160,0.18)',
    selectedBorder: 'rgba(227,217,160,0.55)',
  },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  fontSize: { xs: 13, sm: 15, md: 17, lg: 22, xl: 28 },
  radius: { sm: 10, md: 16, lg: 20, pill: 999 },

  // "Wellness Calm" pairing (Lora serif for headings, Raleway sans for body),
  // loaded in app/_layout.tsx. Family names match @expo-google-fonts exports.
  fonts: {
    display: 'Lora_600SemiBold',
    displayMedium: 'Lora_500Medium',
    body: 'Raleway_400Regular',
    bodyMedium: 'Raleway_500Medium',
    bodySemibold: 'Raleway_600SemiBold',
    bodyBold: 'Raleway_700Bold',
  },

  // Soft layered depth on top of the glass (adopted from ui-ux-pro-max
  // "Soft UI Evolution" — softer than flat, no neumorphism). Web-only shadow.
  shadow: {
    card: { boxShadow: '0 12px 30px -14px rgba(0,0,0,0.55)' },
    cardHover: { boxShadow: '0 20px 46px -16px rgba(0,0,0,0.62)' },
  },
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
