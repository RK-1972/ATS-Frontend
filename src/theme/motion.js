/**
 * Optalynx Enterprise Motion & Interaction Design System
 *
 * Foundation only — reusable primitives. Prefer token calibration over new motion.
 * Principles: calm · confident · near-invisible (MD3 / Fluent / Atlassian).
 * No bounce, overshoot, elastic, large scale, or decorative motion.
 */

import tokens from "./tokens";

const { motion: motionTokens, shadows, elevation } = tokens;

/** Alias for consumers that import the motion module directly. */
export const motion = motionTokens;

/**
 * Build a single CSS transition string from design tokens.
 * @param {string} property CSS property (e.g. "opacity", "box-shadow")
 * @param {"instant"|"fast"|"normal"|"slow"|"enter"|"exit"} speed
 * @param {"standard"|"decelerate"|"accelerate"|"emphasized"} easingKey
 */
export function transition(
  property,
  speed = "normal",
  easingKey = "standard"
) {
  const durationMs =
    motionTokens.duration[speed] ?? motionTokens.duration.normal;
  const easing =
    motionTokens.easing[easingKey] ?? motionTokens.easing.standard;

  return `${property} ${durationMs}ms ${easing}`;
}

/**
 * Build a multi-property CSS transition string.
 * @param {string[]} properties
 * @param {"instant"|"fast"|"normal"|"slow"|"enter"|"exit"} speed
 * @param {"standard"|"decelerate"|"accelerate"|"emphasized"} easingKey
 */
export function transitions(
  properties,
  speed = "normal",
  easingKey = "standard"
) {
  return properties
    .map((property) => transition(property, speed, easingKey))
    .join(", ");
}

/**
 * Resolve duration in ms, honouring an optional reduced-motion override.
 * When reduced is true, non-essential motion resolves to 0.
 */
export function resolveDuration(speed = "normal", options = {}) {
  if (options.reducedMotion) {
    return 0;
  }

  return motionTokens.duration[speed] ?? motionTokens.duration.normal;
}

/**
 * CSS custom-property map for :root (and reduced-motion overrides).
 * Pages/components may reference var(--optalynx-motion-*) instead of hardcoding.
 */
export function getMotionCssVariables(reduced = false) {
  const d = motionTokens.duration;
  const e = motionTokens.easing;
  const t = motionTokens.transform;
  const zero = reduced;

  return {
    "--optalynx-motion-duration-instant": `${zero ? 0 : d.instant}ms`,
    "--optalynx-motion-duration-fast": `${zero ? 0 : d.fast}ms`,
    "--optalynx-motion-duration-normal": `${zero ? 0 : d.normal}ms`,
    "--optalynx-motion-duration-slow": `${zero ? 0 : d.slow}ms`,
    "--optalynx-motion-duration-enter": `${zero ? 0 : d.enter}ms`,
    "--optalynx-motion-duration-exit": `${zero ? 0 : d.exit}ms`,
    "--optalynx-motion-easing-standard": e.standard,
    "--optalynx-motion-easing-decelerate": e.decelerate,
    "--optalynx-motion-easing-accelerate": e.accelerate,
    "--optalynx-motion-easing-emphasized": e.emphasized,
    "--optalynx-motion-fade-enter": String(t.fade.enter),
    "--optalynx-motion-fade-exit": String(t.fade.exit),
    "--optalynx-motion-scale-hover": String(zero ? 1 : t.scale.hover),
    "--optalynx-motion-scale-press": String(zero ? 1 : t.scale.press),
    "--optalynx-motion-translate-enter-y": zero
      ? "0px"
      : t.translate.enterY,
    "--optalynx-motion-translate-nav-x": zero ? "0px" : t.translate.navX
  };
}

/**
 * Interaction / surface presets for future adoption via sx or style.
 * Not applied globally — consumers opt in explicitly.
 */
