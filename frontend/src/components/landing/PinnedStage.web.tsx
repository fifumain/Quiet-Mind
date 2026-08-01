import { Image } from 'expo-image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../common/AppText';
import { theme } from '../../theme/theme';
import { anim } from './animMarker';
import { ActCopy } from './ActCopy';
import { StageStatic } from './StageStatic';
import { ACTS, STAGE_OUTRO, STAGE_TICKER } from './stageData';

gsap.registerPlugin(ScrollTrigger);

/**
 * The landing's opening act: a gallery of philosophers held at the top of the
 * screen while the visitor scrolls past it.
 *
 * A tall `track` creates the scroll distance; a viewport-tall `stage` sticks to
 * the top of it for that whole distance, and a GSAP timeline scrubbed against
 * the track drives a stack of absolutely positioned layers over it — the hero,
 * then one layer per thinker, then a closing statement. Each act choreographs
 * about ten separate properties (portrait wipe, per-line quote masks, rule
 * scale, eyebrow slide, ghost-numeral parallax, glow hue and position, ticker
 * drift) rather than cross-fading a block, which is the difference between a
 * slideshow and something that feels authored.
 *
 * Three things about the environment shape the implementation:
 *
 * 1. The landing scrolls inside react-native-web's ScrollView, not the document,
 *    so ScrollTrigger is pointed at that overflow container (`findScroller`)
 *    rather than the window.
 * 2. The browser keeps the wheel. A momentum-scroll library was tried here and
 *    removed: it calls `preventDefault` on every wheel event and re-applies the
 *    movement from an animation frame, so any environment where that frame does
 *    not arrive — or any mistake in wiring it to this non-standard scroller —
 *    leaves the page completely unscrollable. The smoothing comes from the
 *    timeline's `scrub` instead, which cannot break scrolling because it never
 *    touches it.
 * 3. Nothing here pins with JavaScript. ScrollTrigger's `pin` reapplies a
 *    transform on every scroll frame and lands a frame behind it, which made
 *    the entire stage shudder; `position: sticky` is resolved in the compositor
 *    and cannot. ScrollTrigger is left to do only what it is good at here —
 *    reporting progress.
 * 4. `prefers-reduced-motion` skips the engine entirely and renders StageStatic.
 */

/**
 * Scroll spent on each step, as a fraction of the visible area.
 *
 * Deliberately well under 1. At a full viewport per step it took two or three
 * trackpad flicks to advance a single act, which reads as the page fighting you.
 * 0.42 was picked over the earlier 0.56 for the same reason, one notch further:
 * still one act per ordinary flick, just less scrolling to get there.
 */
const SCROLL_PER_STEP = 0.42;
/**
 * Transition length in timeline units (1 unit == one step).
 *
 * Transitions are sequential, not cross-faded — a layer finishes leaving exactly
 * as the next starts arriving. Overlapping them put two quotes and two portraits
 * on screen at once, which reads as a rendering fault rather than a dissolve.
 */
const FADE = 0.24;

/** Hero + one per philosopher + the closing statement. */
const STEPS = ACTS.length + 2;

/**
 * Diameter, in px, of the glow at `scale: 1` — see `styles.glow`. Per-act size
 * is expressed as a multiple of this (`targetScale` below), so the two have to
 * stay in sync.
 */
const GLOW_BASE_SIZE = 640;

