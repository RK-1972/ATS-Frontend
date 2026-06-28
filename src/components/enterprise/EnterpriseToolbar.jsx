import { Box, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function EnterpriseToolbar({ left = null, right = null, children, sx = {} }) {
  const theme = useTheme();
  const { radius } = theme.tokens;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        px: 1,
        py: 0.5,
        borderRadius: `${radius.sm}px`,
        bgcolor: "action.hover",
        flexWrap: "wrap",
        ...sx
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.5} flex={1}>
        {left}
        {children}
      </Stack>
      {right && (
        <Stack direction="row" alignItems="center" gap={0.5}>
          {right}
        </Stack>
      )}
    </Box>
  );
}

export default EnterpriseToolbar;
