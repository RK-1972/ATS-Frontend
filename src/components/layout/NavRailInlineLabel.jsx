import { Box } from "@mui/material";

const SIZE_STYLES = {
  large: { fontSize: 10, maxHeight: 38 },
  compact: { fontSize: 9, maxHeight: 32 }
};

function NavRailInlineLabel({
  label,
  showLabels,
  active = false,
  disabled = false,
  onActivate,
  size = "large"
}) {
  const metrics = SIZE_STYLES[size] || SIZE_STYLES.large;
  const isInteractive = Boolean(onActivate) && showLabels && !disabled;

  return (
    <Box
      component={isInteractive ? "button" : "span"}
      type={isInteractive ? "button" : undefined}
      onClick={isInteractive ? onActivate : undefined}
      aria-hidden={!showLabels}
      sx={{
        display: "block",
        width: "100%",
        maxWidth: "100%",
        px: 0.25,
        mx: 0,
        border: "none",
        background: "none",
        p: 0,
        cursor: isInteractive ? "pointer" : "default",
        textAlign: "center",
        fontFamily: "inherit",
        fontSize: metrics.fontSize,
        fontWeight: active ? 700 : 600,
        lineHeight: 1.2,
        letterSpacing: 0.1,
        color: active
          ? "primary.main"
          : disabled
            ? "text.disabled"
            : "text.secondary",
        opacity: showLabels ? 1 : 0,
        maxHeight: showLabels ? metrics.maxHeight : 0,
        overflow: "hidden",
        transition: "opacity 0.15s ease, max-height 0.15s ease",
        mt: showLabels ? 0.25 : 0,
        mb: showLabels ? 0.15 : 0,
        wordBreak: "break-word",
        hyphens: "auto",
        flexShrink: 0,
        "&:hover": isInteractive
          ? { color: active ? "primary.main" : "text.primary" }
          : undefined
      }}
    >
      {label}
    </Box>
  );
}

export default NavRailInlineLabel;