export function PinnedStage({
  hero,
  aside,
  scale,
  enabled,
}: {
  hero: ReactNode;
  /**
   * Persistent card parked in the stage's bottom-right corner. The pinned
   * sequence runs for several viewports, so without it every call to action is
   * stranded back in the hero.
   */
  aside?: ReactNode;
  /** Type scale for the acts — 1 at desktop width. */
  scale: number;
  /** False on narrow viewports, where the page uses the static layout. */
  enabled: boolean;
}) {
  const trackRef = useRef<View | null>(null);
  const stageRef = useRef<View | null>(null);
  const glowRef = useRef<View | null>(null);
  const tickerRef = useRef<View | null>(null);
  const asideRef = useRef<View | null>(null);
  /** One node per step: [hero, ...acts, outro]. */
  const layerRefs = useRef<(View | null)[]>([]);

  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [scrollerMissing, setScrollerMissing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const animate = enabled && !reduced && !scrollerMissing;

  useEffect(() => {
    if (!animate) return;
    const track = trackRef.current as unknown as HTMLElement | null;
    const stage = stageRef.current as unknown as HTMLElement | null;
    const glow = glowRef.current as unknown as HTMLElement | null;
    if (!track || !stage || !glow) return;

    const scroller = findScroller(stage);
    if (!scroller) {
      // No scroll position to read. Rendering the stage anyway would leave a
      // viewport-tall block that never animates, so fall back to the flow
      // layout instead of shipping a frozen one.
      setScrollerMissing(true);
      return;
    }
    const layers = layerRefs.current.map(asElement);
    if (layers.some((l) => !l)) return;

    /**
     * `100vh` is the wrong height: the landing scrolls inside a container that
     * does not start at the top of the viewport, so the visible area is shorter
     * than a viewport and the bottom of every act was being clipped. Measure the
     * scroller instead.
     *
     * The track is what creates the scroll distance the sequence runs over; the
     * stage sticks to the top of it for exactly that long.
     */
    const sizeStage = () => {
      const viewport = scroller.clientHeight;
      stage.style.height = `${viewport}px`;
      track.style.height = `${Math.round(viewport * (1 + STEPS * SCROLL_PER_STEP))}px`;
    };
    sizeStage();


    const steps = layers.length; // hero + acts + outro
    const ctx = gsap.context(() => {
      const pick = (layer: HTMLElement, name: string) =>
        gsap.utils.toArray<HTMLElement>(layer.querySelectorAll(`[data-anim="${name}"]`));
      /**
       * Not every layer has every marker — the acts have no outro card, the
       * outro has no quote lines. Handing GSAP an empty array logs a "target not
       * found" warning per call, which buried real warnings in the console.
       */
      const setIf = (targets: HTMLElement[], vars: gsap.TweenVars) => {
        if (targets.length) gsap.set(targets, vars);
      };

      // Initial state. Everything but the hero is off-stage.
      layers.forEach((layer, i) => {
        if (!layer || i === 0) return;
        gsap.set(layer, { opacity: 0 });
        setIf(pick(layer, 'line'), { yPercent: 118 });
        setIf(pick(layer, 'eyebrow'), { xPercent: -110 });
        setIf(pick(layer, 'rule'), { scaleX: 0 });
        setIf(pick(layer, 'meta'), { opacity: 0, x: -18 });
        setIf(pick(layer, 'application'), { opacity: 0, y: 22 });
        setIf(pick(layer, 'ghost'), { opacity: 0, y: 40 });
        setIf(pick(layer, 'portrait'), {
          // A bottom-up wipe: the bust rises into the frame instead of fading in.
          clipPath: 'inset(100% 0% 0% 0%)',
          scale: 1.12,
        });
        setIf(pick(layer, 'outroCard'), { opacity: 0, y: 26 });
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          /**
           * Driven by the track's own height, with no pinning.
           *
           * ScrollTrigger's `pin` repositions the element with a transform on
           * every scroll frame, which lands a frame behind the scroll and makes
           * the whole stage tremble; its `fixed` alternative is not usable
           * inside a scroller that does not start at the top of the viewport
           * (it placed the stage 167px too high). `position: sticky` does the
           * same job in the compositor, where it costs nothing and cannot lag.
           * All that is left for ScrollTrigger to do is report progress.
           */
          trigger: track,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          /**
           * This is where the smoothness lives.
           *
           * A trackpad gesture arrives as a burst of discrete deltas; scrub eases
           * the timeline toward that position instead of snapping to it, so the
           * choreography glides even though the underlying scroll is steppy —
           * momentum, without taking the wheel away from the browser. A full
           * second of catch-up was too much: a short first gesture produced a
           * change too small to notice, so the page felt unresponsive until the
           * third or fourth flick. Lowered further alongside SCROLL_PER_STEP —
           * both were making the sequence feel slow for the same reason.
           */
          scrub: 0.35,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setActive(Math.min(steps - 1, Math.max(0, Math.round(self.progress * steps - 0.5))));
          },
        },
      });

      // Fixes the timeline's length at `steps` units so every position below can
      // be written in whole steps.
      tl.to({}, { duration: steps });

      layers.forEach((layer, i) => {
        if (!layer) return;
        const isFirst = i === 0;
        const isLast = i === steps - 1;
        if (!isFirst) tl.to(layer, { opacity: 1, duration: FADE * 0.7, ease: 'power2.out' }, i);
        if (!isLast) tl.to(layer, { opacity: 0, duration: FADE * 0.7, ease: 'power2.in' }, i + 1 - FADE);
      });

      /**
       * The hero drifts from the very first pixel of scroll.
       *
       * Its only movement used to start at t=0.76 — roughly 350px, or two
       * trackpad flicks — so the opening gestures changed nothing on screen and
       * the page read as though scrolling had not begun yet. Now it rises and
       * eases back the whole way through its own step, and the fade (added in
       * the layer loop above) still holds off until the end.
       */
      // `power2.out` front-loads it: over half the travel happens in the first
      // quarter of the step, so a single short flick is unmistakably answered.
      tl.to(layers[0], { y: -110, scale: 0.94, duration: 1, ease: 'power2.out' }, 0);

      ACTS.forEach((act, a) => {
        const step = a + 1; // step 0 is the hero
        const layer = layers[step];
        if (!layer) return;
        const pickIn = (name: string) =>
          gsap.utils.toArray<HTMLElement>(layer.querySelectorAll(`[data-anim="${name}"]`));

        const portrait = pickIn('portrait');
        const lines = pickIn('line');
        const dir = act.side === 'left' ? -1 : 1;

        // --- arrival ---
        tl.to(portrait, { clipPath: 'inset(0% 0% 0% 0%)', duration: FADE * 2.2, ease: 'power3.out' }, step);
        tl.to(portrait, { scale: 1, duration: FADE * 3, ease: 'power2.out' }, step);
        tl.to(pickIn('eyebrow'), { xPercent: 0, duration: FADE * 1.4, ease: 'power3.out' }, step + FADE * 0.2);
        tl.to(pickIn('rule'), { scaleX: 1, duration: FADE * 1.6, ease: 'power2.out' }, step + FADE * 0.4);
        tl.to(
          lines,
          { yPercent: 0, duration: FADE * 1.8, ease: 'power3.out', stagger: FADE * 0.34 },
          step + FADE * 0.35,
        );
        tl.to(pickIn('meta'), { opacity: 1, x: 0, duration: FADE * 1.4, ease: 'power2.out' }, step + FADE * 1.3);
        tl.to(
          pickIn('application'),
          { opacity: 1, y: 0, duration: FADE * 1.6, ease: 'power2.out' },
          step + FADE * 1.5,
        );
        tl.to(pickIn('ghost'), { opacity: 1, y: 0, duration: FADE * 2, ease: 'power2.out' }, step + FADE);

        // --- the hold is not still ---
        // Slow opposed drifts: portrait sinks, ghost numeral rises, quote creeps
        // the other way. Reading the act never means looking at a frozen frame.
        tl.to(portrait, { y: -54, scale: 1.045, duration: 1, ease: 'none' }, step + FADE);
        tl.to(pickIn('ghost'), { y: -46, duration: 1, ease: 'none' }, step + FADE);
        tl.to(lines, { x: 7 * dir, duration: 1, ease: 'none' }, step + FADE);

        // --- departure: the copy exits before the portrait, so the gallery wall
        // is the last thing to change ---
        tl.to(lines, { yPercent: -118, duration: FADE, ease: 'power2.in', stagger: FADE * 0.16 }, step + 1 - FADE * 1.35);
        tl.to(portrait, { clipPath: 'inset(0% 0% 100% 0%)', duration: FADE, ease: 'power2.in' }, step + 1 - FADE);

        // --- the light ---
        /**
         * Positioned from the portrait's actual geometry, not a guessed
         * left/right split.
         *
         * The four acts vary a lot — `portraitHeight` alone runs 0.72 to 0.94,
         * and every box is bottom-anchored, so a fixed `top: 46%` sat behind
         * Socrates' shoulders and well below Marcus' chin. Measuring the real
         * box is what makes "the light is behind the head" literally true
         * instead of approximately true for whichever act happens to match the
         * guess. Read before the portrait's own tweens run, so the box is still
         * in its untransformed layout position (the initial `scale: 1.12` from
         * the setup loop doesn't move the center — GSAP's default transform
         * origin is the box's own middle).
         */
        const portraitEl = portrait[0];
        const stageBox = stage.getBoundingClientRect();
        const headX = portraitEl
          ? (portraitEl.getBoundingClientRect().left + portraitEl.getBoundingClientRect().right) / 2 -
            stageBox.left
          : stageBox.width * (act.side === 'left' ? 0.3 : 0.7);
        // 40% down the portrait's own box: these are head-and-shoulders crops
        // that overrun the stage at the bottom by design (see `portraitHeight`),
        // so the face sits above the box's vertical midpoint, not at it.
        const headY = portraitEl
          ? portraitEl.getBoundingClientRect().top + portraitEl.getBoundingClientRect().height * 0.4 -
            stageBox.top
          : stageBox.height * 0.46;
        // Sized off the portrait's own box rather than a fixed constant, so a
        // knee-height 0.72 bust and a near-full-frame 0.94 one both read as lit
        // from behind rather than one swimming in too much light and the other
        // barely grazed by it.
        const targetScale = portraitEl
          ? (portraitEl.getBoundingClientRect().height * 1.3) / GLOW_BASE_SIZE
          : 1.18;

        // Moves, resizes and re-tints rather than fading, so the background
        // never blinks.
        tl.to(
          glow,
          {
            backgroundColor: act.glow,
            left: `${(headX / stageBox.width) * 100}%`,
            top: `${(headY / stageBox.height) * 100}%`,
            scale: targetScale,
            duration: FADE * 2.5,
            ease: 'power1.inOut',
          },
          step - FADE * 1.5,
        );
      });

      // The ticker crawls the full width of the sequence — a single continuous
      // move is what ties four discrete acts into one shot.
      const ticker = asElement(tickerRef.current);
      if (ticker) {
        gsap.set(ticker, { xPercent: 0, opacity: 0 });
        tl.to(ticker, { opacity: 1, duration: FADE }, 1 - FADE);
        tl.to(ticker, { xPercent: -50, duration: steps - 1, ease: 'none' }, 1 - FADE);
        tl.to(ticker, { opacity: 0, duration: FADE }, steps - 1 - FADE);
      }

      const asideEl = asElement(asideRef.current);
      if (asideEl) {
        gsap.set(asideEl, { opacity: 0, y: 24 });
        tl.to(asideEl, { opacity: 1, y: 0, duration: FADE, ease: 'power2.out' }, 1);
        tl.to(asideEl, { opacity: 0, y: 24, duration: FADE, ease: 'power2.in' }, steps - 1 - FADE);
      }

      // Closing statement: cards stagger in over a dimmed stage.
      const outro = layers[steps - 1];
      if (outro) {
        tl.to(
          gsap.utils.toArray<HTMLElement>(outro.querySelectorAll('[data-anim="outroCard"]')),
          { opacity: 1, y: 0, duration: FADE * 1.6, ease: 'power2.out', stagger: FADE * 0.4 },
          steps - 1 + FADE * 0.4,
        );
      }
      tl.to(glow, { opacity: 0.2, scale: 1.7, duration: FADE * 2, ease: 'power1.inOut' }, steps - 1 - FADE * 1.5);
    }, stage);

    const onResize = () => {
      sizeStage();
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);
    // Fonts landing late change every layer's height.
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

    return () => {
      window.removeEventListener('resize', onResize);
      ctx.revert();
      // Without pinning there is no `.pin-spacer` left wrapped around the stage,
      // so dropping below the breakpoint no longer strands a multi-thousand-pixel
      // empty div in the page when React swaps in the static layout.
      ScrollTrigger.refresh();
    };
  }, [animate, scale]);

  if (!animate) return <StageStatic hero={hero} scale={scale} />;

  return (
    <View ref={trackRef} collapsable={false} style={styles.track}>
        <View ref={stageRef} collapsable={false} style={styles.stage}>
          <View ref={glowRef} collapsable={false} style={[styles.glow, noPointer]} />

        {/* Step 0 — the hero, already visible on load.

            Every layer is a full-bleed absolute box stacked on the same spot, so
            exactly one of them may accept pointer events at a time. The hero holds
            the page's primary buttons and keeps hold of them only while it is the
            visible step; faded out to zero it is still a live click target sitting
            over everything below it. */}
        <View
          ref={(n) => {
            layerRefs.current[0] = n;
          }}
          collapsable={false}
          style={[styles.layer, styles.heroLayer, active === 0 ? null : noPointer]}
        >
          {hero}
        </View>

        {ACTS.map((act, i) => (
          <View
            key={act.id}
            ref={(n) => {
              layerRefs.current[i + 1] = n;
            }}
            collapsable={false}
            // The layers sit over the hero's buttons at all times, so none of them
            // may take pointer events.
            style={[styles.layer, act.side === 'left' ? styles.actLayerLeft : styles.actLayerRight, noPointer]}
          >
            <View
              {...anim('portrait')}
              style={[
                styles.portrait,
                act.side === 'left' ? styles.portraitLeft : styles.portraitRight,
                { height: `${act.portraitHeight * 100}%` },
              ]}
            >
              <Image
                source={act.portrait}
                style={{ height: '100%', aspectRatio: act.aspect }}
                contentFit="contain"
                // Decorative: the quote and the name carry the meaning.
                accessibilityElementsHidden
                priority={i === 0 ? 'high' : 'normal'}
              />
            </View>

            <View style={styles.copyColumn}>
              <ActCopy act={act} scale={scale} />
            </View>
          </View>
        ))}

        {/* Final step — the objection, answered, over a dimmed stage. */}
        <View
          ref={(n) => {
            layerRefs.current[ACTS.length + 1] = n;
          }}
          collapsable={false}
          // Text only, and last in the stack: without this it covered the entire
          // stage from first paint and swallowed every click meant for the hero.
          style={[styles.layer, styles.outroLayer, noPointer]}
        >
          <Text style={styles.outroEyebrow}>{STAGE_OUTRO.eyebrow}</Text>
          <Text style={[styles.outroTitle, { fontSize: Math.round(56 * scale), lineHeight: Math.round(60 * scale) }]}>
            {STAGE_OUTRO.title}
          </Text>
          <Text style={styles.outroBody}>{STAGE_OUTRO.body}</Text>
          <View style={styles.outroPoints}>
            {STAGE_OUTRO.points.map((p) => (
              <View key={p.title} {...anim('outroCard')} style={styles.outroPoint}>
                <Text style={styles.outroPointTitle}>{p.title}</Text>
                <Text style={styles.outroPointBody}>{p.body}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ticker along the foot of the stage. Doubled so the crawl can run to
            -50% and land exactly where it started. */}
        <View style={[styles.tickerClip, noPointer]}>
          <View ref={tickerRef} collapsable={false} style={styles.tickerRow}>
            {[...STAGE_TICKER, ...STAGE_TICKER].map((t, i) => (
              <Text key={`${t}-${i}`} style={styles.tickerItem}>
                {t}
              </Text>
            ))}
          </View>
        </View>

        {aside ? (
          <View
            ref={asideRef}
            collapsable={false}
            // Faded out during the hero and the closing statement, so it must not
            // be clickable then either.
            style={[styles.aside, active > 0 && active < ACTS.length + 1 ? null : noPointer]}
          >
            {aside}
          </View>
        ) : null}

        {/* Where am I, and how much is left — without it a pinned stage reads as a
            page that has simply stopped scrolling.

            Runs across the top rather than down a side: the portrait alternates
            left and right every act, so either edge would spend half the sequence
            sitting unreadably on top of a marble face. */}
        <View style={[styles.rail, noPointer]}>
          {Array.from({ length: ACTS.length + 2 }).map((_, i) => (
            <View key={i} style={[styles.railSeg, i === active && styles.railSegActive]} />
          ))}
          <Text style={styles.railLabel}>
            {active === 0
              ? 'The gallery'
              : active === ACTS.length + 1
                ? 'Where it ends'
                : `${ACTS[active - 1].index} — ${ACTS[active - 1].name}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** RN refs are host components on web; unwrap to the DOM node GSAP needs. */
function asElement(node: View | null | undefined): HTMLElement | null {
  return (node as unknown as HTMLElement | null) ?? null;
}

/**
 * Walks up to the nearest scroll container.
 *
 * The landing lives inside react-native-web's ScrollView, whose inner div — not
 * the document — is what actually scrolls, and ScrollTrigger has to be told so.
 *
 * This deliberately tests only the computed `overflow-y`. An earlier version
 * also required `scrollHeight > clientHeight`, which is a property of the
 * *content*, not of the container: it is false whenever this runs before the
 * page below the stage has been laid out. When that happened the function
 * returned null, ScrollTrigger silently fell back to the window — which never
 * scrolls here — and the stage froze while the trackpad did nothing.
 */
function findScroller(from: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = from.parentElement;
  while (node && node !== document.body) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

const layerFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/**
 * `pointerEvents` as a style rather than a prop — react-native-web deprecated
 * the prop form. Extracted because the stage stacks eight full-bleed layers on
 * the same spot and all but the visible one must be transparent to clicks.
 */
const noPointer = { pointerEvents: 'none' } as const;

const styles = StyleSheet.create({
  /**
   * The scroll distance the whole sequence runs over. Its height is measured
   * from the scroller (see `sizeStage`) rather than set in `vh`, because the
   * landing scrolls inside a container that is shorter than the viewport.
   */
  track: {
    position: 'relative',
    ...({ height: '100vh' } as object),
  },
  stage: {
    /**
     * Held in place by the browser, not by JavaScript. Sticky is resolved in the
     * compositor, so the stage cannot lag a frame behind the scroll the way a
     * transform reapplied on every scroll event does.
     */
    ...({ position: 'sticky', top: 0, height: '100vh' } as object),
    // Clipped so layers sliding in and out never bleed into the sections below.
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    // A square, not the previous 880x420 oval: `closest-side` on a rectangle
    // takes its radius from the *shorter* side, so the oval's real reach was
    // only ever 210px (half of 420) — nowhere near enough to sit behind a
    // 600-780px-tall portrait. Square + closest-side gives a true circle whose
    // radius is half of GLOW_BASE_SIZE, and each act scales it from there (see
    // `targetScale` in the timeline) to roughly match its own portrait's size.
    width: GLOW_BASE_SIZE,
    height: GLOW_BASE_SIZE,
    marginLeft: -GLOW_BASE_SIZE / 2,
    marginTop: -GLOW_BASE_SIZE / 2,
    left: '50%',
    top: '44%',
    backgroundColor: theme.auroraStops[1],
    opacity: 0.55,
    /**
     * Softened with a radial mask rather than `filter: blur(160px)`.
     *
     * The blur reads identically but is a convolution the compositor cannot
     * cache while the stage is moving, so it was being re-rasterised during the
     * scroll. A mask is composited on the GPU and costs effectively nothing.
     * `backgroundColor` stays animatable either way, which is what the per-act
     * colour change needs.
     */
    ...({
      maskImage: 'radial-gradient(closest-side, #000 0%, rgba(0,0,0,0.65) 55%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(closest-side, #000 0%, rgba(0,0,0,0.65) 55%, transparent 100%)',
      willChange: 'background-color',
    } as object),
  },
  layer: {
    ...layerFill,
    // Deliberately no `will-change`: promoting all six full-viewport layers at
    // once pinned a lot of GPU memory for elements that mostly just cross-fade.
    // The parts that actually move continuously ask for it individually.
  },
  heroLayer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.lg },

  // The copy column and the portrait swap sides act to act; the row direction is
  // what does it, so the column itself never needs to know which side it is on.
  actLayerLeft: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: '6%' },
  actLayerRight: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: '6%' },
  copyColumn: { flex: 1, maxWidth: 640, justifyContent: 'center' },

  portrait: {
    // Anchored to the bottom and allowed to overrun it, so the figure reads as
    // standing in the room rather than as a photograph placed on a page. Height
    // and the exact overrun come from the act (see `portraitHeight`).
    position: 'absolute',
    // Slightly past the bottom edge in every act, so the figure is always
    // standing in the room rather than floating in the middle of it.
    bottom: '-4%',
    ...({ willChange: 'transform, clip-path' } as object),
  },
  portraitLeft: { left: '-3%' },
  portraitRight: { right: '-3%' },

  outroLayer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  outroEyebrow: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 3.4,
    textTransform: 'uppercase',
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
  },
  outroTitle: {
    fontFamily: theme.fonts.display,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1.2,
    maxWidth: 880,
  },
  outroBody: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.md,
    lineHeight: 28,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 600,
    marginTop: theme.spacing.sm,
  },
  outroPoints: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
    width: '100%',
    maxWidth: 1000,
  },
  outroPoint: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(10,23,16,0.72)',
    borderWidth: 1,
    borderColor: theme.glass.border,
    gap: 6,
    ...({ willChange: 'transform, opacity' } as object),
  },
  outroPointTitle: { fontFamily: theme.fonts.bodyBold, fontSize: theme.fontSize.sm, color: theme.colors.accent },
  outroPointBody: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.xs,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },

  tickerClip: { position: 'absolute', left: 0, right: 0, bottom: 26, overflow: 'hidden' },
  // flexShrink: 0 on both, or the row squeezes to the clip width and the longer
  // labels wrap onto a second line instead of running off the edge.
  tickerRow: { flexDirection: 'row', gap: 46, flexShrink: 0, alignSelf: 'flex-start', ...({ willChange: 'transform' } as object) },
  tickerItem: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(245,246,240,0.22)',
    flexShrink: 0,
  },

  aside: { position: 'absolute', right: 34, bottom: 66, ...({ willChange: 'transform, opacity' } as object) },

  rail: {
    position: 'absolute',
    top: 26,
    left: '6%',
    right: '6%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  railSeg: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(245,246,240,0.16)',
    ...({ transition: 'background-color 380ms' } as object),
  },
  railSegActive: { backgroundColor: theme.colors.accent },
  railLabel: {
    marginLeft: 14,
    minWidth: 190,
    textAlign: 'right',
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: 'rgba(245,246,240,0.55)',
  },
});
