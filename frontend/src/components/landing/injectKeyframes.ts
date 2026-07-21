import { Platform } from 'react-native';

const injected = new Set<string>();

/**
 * Injects a raw CSS block (usually @keyframes) into the document head once
 * per id. react-native-web's StyleSheet can't express keyframe animations,
 * so landing shimmer/marquee effects reach for real CSS. No-op on native.
 */
export function injectKeyframes(id: string, css: string) {
  if (Platform.OS !== 'web' || injected.has(id)) return;
  if (typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.setAttribute('data-inject-id', id);
  style.textContent = css;
  document.head.appendChild(style);
  injected.add(id);
}
