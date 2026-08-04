/**
 * OPTALYNX Enterprise Design Tokens
 * 8dp grid · Dense Material Design 3 · Microsoft enterprise density
 */

export const brand = {
  primary: "#1f3b63",
  primaryDark: "#152a47",
  primaryLight: "#2d5080",
  secondary: "#f39c12",
  surface: "#ffffff",
  background: "#f5f7fb",
  headerBg: "#1f3b63",
  headerBorder: "rgba(255,255,255,0.08)",
  metricHighlight: "rgba(31, 59, 99, 0.04)"
};

export const typography = {
  fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
  display: { fontSize: 28, fontWeight: 700, lineHeight: 1.25 },
  pageTitle: { fontSize: 22, fontWeight: 700, lineHeight: 1.3 },
  sectionTitle: { fontSize: 18, fontWeight: 600, lineHeight: 1.35 },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  secondary: { fontSize: 13, fontWeight: 400, lineHeight: 1.45 },
  caption: { fontSize: 12, fontWeight: 500, lineHeight: 1.4 },
  label: { fontSize: 11, fontWeight: 600, lineHeight: 1.3, letterSpacing: "0.02em" }
};

/** 8dp spacing scale — theme.spacing(n) = n * 8px */
export const spacing = {
  unit: 8,
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
  xxl: 6
};

export const layout = {
  maxContentWidth: 1600,
  gridColumns: 12,
  headerHeight: 56,
  navRailWidth: 72,
  sidebarWidth: 240,
  inspectorWidth: 360,
  commandBarHeight: 44,
  /** Workspace / module card grid — 3 / 2 / 1 */
  moduleGridMaxWidth: 1100,
  moduleCardMinHeight: 168
};

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999
};

/**
 * Enterprise Module Icon container — Optalynx standard sizes.
 * Soft pastel tile holding an outlined Material icon.
 * Prefer `density` ("sm" | "md" | "lg") over ad-hoc pixel sizes.
 */
export const moduleIcon = {
  size: 48,
  iconSize: 24,
  radius: 12,
  elevation: "none",
  densities: {
    sm: { size: 36, iconSize: 18 },
    md: { size: 48, iconSize: 24 },
    lg: { size: 56, iconSize: 28 }
  }
};

/**
 * Enterprise-wide module colour standard (soft pastel + accent).
 * Consume via theme.tokens.moduleColors[key] / EnterpriseModuleIcon `module`.
 * Future modules pick a semantic role — do not hardcode hex on pages.
 */
export const moduleColors = {
  recruitment: {
    bg: "#E8F0FE",
    icon: "#1967D2",
    border: "#AECBFA"
  },
  candidates: {
    bg: "#E8EAFF",
    icon: "#3949AB",
    border: "#C5CAE9"
  },
  interviews: {
    bg: "#E6F4EA",
    icon: "#137333",
    border: "#A8DAB5"
  },
  approvals: {
    bg: "#F3E8FD",
    icon: "#7B1FA2",
    border: "#CE93D8"
  },
  requisitions: {
    bg: "#FFF3E0",
    icon: "#E65100",
    border: "#FFCC80"
  },
  reports: {
    bg: "#FCE8E6",
    icon: "#C5221F",
    border: "#F5B5B0"
  },
  team: {
    bg: "#E0F2F1",
    icon: "#00796B",
    border: "#80CBC4"
  },
  administration: {
    bg: "#F0F2F5",
    icon: "#5F6368",
    border: "#DADCE0"
  },
  notifications: {
    bg: "#FFF8E1",
    icon: "#B45309",
    border: "#FDE68A"
  },
  settings: {
    bg: "#F5F5F5",
    icon: "#616161",
    border: "#E0E0E0"
  },
  offers: {
    bg: "#FFF3E0",
    icon: "#EF6C00",
    border: "#FFCC80"
  }
};

export const elevation = {
  none: 0,
  low: 1,
  mid: 2,
  high: 4,
  header: 2
};

export const shadows = {
  low: "0 1px 2px rgba(31, 59, 99, 0.06)",
  mid: "0 2px 8px rgba(31, 59, 99, 0.08)",
  high: "0 4px 16px rgba(31, 59, 99, 0.12)",
  drawer: "0 0 24px rgba(31, 59, 99, 0.16)"
};

export const borders = {
  default: "1px solid",
  color: "divider",
  focus: "2px solid",
  focusColor: brand.primary
};

