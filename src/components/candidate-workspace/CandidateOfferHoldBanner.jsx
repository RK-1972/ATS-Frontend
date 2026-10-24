import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from "@mui/material";
import recruitmentClient from "@/api/clients/recruitmentClient";

function CandidateOfferHoldBanner({ candidateId, onReleased }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    if (!candidateId) {
      setStatus(null);
      return;
    }

    setLoading(true);
    try {
      const response = await recruitmentClient.getCandidateOfferHoldStatus(candidateId);
      setStatus(response?.data || { on_hold: false });
    } catch (_err) {
      setStatus({ on_hold: false });
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleRelease = async () => {
    const trimmed = String(reason || "").trim();
    if (!trimmed) {
      setError("Release reason is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await recruitmentClient.releaseCandidateOfferHold(candidateId, trimmed);
      setDialogOpen(false);
      setReason("");
      await loadStatus();
      onReleased?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not release Offer Hold.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !status?.on_hold) {
    return null;
  }

  const sideEffects = status.activation_side_effects;
  const failedCount = Array.isArray(sideEffects?.failed)
    ? sideEffects.failed.length
    : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        action={
          status.can_release ? (
            <Button color="inherit" size="small" onClick={() => setDialogOpen(true)}>
              Release hold
            </Button>
          ) : null
        }
      >
        <Typography variant="body2" fontWeight={600}>
          Candidate on Offer Hold
        </Typography>
        <Typography variant="body2">
          Mapping, interview scheduling, and progression on other requisitions are restricted
          until an authorized assigned recruiter releases this hold.
        </Typography>
        {failedCount > 0 ? (
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            Some interview cancellations may require follow-up ({failedCount} could not be
            completed automatically).
          </Typography>
        ) : null}
      </Alert>

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Release candidate from Offer Hold</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Release reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            sx={{ mt: 1 }}
          />
          {error ? (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleRelease} disabled={submitting}>
            Confirm release
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CandidateOfferHoldBanner;
