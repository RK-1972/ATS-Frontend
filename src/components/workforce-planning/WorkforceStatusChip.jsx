import { Chip } from "@mui/material";

const STATUS_MAP = {
  Draft: "default",
  Approved: "success",
  Active: "success",
  "Pending Level-1 Approval": "warning",
  "Pending Level-2 Approval": "warning",
  "Clarification Requested": "warning",
  "Sent Back": "warning",
  Rejected: "error",
  "Fully Utilized": "default",
  "Expiring Soon": "error",
  "Approved Exception": "success",
  "Pending Approval": "warning"
};

function WorkforceStatusChip({ status, size = "small" }) {
  const color = STATUS_MAP[status] || "default";
  const compact = size === "small";

  return (
    <Chip
      label={status}
      size="small"
      color={color}
      variant={color === "default" ? "outlined" : "filled"}
      sx={{
        fontWeight: 600,
        height: compact ? 22 : 24,
        fontSize: compact ? 10 : 11,
        "& .MuiChip-label": { px: compact ? 0.75 : 1 }
      }}
    />
  );
}

export default WorkforceStatusChip;
