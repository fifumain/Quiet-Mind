import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import type { components } from '../../api/generated/schema';
import type { CourseProgress } from '../../hooks/useCourses';
import { theme } from '../../theme/theme';
import { CourseCard } from './CourseCard';
import { CourseDetailPanel } from './CourseDetailPanel';

type CourseList = components['schemas']['CourseList'];

export interface CourseExpandableGridProps {
  courses: CourseList[];
  progressById: Map<number, CourseProgress>;
  onOpenCourse: (slug: string) => void;
}

const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const OPEN_MS = 620;
const CLOSE_MS = 420;

function reduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function centeredRect() {
  const w = Math.min(560, window.innerWidth * 0.92);
  const h = Math.min(window.innerHeight * 0.84, 660);
  return { left: (window.innerWidth - w) / 2, top: (window.innerHeight - h) / 2, width: w, height: h };
}

/**
 * Web: the Aceternity-style "expandable card" — the tapped card grows out of
 * its grid slot into a centered modal via a FLIP (animating left/top/width/
 * height so text never distorts), over a blurred backdrop. Same direct-DOM +
 * CSS-transition technique as CardSwap.web.tsx (no framer-motion in this app).
 */
export function CourseExpandableGrid({ courses, progressById, onOpenCourse }: CourseExpandableGridProps) {
  const [active, setActive] = useState<CourseList | null>(null);
  const cardEls = useRef<Map<number, HTMLElement>>(new Map());
  const modalEl = useRef<View>(null);
  const backdropEl = useRef<View>(null);
  const sourceId = useRef<number | null>(null);

  const modalNode = () => modalEl.current as unknown as HTMLElement | null;
  const backdropNode = () => backdropEl.current as unknown as HTMLElement | null;

  // Open FLIP: runs after the modal mounts for the newly-active course.
  useLayoutEffect(() => {
    if (!active) return;
    const modal = modalNode();
    const backdrop = backdropNode();
    if (!modal) return;
    const dest = centeredRect();
    if (backdrop) {
      backdrop.style.transition = `opacity ${OPEN_MS}ms ${EASE}`;
      requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
      });
    }
    const src = cardEls.current.get(active.id);
    if (reduced() || !src) {
      Object.assign(modal.style, {
        transition: 'none',
        left: `${dest.left}px`,
        top: `${dest.top}px`,
        width: `${dest.width}px`,
        height: `${dest.height}px`,
        opacity: '1',
      });
      return;
    }
    const first = src.getBoundingClientRect();
    Object.assign(modal.style, {
      transition: 'none',
      left: `${first.left}px`,
      top: `${first.top}px`,
      width: `${first.width}px`,
      height: `${first.height}px`,
      opacity: '1',
    });
    modal.getBoundingClientRect(); // force reflow so the next frame animates
    requestAnimationFrame(() => {
      modal.style.transition = `left ${OPEN_MS}ms ${EASE}, top ${OPEN_MS}ms ${EASE}, width ${OPEN_MS}ms ${EASE}, height ${OPEN_MS}ms ${EASE}`;
      Object.assign(modal.style, {
        left: `${dest.left}px`,
        top: `${dest.top}px`,
        width: `${dest.width}px`,
        height: `${dest.height}px`,
      });
    });
  }, [active]);

  const close = useCallback(() => {
    const modal = modalNode();
    const backdrop = backdropNode();
    if (backdrop) backdrop.style.opacity = '0';
    const src = sourceId.current != null ? cardEls.current.get(sourceId.current) : null;
    if (reduced() || !modal || !src) {
      setActive(null);
      return;
    }
    const first = src.getBoundingClientRect();
    modal.style.transition = `left ${CLOSE_MS}ms ${EASE}, top ${CLOSE_MS}ms ${EASE}, width ${CLOSE_MS}ms ${EASE}, height ${CLOSE_MS}ms ${EASE}, opacity .3s ease`;
    Object.assign(modal.style, {
      left: `${first.left}px`,
      top: `${first.top}px`,
      width: `${first.width}px`,
      height: `${first.height}px`,
      opacity: '0',
    });
    const done = () => {
      modal.removeEventListener('transitionend', done);
      modal.style.opacity = '1';
      setActive(null);
    };
    modal.addEventListener('transitionend', done);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close]);

  const open = (course: CourseList) => {
    sourceId.current = course.id;
    setActive(course);
  };

  return (
    <>
      <View style={styles.grid as object}>
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            progress={progressById.get(c.id)}
            onPress={() => open(c)}
            ref={(node) => {
              const el = node as unknown as HTMLElement | null;
              if (el) cardEls.current.set(c.id, el);
              else cardEls.current.delete(c.id);
            }}
          />
        ))}
      </View>

      <View
        ref={backdropEl}
        // @ts-expect-error web-only DOM props/styles
        onClick={close}
        style={[styles.backdrop as object, { display: active ? 'flex' : 'none' } as object]}
      />
      <View ref={modalEl} style={[styles.modal as object, { display: active ? 'flex' : 'none' } as object]}>
        {active ? (
          <CourseDetailPanel
            course={active}
            progress={progressById.get(active.id)}
            onClose={close}
            onOpen={() => {
              const slug = active.slug;
              close();
              onOpenCourse(slug);
            }}
          />
        ) : null}
      </View>
    </>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
    alignItems: 'stretch',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    backgroundColor: 'rgba(6,14,10,0.55)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    opacity: 0,
  },
  modal: {
    position: 'fixed',
    zIndex: 50,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,45,34,0.86)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderWidth: 1,
    borderColor: theme.glass.borderStrong,
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    flexDirection: 'column',
  },
} as unknown as { [k: string]: object };