export const motionPresets = {
  /** Subtle page content entrance (opacity + slight rise). */
  pageEnter: {
    from: {
      opacity: motionTokens.transform.fade.exit,
      transform: `translateY(${motionTokens.transform.translate.enterY})`
    },
    to: {
      opacity: motionTokens.transform.fade.enter,
      transform: "translateY(0)"
    },
    transition: transitions(
      ["opacity", "transform"],
      "enter",
      "decelerate"
    )
  },

  /** Card resting → hover elevation (shadow-led; lift via hoverY token). */
  card: {
    rest: {
      boxShadow: shadows.low,
      transform: "translateY(0)"
    },
    hover: {
      boxShadow: shadows.high,
      transform: `translateY(${motionTokens.transform.translate.hoverY})`
    },
    transition: transitions(
      ["box-shadow", "transform", "border-color"],
      "hover",
      "decelerate"
    )
  },

  /** Dialog / modal enter-exit (fade + minimal translate/scale). */
  dialog: {
    enter: {
      opacity: motionTokens.transform.fade.enter,
      transform: "translateY(0) scale(1)"
    },
    exit: {
      opacity: motionTokens.transform.fade.exit,
      transform: `translateY(${motionTokens.transform.translate.enterY}) scale(${motionTokens.transform.scale.exit})`
    },
    transition: transitions(
      ["opacity", "transform"],
      "enter",
      "decelerate"
    )
  },

  /** Drawer slide (horizontal, calm). */
  drawer: {
    enterTransform: "translateX(0)",
    exitTransform: `translateX(${motionTokens.transform.translate.drawerX})`,
    transition: transition("transform", "enter", "decelerate")
  },

  /** Navigation rail / route cue (opacity / color led). */
  navigation: {
    transition: transitions(
      ["background-color", "color", "opacity", "box-shadow"],
      "fast",
      "standard"
    )
  },

  /** Focus ring — communicates keyboard focus without flash. */
  focus: {
    outlineWidth: motionTokens.interaction.focus.outlineWidth,
    outlineStyle: "solid",
    outlineColor: motionTokens.interaction.focus.outlineColor,
    outlineOffset: motionTokens.interaction.focus.outlineOffset,
    transition: transition("outline-color", "fast", "standard")
  },

  /** Pressed state — opacity only (no elastic scale). */
  press: {
    opacity: motionTokens.interaction.press.opacity,
    transition: transition("opacity", "instant", "standard")
  },

  /** Hover affordance for interactive surfaces. */
  hover: {
    transition: transitions(
      ["background-color", "border-color", "box-shadow", "color"],
      "hover",
      "decelerate"
    )
  },

  /** Success / error state change (color + opacity, no decorative pulse). */
  stateChange: {
    transition: transitions(
      ["background-color", "border-color", "color", "opacity"],
      "normal",
      "decelerate"
    )
  }
};

/**
 * Elevation levels mapped for motion-aware surfaces (token reference).
 * Consumers pair with shadows / MUI elevation; values are intentional and calm.
 */
export const motionElevation = {
  none: elevation.none,
  rest: elevation.low,
  hover: elevation.high,
  raised: elevation.high,
  header: elevation.header,
  shadows: {
    rest: shadows.low,
    /** High shadow on hover so elevation change is actually visible */
    hover: shadows.high,
    raised: shadows.high,
    drawer: shadows.drawer
  }
};

/**
 * MUI sx helper: disable transform/animation when reduced motion is preferred.
 * Usage (future): sx={[motionPresets.card.rest, reduceMotionSx]}
 */
export const reduceMotionSx = {
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none !important",
    animation: "none !important",
    transform: "none !important"
  }
};

/**
 * Framer Motion adapters — map existing Motion Tokens to FM props.
 * Not a second motion system: durations/easings always come from tokens.
 */

/** Parse token cubic-bezier CSS string → Framer ease array. */
export function parseEasingToFramer(easingKey = "standard") {
  const css =
    motionTokens.easing[easingKey] ?? motionTokens.easing.standard;
  const match = /^cubic-bezier\(\s*([^)]+)\s*\)$/.exec(css);
  if (match) {
    return match[1].split(",").map((part) => Number(part.trim()));
  }
  return [0.4, 0, 0.2, 1];
}

/** Token duration (ms) → Framer seconds. */
export function durationToSeconds(speed = "normal", reduced = false) {
  if (reduced) return 0;
  return (
    (motionTokens.duration[speed] ?? motionTokens.duration.normal) / 1000
  );
}

