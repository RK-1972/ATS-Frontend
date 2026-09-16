/** Design tokens — TA Lead workspace scope only. */
export const PANEL_SHELL = {
  border: 1,
  borderColor: "divider",
  borderRadius: 2,
  bgcolor: "background.paper",
  overflow: "hidden",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)"
};

export const PANEL_HEADER = {
  px: 1.5,
  py: 0.75,
  borderBottom: 1,
  borderColor: "divider"
};

export const ROW_INTERACTIVE = {
  cursor: "pointer",
  transition: "background-color 150ms ease, box-shadow 150ms ease",
  "&:hover": {
    bgcolor: "action.hover",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.06)"
  }
};
