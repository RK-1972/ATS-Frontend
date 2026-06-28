import { Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const SLA_MAP = {
  Overdue: "overdue",
  "At Risk": "atRisk",
  "On Track": "onTrack"
};

function SLAChip({ status, label, size = "small" }) {
  const theme = useTheme();
  const key = SLA_MAP[status] || "none";
  const colors = theme.tokens.slaColors[key];
  const compact = size === "small";

  return (
    <Chip
      label={label || status}
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

export default SLAChip;
