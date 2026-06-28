import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function SplitView({
  primary,
  secondary = null,
  primaryFlex = 1,
  secondaryFlex = 1,
  minSecondaryWidth = 320,
  gap = 2,
  direction = "horizontal"
}) {
  const theme = useTheme();
  const isHorizontal = direction === "horizontal";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isHorizontal
          ? { xs: "column", lg: "row" }
          : "column",
        gap,
        minHeight: 0,
        flex: 1
      }}
    >
      <Box
        sx={{
          flex: primaryFlex,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {primary}
      </Box>

      {secondary && (
        <Box
          sx={{
            flex: secondaryFlex,
            minWidth: isHorizontal ? { lg: minSecondaryWidth } : 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {secondary}
        </Box>
      )}
    </Box>
  );
}

export default SplitView;
