import type { ReactNode } from 'react';
import { StageStatic } from './StageStatic';

/**
 * Native fallback for the pinned landing stage.
 *
 * There is no scroll-driven pinning to hook into here (and the landing is a
 * web surface anyway — mobile users go straight into the app), so the scenes
 * render as ordinary stacked sections. See PinnedStage.web.tsx for the real
 * thing.
 */
export function PinnedStage({
  hero,
  scale,
}: {
  hero: ReactNode;
  scale: number;
  enabled?: boolean;
  /** Only meaningful on the pinned web stage — nothing to park it against here. */
  aside?: ReactNode;
}) {
  return <StageStatic hero={hero} scale={scale} />;
}
