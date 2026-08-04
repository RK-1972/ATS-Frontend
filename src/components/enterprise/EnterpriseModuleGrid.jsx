import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Responsive module / workspace card grid — 3 / 2 / 1 columns.
 * Future modules flow in without page redesign.
 */
function EnterpriseModuleGrid({ children, sx = {} }) {
  const theme = useTheme();
  const maxWidth = theme.tokens.layout.moduleGridMaxWidth;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth,
        mx: "auto",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))"
        },
        gap: 2,
        alignItems: "stretch",
        ...sx
      }}
    >
      {children}
    </Box>
  );
}

export default EnterpriseModuleGrid;
