import { Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const PRIORITY_MAP = {
  Critical: "critical",
  High: "high",
  Normal: "normal",
  Low: "low"
};

function PriorityChip({ priority, size = "small" }) {
  const theme = useTheme();
  const key = PRIORITY_MAP[priority] || "normal";
  const colors = theme.tokens.priorityColors[key];
  const compact = size === "small";

  return (
    <Chip
      label={priority}
      size="small"
      sx={{
        height: compact ? 22 : 24,
        fontSize: theme.tokens.typography.label.fontSize,
        fontWeight: 600,
        bgcolor: colors.bg,
        color: colors.text,
        "& .MuiChip-label": { px: compact ? 0.75 : 1 }
      }}
    />
  );
}

export default PriorityChip;
