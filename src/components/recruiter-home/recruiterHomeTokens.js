/** Design tokens — recruiter-home scope only. */
export const PANEL_SHELL = {
  border: 1,
  borderColor: "divider",
  borderRadius: 2,
  bgcolor: "background.paper",
  overflow: "hidden",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
  transition: "box-shadow 150ms ease"
};

export const PANEL_HEADER = {
  px: 1.5,
  py: 0.65,
  borderBottom: 1,
  borderColor: "divider"
};

export const WORKBENCH_GAP = 0.5;

export const PIPELINE_HEIGHT = 78;

export const SUMMARY_STRIP_HEIGHT = 48;

export const TRANSITION_MS = "150ms ease";

export const ROW_INTERACTIVE = {
  cursor: "pointer",
  transition: `background-color ${TRANSITION_MS}, box-shadow ${TRANSITION_MS}`,
  "&:hover": {
    bgcolor: "#F9FAFB",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.06)"
  }
};

export const DESIGN = {
  textPrimary: "#101828",
  textSecondary: "#667085",
  textMuted: "#98A2B3",
  border: "#EAECF0",
  surface: "#FFFFFF",
  blue: "#175CD3",
  blueBg: "#EFF8FF",
  purple: "#6941C6",
  purpleBg: "#F4F3FF",
  green: "#027A48",
  greenBg: "#ECFDF3",
  orange: "#B54708",
  orangeBg: "#FFFAEB",
  red: "#B42318",
  redBg: "#FEF3F2",
  yellowBg: "#FFFAEB",
  yellowBorder: "#FDB022",
  pipelineApplied: "#1570EF",
  pipelineJoined: "#12B76A"
};
