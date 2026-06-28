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
  commandBarHeight: 44
};

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999
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

export const motion = {
  duration: {
    instant: 100,
    fast: 150,
    normal: 200,
    slow: 300
  },
  easing: {
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    decelerate: "cubic-bezier(0, 0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0, 1, 1)"
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
  statusColors,
  priorityColors,
  slaColors
};
