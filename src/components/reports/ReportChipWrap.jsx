import { Box } from "@mui/material";

/**
 * Bounded flex row that wraps chip/action items onto multiple lines.
 * Uses explicit flexbox (not MUI Stack) so width: 100% + flexWrap: wrap
 * reliably reflow within the available parent width.
 */
function ReportChipWrap({ children, sx = {} }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        alignContent: "flex-start",
        gap: 0.75,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        ...sx
      }}
    >
      {children}
    </Box>
  );
}

export default ReportChipWrap;
