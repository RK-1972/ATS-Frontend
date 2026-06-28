import { Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const STATUS_MAP = {
  Draft: "draft",
  Pending: "pending",
  "Pending Approval": "pending",
  Approved: "approved",
  Released: "released",
  Accepted: "accepted",
  Declined: "declined",
  Withdrawn: "withdrawn",
  Expired: "expired",
  Open: "active",
  Active: "active",
  Completed: "completed",
  Scheduled: "info",
  "In Progress": "active",
  Escalated: "warning",
  Rejected: "error",
  Overdue: "error"
};

const MUI_COLOR = {
  draft: "default",
  pending: "warning",
  approved: "success",
  released: "info",
  accepted: "success",
  declined: "error",
  withdrawn: "default",
  expired: "error",
  active: "primary",
  completed: "success",
  info: "info",
  warning: "warning",
  error: "error"
};

function StatusChip({ status, size = "small", variant = "filled" }) {
  const theme = useTheme();
  const tokenKey = STATUS_MAP[status] || "draft";
  const color = MUI_COLOR[tokenKey] || "default";
  const compact = size === "small";
  const tokenColors = theme.tokens.statusColors[tokenKey];

  if (variant === "soft" && tokenColors) {
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          height: compact ? 22 : 24,
          fontSize: theme.tokens.typography.label.fontSize,
          fontWeight: 600,
          bgcolor: tokenColors.bg,
          color: tokenColors.text,
          border: `1px solid ${tokenColors.border}`,
          "& .MuiChip-label": { px: compact ? 0.75 : 1 }
        }}
      />
    );
  }

  return (
    <Chip
      label={status}
      size="small"
      color={color}
      variant={color === "default" ? "outlined" : "filled"}
      sx={{
        height: compact ? 22 : 24,
        fontSize: theme.tokens.typography.label.fontSize,
        fontWeight: 600,
        "& .MuiChip-label": { px: compact ? 0.75 : 1 }
      }}
    />
  );
}

export default StatusChip;
