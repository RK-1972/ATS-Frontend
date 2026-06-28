import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function MetricCell({
  label,
  value,
  subtitle,
  highlight = false,
  placeholder = false,
  onClick = null
}) {
  const theme = useTheme();
  const { brand, typography } = theme.tokens;
  const isInteractive = typeof onClick === "function";

  return (
    <Box
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      } : undefined}
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: highlight ? brand.metricHighlight : "background.paper",
        minWidth: 0,
        cursor: isInteractive ? "pointer" : "default",
        transition: "background-color 0.15s ease",
        "&:hover": isInteractive ? { bgcolor: brand.metricHighlight } : undefined
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        color={highlight ? "primary.main" : "text.primary"}
        sx={{
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.2,
          fontSize: typography.pageTitle.fontSize
        }}
      >
        {placeholder ? "—" : (value ?? 0)}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        display="block"
        mt={0.25}
        sx={{ fontSize: typography.caption.fontSize }}
      >
        {label}
      </Typography>

      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={0.25}
          sx={{ fontSize: typography.label.fontSize }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default MetricCell;
