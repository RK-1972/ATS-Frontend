import { useCallback, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from "@mui/material";
import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";

import sessionTakeoverClient from "@/api/clients/sessionTakeoverClient";

function formatExpiry(expiresAt) {
  if (!expiresAt) {
    return null;
  }
  try {
    return new Date(expiresAt).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return null;
  }
}

export default function SessionTakeoverDialog({ pending, onResolved, onSessionRevoked }) {
  const [submitting, setSubmitting] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDecision = useCallback(
    async (decision) => {
      if (!pending?.request_id || submitting) {
        return;
      }

      setSubmitting(decision);
      setErrorMessage("");

      try {
        await sessionTakeoverClient.submitDecision(pending.request_id, decision);
        onResolved?.({ decision, requestId: pending.request_id });
        if (decision === "accept") {
          onSessionRevoked?.();
        }
      } catch (error) {
        const message =
          error.response?.data?.message
          || "Unable to record your decision. Try again.";
        setErrorMessage(message);
      } finally {
        setSubmitting(null);
      }
    },
    [pending?.request_id, submitting, onResolved, onSessionRevoked]
  );

  if (!pending) {
    return null;
  }

  const expiryLabel = formatExpiry(pending.expires_at);
  const deviceHint = pending.requester_user_agent_summary || "Unknown device or browser";
  const ipHint = pending.requester_ip
    ? `Network location (IP): ${pending.requester_ip}`
    : null;

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      aria-labelledby="session-takeover-title"
      onClose={() => {}}
      disableEscapeKeyDown
    >
      <DialogTitle id="session-takeover-title" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <DevicesOtherOutlinedIcon color="warning" />
        Sign-in approval required
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1">
            Someone is trying to sign in with your account. If this was you on another
            device, you can allow access. Otherwise, deny the request to keep this session active.
          </Typography>
          <Alert severity="info" variant="outlined">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Request details (informational only)
            </Typography>
            <Typography variant="body2">{deviceHint}</Typography>
            {ipHint ? (
              <Typography variant="caption" color="text.secondary">
                {ipHint}
              </Typography>
            ) : null}
            {expiryLabel ? (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Request expires around {expiryLabel}
              </Typography>
            ) : null}
          </Alert>
          {errorMessage ? (
            <Alert severity="error">{errorMessage}</Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          disabled={Boolean(submitting)}
          onClick={() => handleDecision("deny")}
        >
          Deny
        </Button>
        <Button
          variant="contained"
          color="warning"
          disabled={Boolean(submitting)}
          onClick={() => handleDecision("accept")}
        >
          Allow sign-in
        </Button>
      </DialogActions>
    </Dialog>
  );
}
