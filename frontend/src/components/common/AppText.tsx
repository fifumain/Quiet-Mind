import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { theme } from '../../theme/theme';

/**
 * App-wide replacement for react-native's `Text`.
 *
 * Two jobs:
 *  1. Applies the Raleway body font everywhere, so screens don't silently fall
 *     back to the platform system font (they nearly all did before this).
 *  2. Translates `fontWeight` into the matching Raleway family. Custom fonts
 *     on native don't synthesise weights — `fontWeight: '700'` on
 *     `Raleway_400Regular` renders as regular. Callers keep writing plain
 *     `fontWeight`, and this maps it to the real family and drops the weight
 *     so the two can't disagree.
 *
 * `fontFamily` passed explicitly (e.g. `theme.fonts.display` for headings)
 * always wins — the mapping only fills in when none was given.
 */

const BODY_BY_WEIGHT: Record<string, string> = {
  '100': theme.fonts.body,
  '200': theme.fonts.body,
  '300': theme.fonts.body,
  '400': theme.fonts.body,
  normal: theme.fonts.body,
  '500': theme.fonts.bodyMedium,
  '600': theme.fonts.bodySemibold,
  '700': theme.fonts.bodyBold,
  bold: theme.fonts.bodyBold,
  '800': theme.fonts.bodyBold,
  '900': theme.fonts.bodyBold,
};

export function Text({ style, ...rest }: TextProps) {
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;

  if (flat?.fontFamily) {
    // Explicit family (display/serif headings) — leave it, but still strip the
    // weight so it can't fight the family's own weight.
    const { fontWeight, ...withoutWeight } = flat;
    void fontWeight;
    return <RNText style={withoutWeight} {...rest} />;
  }

  const weight = flat?.fontWeight != null ? String(flat.fontWeight) : '400';
  const { fontWeight, ...withoutWeight } = flat ?? {};
  void fontWeight;

  return <RNText style={[{ fontFamily: BODY_BY_WEIGHT[weight] ?? theme.fonts.body }, withoutWeight]} {...rest} />;
}
