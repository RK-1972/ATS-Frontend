import { Box, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function CommandBar({ left = null, right = null, children, sx = {} }) {
  const theme = useTheme();
  const { layout, radius } = theme.tokens;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        minHeight: layout.commandBarHeight,
        px: 1.5,
        py: 0.75,
        mb: 2,
        borderRadius: `${radius.sm}px`,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        flexWrap: "wrap",
        ...sx
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" flex={1}>
        {left}
        {children}
      </Stack>

      {right && (
        <Stack direction="row" alignItems="center" gap={0.5} flexShrink={0}>
          {right}
        </Stack>
      )}
    </Box>
  );
}

export default CommandBar;
