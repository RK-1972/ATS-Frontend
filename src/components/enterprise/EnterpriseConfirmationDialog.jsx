import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FramerDialogTransition } from "../../theme/motionRenderer";

/**
 * Shared confirmation dialog.
 * Motion renderer: Framer Motion via MUI TransitionComponent (token durations).
 */
function EnterpriseConfirmationDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmColor = "primary",
  loading = false,
  onConfirm,
  onClose,
  children
}) {
  const theme = useTheme();
  const { tokens } = theme.motion;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slots={{ transition: FramerDialogTransition }}
      transitionDuration={{
        enter: tokens.duration.enter,
        exit: tokens.duration.exit
      }}
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, pb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        {children}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            minWidth: 96
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EnterpriseConfirmationDialog;
