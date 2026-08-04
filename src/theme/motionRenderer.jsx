/**
 * Framer Motion render adapters for MUI slots.transition.
 *
 * These are NOT parallel Enterprise wrappers (no MotionDialog / MotionDrawer).
 * They only replace CSS Slide/Fade inside existing Dialog / Drawer components,
 * using Motion Tokens via framerTransition helpers.
 */

import { forwardRef, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  framerTransition,
  translateTokenPx,
  motion as motionTokens
} from "./motion";

const MUI_TRANSITION_OMIT = new Set([
  "in",
  "appear",
  "timeout",
  "easing",
  "direction",
  "container",
  "mountOnEnter",
  "unmountOnExit",
  "addEndListener",
  "onEnter",
  "onEntering",
  "onEntered",
  "onExit",
  "onExiting",
  "onExited",
  "children",
  "style"
]);

function restDomProps(props) {
  const rest = {};
  for (const key of Object.keys(props)) {
    if (!MUI_TRANSITION_OMIT.has(key)) {
      rest[key] = props[key];
    }
  }
  return rest;
}

/**
 * Fire MUI transition lifecycle callbacks in sync with Framer animations.
 */
function useMuiTransitionCallbacks({
  inProp,
  onEnter,
  onEntered,
  onExit,
  onExited
}) {
  const wasIn = useRef(false);

  useEffect(() => {
    if (inProp && !wasIn.current) {
      onEnter?.(null, true);
    } else if (!inProp && wasIn.current) {
      onExit?.(null, true);
    }
    wasIn.current = inProp;
  }, [inProp, onEnter, onExit]);

  return {
    onAnimationComplete: () => {
      if (inProp) {
        onEntered?.(null, true);
      } else {
        onExited?.(null, true);
      }
    }
  };
}

/**
 * Dialog enter/exit — fade + gentle scale (token scale.exit / enterY).
 * Drop-in for MUI Dialog `slots.transition`.
 */
export const FramerDialogTransition = forwardRef(
  function FramerDialogTransition(props, ref) {
    const {
      in: inProp,
      children,
      onEnter,
      onEntered,
      onExit,
      onExited,
      style
    } = props;

    const reduced = useReducedMotion();
    const enterY = translateTokenPx("enterY");
    const exitScale = motionTokens.transform.scale.exit;
    const { onAnimationComplete } = useMuiTransitionCallbacks({
      inProp,
      onEnter,
      onEntered,
      onExit,
      onExited
    });

    const closed = reduced
      ? { opacity: 0, y: 0, scale: 1 }
      : { opacity: 0, y: enterY, scale: exitScale };
    const open = { opacity: 1, y: 0, scale: 1 };

    return (
      <motion.div
        ref={ref}
        role="presentation"
        initial={closed}
        animate={inProp ? open : closed}
        transition={framerTransition("enter", "decelerate", Boolean(reduced))}
        onAnimationComplete={onAnimationComplete}
        style={{
          ...style,
          /* Ensure dialog transition layer can receive transforms */
          transformOrigin: "center center"
        }}
        {...restDomProps(props)}
      >
        {children}
      </motion.div>
    );
  }
);

/**
 * Drawer slide — horizontal. MUI passes `direction` from anchor
 * (anchor right → direction left → offscreen +100%).
 * Drop-in for MUI Drawer `slots.transition`.
 */
export const FramerDrawerTransition = forwardRef(
  function FramerDrawerTransition(props, ref) {
    const {
      in: inProp,
      children,
      onEnter,
      onEntered,
      onExit,
      onExited,
      style,
      direction = "left"
    } = props;

    const reduced = useReducedMotion();
    const { onAnimationComplete } = useMuiTransitionCallbacks({
      inProp,
      onEnter,
      onEntered,
      onExit,
      onExited
    });

    /* Match MUI Slide: direction "left" exits toward +X (right-side drawers). */
    const offscreenX =
      direction === "right" || direction === "down" ? "-100%" : "100%";

    const closed = { x: reduced ? 0 : offscreenX };
    const openState = { x: 0 };

    return (
      <motion.div
        ref={ref}
        initial={closed}
        animate={inProp ? openState : closed}
        transition={framerTransition("enter", "decelerate", Boolean(reduced))}
        onAnimationComplete={onAnimationComplete}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          ...style
        }}
        {...restDomProps(props)}
      >
        {children}
      </motion.div>
    );
  }
);
