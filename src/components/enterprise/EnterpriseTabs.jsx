import Tabs from "@mui/material/Tabs";
import { alpha, useTheme } from "@mui/material/styles";
import { useReducedMotion } from "framer-motion";

/**
 * EnterpriseTabs — presentation wrapper over MUI Tabs.
 *
 * Drop-in for MUI Tabs (same props / children / ARIA / keyboard behaviour).
 * Adds a premium sliding active indicator driven by Motion Token durations.
 * Does not change tab selection logic or page contracts.
 */
function EnterpriseTabs({
  orientation = "horizontal",
  sx,
  ...props
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const { brand, shadows } = theme.tokens;
  const durationMs = theme.tokens.motion.duration.normal;
  const easing = theme.tokens.motion.easing.standard;
  const primary = brand.primary;
  const isVertical = orientation === "vertical";

  const indicatorMotion = reduced
    ? "none"
    : [
        `left ${durationMs}ms ${easing}`,
        `top ${durationMs}ms ${easing}`,
        `width ${durationMs}ms ${easing}`,
        `height ${durationMs}ms ${easing}`
      ].join(", ");

  const labelMotion = reduced
    ? "none"
    : `color ${durationMs}ms ${easing}, background-color ${durationMs}ms ${easing}`;

  return (
    <Tabs
      orientation={orientation}
      {...props}
      sx={[
        {
          "& .MuiTabs-indicator": {
            zIndex: 0,
            borderRadius: isVertical ? "0 8px 8px 0" : 8,
            bgcolor: alpha(primary, 0.12),
            boxShadow: shadows.low,
            transition: indicatorMotion,
            ...(isVertical
              ? {
                  width: 3,
                  left: 0,
                  right: "auto",
                  bgcolor: primary,
                  borderRadius: "0 4px 4px 0",
                  boxShadow: `0 0 0 1px ${alpha(primary, 0.2)}`
                }
              : {
                  height: "calc(100% - 8px)",
                  bottom: 4,
                  top: "auto"
                })
          },
          "& .MuiTab-root": {
            zIndex: 1,
            textTransform: "none",
            transition: labelMotion,
            color: "text.secondary",
            "&:hover": {
              color: "text.primary",
              bgcolor: "transparent",
              opacity: 1
            },
            "&.Mui-selected": {
              color: primary,
              fontWeight: 600
            },
            "&.Mui-focusVisible": {
              outline: `2px solid ${primary}`,
              outlineOffset: 2
            }
          },
          "@media (prefers-reduced-motion: reduce)": {
            "& .MuiTabs-indicator": {
              transition: "none"
            },
            "& .MuiTab-root": {
              transition: "none"
            }
          }
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
      ]}
    />
  );
}

export default EnterpriseTabs;
