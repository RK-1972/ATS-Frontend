import { useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import { REQUISITION_STATUS } from "@/constants/requisitionStatus";
import { resolveFulfillment } from "./requisitionFulfillmentUtils";

function RequisitionClosureDialog({
  open,
  mode,
  requisition,
  onClose,
  onConfirmFilled,
  onConfirmCancelled,
  isSubmitting = false
}) {
  const [cancellationReason, setCancellationReason] = useState("");
  const metrics = requisition ? resolveFulfillment(requisition) : null;
  const requisitionCode =
    requisition?.requisition_code || requisition?.req_code || "";

  const handleClose = () => {
    setCancellationReason("");
    onClose();
  };

  const handleConfirm = async () => {
    if (mode === "filled") {
      await onConfirmFilled(requisitionCode);
    } else if (mode === "cancelled") {
      await onConfirmCancelled(requisitionCode, cancellationReason.trim());
    }
    setCancellationReason("");
  };

  const title =
    mode === "filled" ? "Close Requisition as Filled" : "Close Requisition as Cancelled";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Requisition <strong>{requisitionCode}</strong>
          </Typography>

          {metrics ? (
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Typography variant="body2">Required: {metrics.required}</Typography>
              <Typography variant="body2">Reserved: {metrics.reserved}</Typography>
              <Typography variant="body2">Filled: {metrics.filled}</Typography>
              <Typography variant="body2">Remaining: {metrics.remaining}</Typography>
            </Stack>
          ) : null}

          {metrics?.dataQualityException ? (
            <Alert severity="warning">
              Data quality exception: filled headcount exceeds required. Existing data
              will be preserved.
            </Alert>
          ) : null}

          {mode === "filled" ? (
            <Alert severity="info">
              This will close the requisition as{" "}
              <strong>{REQUISITION_STATUS.CLOSED_FILLED}</strong>, unpublish it from
              the Candidate Portal, and block new recruiting activity. Historical
              candidates, offers, and pipeline history are preserved.
            </Alert>
          ) : (
            <>
              <Alert severity="info">
                This will close the requisition as{" "}
                <strong>{REQUISITION_STATUS.CLOSED_CANCELLED}</strong>, unpublish it
                from the Candidate Portal, and block new recruiting activity.
              </Alert>
              <TextField
                label="Cancellation reason"
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                multiline
                minRows={3}
                required
                fullWidth
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={mode === "cancelled" ? "warning" : "primary"}
          onClick={handleConfirm}
          disabled={
            isSubmitting
            || (mode === "cancelled" && !cancellationReason.trim())
            || (mode === "filled" && metrics && !metrics.closureEligible)
          }
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RequisitionClosureDialog;
