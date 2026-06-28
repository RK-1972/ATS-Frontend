import { Box, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function LoadingState({ message = "Loading…", size = 32 }) {
  const theme = useTheme();
  const { typography } = theme.tokens;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        gap: 2
      }}
    >
      <CircularProgress size={size} />
      <Typography color="text.secondary" sx={{ fontSize: typography.secondary.fontSize }}>
        {message}
      </Typography>
    </Box>
  );
}

export default LoadingState;
