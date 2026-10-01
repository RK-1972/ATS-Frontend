/** Responsive touch targets — candidate workspace scope; md+ unchanged. */

export const CANDIDATE_MOBILE_ICON_BUTTON_SX = {
  width: { xs: 44, md: 34 },
  height: { xs: 44, md: 34 }
};

export const CANDIDATE_MOBILE_CONTAINED_BUTTON_SX = {
  minHeight: { xs: 44, md: 32 }
};

export const CANDIDATE_MOBILE_FULL_WIDTH_BUTTON_SX = {
  minHeight: { xs: 44, md: 36 },
  py: { xs: 1.25, md: 0.5 }
};

export const CANDIDATE_SPEED_DIAL_SX = {
  "& .MuiFab-root": {
    width: { xs: 56, md: 56 },
    height: { xs: 56, md: 56 }
  },
  "& .MuiSpeedDialAction-fab": {
    width: { xs: 48, md: 40 },
    height: { xs: 48, md: 40 }
  },
  "& .MuiSpeedDialAction-staticTooltipLabel": {
    minHeight: { xs: 48, md: 30 },
    lineHeight: { xs: "48px", md: "30px" },
    display: "flex",
    alignItems: "center"
  }
};
