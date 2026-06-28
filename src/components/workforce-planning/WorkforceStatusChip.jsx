import { Chip } from "@mui/material";

const STATUS_MAP = {
  Approved: "success",
  Active: "success",
  "Pending TA Lead": "warning",
  "Pending Finance": "info",
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
