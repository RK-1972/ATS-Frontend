import { Box, Typography, Button, Alert } from "@mui/material";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { useTheme } from "@mui/material/styles";

function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again"
}) {
  const theme = useTheme();
  const { typography } = theme.tokens;

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Alert
        severity="error"
        icon={<ErrorOutlineOutlinedIcon fontSize="inherit" />}
        sx={{ alignItems: "flex-start" }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: typography.secondary.fontSize }}>
          {title}
        </Typography>
        {message && (
          <Typography sx={{ fontSize: typography.caption.fontSize, mt: 0.5 }}>
            {message}
          </Typography>
        )}
        {onRetry && (
          <Button size="small" color="inherit" onClick={onRetry} sx={{ mt: 1 }}>
            {retryLabel}
          </Button>
        )}
      </Alert>
    </Box>
  );
}

export default ErrorState;
