import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Modal as RNModal, Platform, Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { glassBlur, theme } from '../../theme/theme';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The app's first modal — a centred glass card over a dark scrim.
 *
 * Everything else in the app resolves confirmations inline (e.g. the chat
 * reset row in app/(tabs)/chat/index.tsx); this is reserved for content that
 * genuinely wants the visitor's full attention pulled off the screen
 * underneath, like the mood check-in's "how can we help" panel.
 *
 * Branches on `Platform.OS` inside one file rather than a `Modal.web.tsx`
 * split: the installed react-native-web (0.21.2) has a real bug in its own
 * `Modal` — its animation wrapper (`ModalAnimation.js`) left the rendered
 * element with `pointer-events: none` even in the steady visible state, not
 * just while animating out, confirmed by reading the computed style directly
 * — so the modal painted correctly but nothing inside it ever received a
 * click. A `.web.tsx` split was tried first and is *not* what fixed it — this
 * project's Metro setup kept including both files in the web bundle and the
 * buggy one was still what rendered; one file with an explicit runtime branch
 * removes that ambiguity.
 *
 * The web branch renders through `WebPortal` (see below) rather than in place
 * in the component tree, for a second, independent reason: `position: fixed`
 * is scoped to the nearest ancestor with a `transform` (or `filter`/
 * `will-change`) — a well-known CSS rule, and this app's screens sit inside
 * several animated/transformed wrappers — so an in-place fixed overlay was
 * measuring 1220x900 offset by the sidebar's width instead of the true
 * 1440x900 viewport. A real `document.body` portal has no such ancestor.
 *
 * The card is a plain `View`, not a nested `Pressable` — `Pressable` renders a
 * real `<button>` on web regardless of `accessibilityRole`, and the card
 * contains real buttons of its own (FlowingMenuRow's rows); a `<button>`
 * wrapping other buttons is invalid HTML and React warns loudly about it.
 * Instead of relying on RN's touch responder to stop a tap on the card from
 * bubbling to the backdrop (tried first, via `onStartShouldSetResponder` —
 * unreliable here, it let some taps through to close the modal anyway), the
 * backdrop's own handler checks whether the tap's real DOM target is inside
 * the card via a ref, which is unambiguous regardless of how the responder
 * system negotiates the gesture.
 */
export function Modal({ visible, onClose, children }: AppModalProps) {
  const isWeb = Platform.OS === 'web';
  const cardRef = useRef<View>(null);

  useEffect(() => {
    if (!isWeb || !visible || typeof document === 'undefined') return;
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keyup', onKeyUp);
    return () => document.removeEventListener('keyup', onKeyUp);
  }, [isWeb, visible, onClose]);

  const handleBackdropPress = (e: GestureResponderEvent) => {
    const cardEl = cardRef.current as unknown as Node | null;
    const raw = e as unknown as { target?: EventTarget; nativeEvent?: { target?: EventTarget } };
    const targetEl = (raw.target ?? raw.nativeEvent?.target) as Node | undefined;
    if (cardEl && targetEl && cardEl.contains(targetEl)) return;
    onClose();
  };

  const body = (
    <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
      <View ref={cardRef} style={[styles.card, glassBlur(24)]}>
        {children}
      </View>
    </Pressable>
  );

  if (isWeb) {
    if (!visible) return null;
    return <WebPortal>{body}</WebPortal>;
  }

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {body}
    </RNModal>
  );
}

/**
 * Portals its children into a fresh `<div>` appended directly to
 * `document.body` — the same technique react-native-web's own `Modal` uses
 * internally (`ModalPortal.js`), reimplemented here because that one comes
 * bundled with the broken animation wrapper described above.
 */
function WebPortal({ children }: { children: ReactNode }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [, forceRender] = useState(0);

  if (!elRef.current && typeof document !== 'undefined') {
    elRef.current = document.createElement('div');
    // Set directly on the raw node rather than through any RN style system —
    // this div is never touched by React's own rendering, only by
    // `createPortal` targeting its insides, so there's no `style` prop to
    // attach this to in the first place.
    // `display: flex` matters here, not just cosmetically: the backdrop
    // inside relies on `flex: 1` to stretch to full height so its own
    // `alignItems/justifyContent: center` has room to center the card in —
    // without a flex parent, `flex: 1` is a no-op and the backdrop (and the
    // card with it) collapses to content height, pinned to the top.
    Object.assign(elRef.current.style, { position: 'fixed', inset: '0', zIndex: '9999', display: 'flex' });
  }

  useEffect(() => {
    const el = elRef.current;
    if (!el || !document.body) return;
    document.body.appendChild(el);
    // The portal target doesn't exist yet on the very first render (it's
    // created above, during render, but only attached to the document here),
    // so createPortal below would target a detached node that first time.
    // One extra render after mount is enough to pick up the attached element.
    forceRender((n) => n + 1);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (!elRef.current || !elRef.current.isConnected) return null;

  // Imported lazily via require rather than a top-level import: this
  // component's own logic already guarantees it's only ever mounted on web
  // (see the `isWeb` branch in Modal above), and require keeps that guarantee
  // enforced at the module level too rather than relying on callers.
  //
  // Typed by hand rather than `typeof import('react-dom')`: this project has
  // no `@types/react-dom` installed (nothing else here needs the DOM renderer
  // directly), and this is the one function used out of it.
  const { createPortal } = require('react-dom') as {
    createPortal: (children: ReactNode, container: Element) => ReactNode;
  };
  return createPortal(children, elRef.current);
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,14,10,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.glass.fillStrong,
    borderWidth: 1,
    borderColor: theme.glass.borderStrong,
    overflow: 'hidden',
    ...(theme.shadow.cardHover as object),
  },
});
