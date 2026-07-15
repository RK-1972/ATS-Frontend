import { useEffect, useState } from "react";

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";

function CandidateOwnershipDialog({
  open,
  candidateName = "",
  currentOwner = "",
  loading = false,
  onClose,
  onSubmit
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const trimmedReason = reason.trim();
  const canSubmit = trimmedReason.length > 0 && trimmedReason.length <= 500;

  const handleSubmit = () => {
    if (!canSubmit || loading) {
      return;
    }

    onSubmit?.(trimmedReason);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
  sx={{
    pb: 1.5
  }}
>
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
  >
    <PersonOutlineOutlinedIcon
      color="primary"
    />

    <Typography
      variant="h6"
      fontWeight={700}
    >
      Request Candidate Ownership
    </Typography>

  </Stack>
</DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2, pb: 1.5 }}>
        <Stack spacing={1.75}>
          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Current Candidate
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {candidateName}
            </Typography>
          </Stack>

          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Current Owner
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {currentOwner}
            </Typography>
          </Stack>

          <TextField
            label="Business Justification"
            placeholder="Explain why ownership transfer is required..."
            required
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 500))}
            inputProps={{ maxLength: 500 }}
            helperText="Required • Maximum 500 characters"
            disabled={loading}
          />

          <Alert severity="info" sx={{ py: 0.25 }}>
            Ownership transfer requires approval from the current recruiter.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            minWidth: 132
          }}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CandidateOwnershipDialog;
