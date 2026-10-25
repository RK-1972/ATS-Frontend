import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";

function formatCountdown(secondsRemaining) {
  const safe = Math.max(0, Math.floor(secondsRemaining));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function EmployeeIdleWarningDialog({
  open,
  secondsRemaining,
  totalWarningSeconds,
  submitting,
  errorMessage,
  onStayLoggedIn,
  onLogOut
}) {
  const theme = useTheme();
  const isCompactViewport = useMediaQuery(theme.breakpoints.down("sm"));
  const progress =
    totalWarningSeconds > 0
      ? Math.min(100, Math.max(0, (secondsRemaining / totalWarningSeconds) * 100))
      : 0;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      fullScreen={isCompactViewport}
      aria-labelledby="employee-idle-warning-title"
      onClose={() => {}}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: isCompactViewport ? 0 : 3,
          pb: "env(safe-area-inset-bottom, 0px)"
        }
      }}
    >
      <DialogTitle
        id="employee-idle-warning-title"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <TimerOutlinedIcon color="warning" />
        Session expiring soon
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1">
            You have been inactive. You will be signed out automatically unless you choose
            to stay logged in.
          </Typography>
          <Alert severity="warning" variant="outlined">
            <Typography variant="h6" component="p" fontWeight={700}>
              {formatCountdown(secondsRemaining)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Time remaining before automatic sign-out
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 1.5, height: 8, borderRadius: 1 }}
            />
          </Alert>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: { xs: 3, sm: 2 },
          pt: 1,
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1,
          "& .MuiButton-root": {
            width: { xs: "100%", sm: "auto" },
            minHeight: 44,
            textTransform: "none",
            fontWeight: 600
          }
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          disabled={submitting}
          onClick={onLogOut}
        >
          Log out
        </Button>
        <Button
          variant="contained"
          disabled={submitting}
          onClick={onStayLoggedIn}
        >
          {submitting ? "Validating…" : "Stay logged in"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
