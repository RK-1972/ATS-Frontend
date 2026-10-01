/** Design tokens — TA Lead workspace scope only. */
export const PANEL_SHELL = {
  border: 1,
  borderColor: "divider",
  borderRadius: 2,
  bgcolor: "background.paper",
  overflow: "hidden",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%"
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

/** Queue / attention table actions — taller tap area on xs only. */
export const TA_LEAD_TABLE_ACTION_BUTTON_SX = {
  textTransform: "none",
  fontSize: 11,
  py: { xs: 1, md: 0.25 },
  px: { xs: 1.25, md: 1 },
  minHeight: { xs: 44, md: 32 },
  minWidth: { xs: 44, md: 64 }
};

export const TA_LEAD_TABLE_SCROLL_SX = {
  overflowX: "auto",
  minWidth: 0,
  maxWidth: "100%",
  width: "100%",
  WebkitOverflowScrolling: "touch"
};

export const TA_LEAD_TABLE_SX = {
  width: { xs: "100%", md: "auto" },
  minWidth: { xs: "100%", md: 420 },
  tableLayout: { xs: "fixed", md: "auto" }
};

export const TA_LEAD_WORKLOAD_TABLE_SX = {
  width: { xs: "100%", md: "auto" },
  minWidth: { xs: "100%", md: 480 },
  tableLayout: { xs: "fixed", md: "auto" }
};
