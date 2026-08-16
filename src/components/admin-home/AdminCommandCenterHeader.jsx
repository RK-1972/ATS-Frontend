import { Box, Typography } from "@mui/material";
import { DESIGN } from "./adminHomeTokens";

function AdminCommandCenterHeader() {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 24,
          lineHeight: 1.2,
          color: DESIGN.textPrimary,
          letterSpacing: "-0.02em"
        }}
      >
        Admin Command Center
      </Typography>
      <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary, mt: 0.25 }}>
        Enterprise administration, governance and platform oversight.
      </Typography>
    </Box>
  );
}

export default AdminCommandCenterHeader;