/**
 * Framer `transition` object from Motion Tokens.
 * @param {"instant"|"fast"|"hover"|"pressed"|"focused"|"normal"|"slow"|"enter"|"exit"} speed
 * @param {"standard"|"decelerate"|"accelerate"|"emphasized"} easingKey
 */
export function framerTransition(
  speed = "normal",
  easingKey = "standard",
  reduced = false
) {
  if (reduced) {
    return { type: "tween", duration: 0 };
  }

  return {
    type: "tween",
    duration: durationToSeconds(speed, false),
    ease: parseEasingToFramer(easingKey)
  };
}

/** Numeric px from translate token (e.g. enterY "2px" → 2). */
export function translateTokenPx(key = "enterY") {
  return parseFloat(motionTokens.transform.translate[key]) || 0;
}

/**
 * Card / surface mount + hover props for Framer (token-driven).
 * @param {boolean} reduced prefers-reduced-motion
 */
export function cardFramerProps(reduced = false) {
  const enterY = translateTokenPx("enterY");
  const hoverY = translateTokenPx("hoverY");

  if (reduced) {
    return {
      initial: false,
      animate: {
        opacity: 1,
        y: 0,
        boxShadow: motionElevation.shadows.rest
      },
      whileHover: undefined,
      transition: { duration: 0 }
    };
  }

  return {
    initial: {
      opacity: motionTokens.transform.fade.exit,
      y: enterY,
      boxShadow: motionElevation.shadows.rest
    },
    animate: {
      opacity: motionTokens.transform.fade.enter,
      y: 0,
      boxShadow: motionElevation.shadows.rest
    },
    whileHover: {
      y: hoverY,
      boxShadow: motionElevation.shadows.hover,
      transition: framerTransition("hover", "decelerate", false)
    },
    transition: framerTransition("enter", "decelerate", false)
  };
}

/**
 * Dense metric card mount + hover props — calmer lift than full EnterpriseSurface cards.
 * @param {boolean} reduced prefers-reduced-motion
 */
export function denseCardFramerProps(reduced = false) {
  const enterY = translateTokenPx("enterY") / 3;
  const hoverY = parseFloat(tokens.denseMotionCard?.hoverTranslateY) || -3;

  if (reduced) {
    return {
      initial: false,
      animate: {
        opacity: 1,
        y: 0,
        boxShadow: motionElevation.shadows.rest
      },
      whileHover: undefined,
      transition: { duration: 0 }
    };
  }

  return {
    initial: {
      opacity: motionTokens.transform.fade.exit,
      y: enterY,
      boxShadow: motionElevation.shadows.rest
    },
    animate: {
      opacity: motionTokens.transform.fade.enter,
      y: 0,
      boxShadow: motionElevation.shadows.rest
    },
    whileHover: {
      y: hoverY,
      boxShadow: motionElevation.shadows.mid,
      transition: framerTransition("hover", "decelerate", false)
    },
    transition: framerTransition("enter", "decelerate", false)
  };
}

/**
 * Workspace / page enter props (token-driven).
 * @param {boolean} reduced
 */
export function pageFramerProps(reduced = false) {
  if (reduced) {
    return {
      initial: false,
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 1, y: 0 },
      transition: { duration: 0 }
    };
  }

  return {
    initial: {
      opacity: motionTokens.transform.fade.exit,
      y: translateTokenPx("enterY")
    },
    animate: {
      opacity: motionTokens.transform.fade.enter,
      y: 0
    },
    exit: {
      opacity: motionTokens.transform.fade.exit,
      y: -translateTokenPx("enterY") / 2
    },
    transition: framerTransition("enter", "decelerate", false)
  };
}

const OptalynxMotion = {
  tokens: motionTokens,
  transition,
  transitions,
  resolveDuration,
  getMotionCssVariables,
  presets: motionPresets,
  elevation: motionElevation,
  reduceMotionSx,
  parseEasingToFramer,
  durationToSeconds,
  framerTransition,
  translateTokenPx,
  cardFramerProps,
  denseCardFramerProps,
  pageFramerProps
};

export default OptalynxMotion;
