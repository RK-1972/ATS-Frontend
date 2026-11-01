import { Box } from "@mui/material";

function OtiEnterpriseSourcingShell({ children, headerSlot = null, compact = false }) {
  return (
    <Box sx={{ width: "100%" }}>
      {headerSlot}
      <Box sx={{ mt: headerSlot ? 1.5 : 0 }}>{children}</Box>
    </Box>
  );
}

export default OtiEnterpriseSourcingShell;