/**
 * Enterprise Motion Tokens (Optalynx Motion Design System)
 *
 * Calibrated for calm but clearly perceptible enterprise motion (MD3 / Fluent).
 * Durations in ms. Curves are Material-standard (no bounce / overshoot / elastic).
 *
 * Consume via theme.tokens.motion, theme.motion, or @/theme/motion.
 * Do not hardcode durations or easings in feature pages.
 */
export const motion = {
  duration: {
    instant: 80,
    /** Nav / short cues — slightly longer for active indicator perception */
    fast: 240,
    /** Hover elevation / shadow / button hover */
    hover: 260,
    pressed: 90,
    focused: 200,
    normal: 260,
    slow: 420,
    /** Page / dialog / drawer / card entrance */
    enter: 420,
    /** Dialog / drawer exit */
    exit: 320
  },
  easing: {
    /** MD3 / Fluent standard — property changes */
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    /** Ease-out for enter / elevation settle */
    decelerate: "cubic-bezier(0.05, 0, 0.2, 1)",
    /** Softened exit */
    accelerate: "cubic-bezier(0.35, 0, 1, 1)",
    /** Emphasis without overshoot */
    emphasized: "cubic-bezier(0.2, 0, 0, 1)"
  },
  transform: {
    fade: {
      enter: 1,
      exit: 0
    },
    scale: {
      /** Hover scale is intentionally 1 — prefer elevation over growth */
      hover: 1,
      press: 1,
      /** Dialog closed scale — more readable settle */
      exit: 0.92
    },
    translate: {
      /** Soft enter rise */
      enterY: "18px",
      /** Hover lift */
      hoverY: "-8px",
      /** Nav cue */
      navX: "2px",
      /** Drawer off-screen travel (full panel width) */
      drawerX: "100%"
    }
  },
  interaction: {
    hover: {
      durationKey: "hover"
    },
    press: {
      durationKey: "pressed",
      opacity: 0.88
    },
    focus: {
      durationKey: "focused",
      outlineWidth: 2,
      outlineOffset: 2,
      outlineColor: brand.primary
    }
  },
  /**
   * Semantic roles — duration/easing keys only (no new surface roles).
   */
  surface: {
    page: { durationKey: "enter", easingKey: "decelerate" },
    card: { durationKey: "hover", easingKey: "decelerate" },
    dialog: { durationKey: "enter", easingKey: "decelerate" },
    drawer: { durationKey: "enter", easingKey: "decelerate" },
    navigation: { durationKey: "fast", easingKey: "standard" }
  }
};

export const statusColors = {
  draft: { bg: "#f0f2f5", text: "#5f6368", border: "#dadce0" },
  pending: { bg: "#fef7e0", text: "#b06000", border: "#f9ab00" },
  approved: { bg: "#e6f4ea", text: "#137333", border: "#34a853" },
  released: { bg: "#e8f0fe", text: "#1967d2", border: "#4285f4" },
  accepted: { bg: "#e6f4ea", text: "#137333", border: "#34a853" },
  declined: { bg: "#fce8e6", text: "#c5221f", border: "#ea4335" },
  withdrawn: { bg: "#f0f2f5", text: "#5f6368", border: "#dadce0" },
  expired: { bg: "#fce8e6", text: "#c5221f", border: "#ea4335" },
  active: { bg: "#e8f0fe", text: "#1967d2", border: "#4285f4" },
  completed: { bg: "#e6f4ea", text: "#137333", border: "#34a853" },
  error: { bg: "#fce8e6", text: "#c5221f", border: "#ea4335" },
  warning: { bg: "#fef7e0", text: "#b06000", border: "#f9ab00" },
  info: { bg: "#e8f0fe", text: "#1967d2", border: "#4285f4" }
};

export const priorityColors = {
  critical: { bg: "#fce8e6", text: "#c5221f" },
  high: { bg: "#fef7e0", text: "#b06000" },
  normal: { bg: "#e8f0fe", text: "#1967d2" },
  low: { bg: "#f0f2f5", text: "#5f6368" }
};

export const slaColors = {
  overdue: { bg: "#fce8e6", text: "#c5221f" },
  atRisk: { bg: "#fef7e0", text: "#b06000" },
  onTrack: { bg: "#e6f4ea", text: "#137333" },
  none: { bg: "#f0f2f5", text: "#5f6368" }
};

export default {
  brand,
  typography,
  spacing,
  layout,
  radius,
  elevation,
  shadows,
  borders,
  motion,
  moduleIcon,
  moduleColors,
  statusColors,
  priorityColors,
  slaColors
};
