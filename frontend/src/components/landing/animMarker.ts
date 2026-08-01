/**
 * Tags a node so the landing's GSAP timeline can find it.
 *
 * The pinned stage choreographs roughly ten properties per act. Forwarding a ref
 * for each one would mean threading ten callbacks through ActCopy's props; a
 * `data-anim` attribute lets the engine query them out of its own layer instead,
 * and lets the static fallback render identical markup with nothing wired up.
 *
 * `dataSet` is a react-native-web extension that becomes `data-*` in the DOM, and
 * React Native's own prop types don't declare it — hence the cast. No-op on
 * native, where the attribute is simply ignored.
 */
export function anim(name: string) {
  return { dataSet: { anim: name } } as object;
}
