import { useMemo, useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import { HEADCOUNT_CHANGE_TYPE } from "@/constants/headcountChangeStatus";

function RequisitionHeadcountChangeDialog({
  open,
  requisitionCode,
  currentHeadcount = 1,
  capacityFloor = 0,
  onClose,
  onSubmit,
  isSubmitting = false
}) {
  const [changeType, setChangeType] = useState(HEADCOUNT_CHANGE_TYPE.INCREASE);
  const [requestedHeadcount, setRequestedHeadcount] = useState("");
  const [reason, setReason] = useState("");

  const parsedRequested = Number(requestedHeadcount);
  const isValidNumber = Number.isFinite(parsedRequested) && parsedRequested >= 1;
  const belowCapacity = isValidNumber && parsedRequested < capacityFloor;
  const unchanged = isValidNumber && parsedRequested === currentHeadcount;
  const canSubmit =
    Boolean(reason.trim()) && isValidNumber && !belowCapacity && !unchanged && !isSubmitting;

  const helperText = useMemo(() => {
    if (!isValidNumber && requestedHeadcount !== "") {
      return "Enter a valid headcount of at least 1.";
    }
    if (belowCapacity) {
      return `Requested headcount cannot be below reserved/filled capacity (${capacityFloor}).`;
    }
    if (unchanged) {
      return "Requested headcount must differ from the current approved headcount.";
    }
    return `Current approved headcount: ${currentHeadcount}. Minimum allowed: ${capacityFloor}.`;
  }, [
    belowCapacity,
    capacityFloor,
    currentHeadcount,
    isValidNumber,
    requestedHeadcount,
    unchanged
  ]);

  const handleClose = () => {
    setChangeType(HEADCOUNT_CHANGE_TYPE.INCREASE);
    setRequestedHeadcount("");
    setReason("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    await onSubmit({
      requested_headcount: parsedRequested,
      change_type: changeType,
      reason: reason.trim()
    });

    setChangeType(HEADCOUNT_CHANGE_TYPE.INCREASE);
    setRequestedHeadcount("");
    setReason("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Headcount Change</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Requisition <strong>{requisitionCode}</strong>
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Typography variant="body2">Current: {currentHeadcount}</Typography>
            <Typography variant="body2">Capacity floor: {capacityFloor}</Typography>
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel id="headcount-change-type-label">Change Type</InputLabel>
            <Select
              labelId="headcount-change-type-label"
              label="Change Type"
              value={changeType}
              onChange={(event) => setChangeType(event.target.value)}
            >
              <MenuItem value={HEADCOUNT_CHANGE_TYPE.INCREASE}>Increase</MenuItem>
              <MenuItem value={HEADCOUNT_CHANGE_TYPE.REDUCTION}>Reduction</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Requested Headcount"
            type="number"
            size="small"
            fullWidth
            value={requestedHeadcount}
            onChange={(event) => setRequestedHeadcount(event.target.value)}
            helperText={helperText}
            inputProps={{ min: 1 }}
          />

          <TextField
            label="Reason"
            size="small"
            fullWidth
            multiline
            minRows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />

          <Alert severity="info">
            The effective headcount remains unchanged until the existing requisition
            approval workflow completes. Recruiter assignments are preserved.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{ textTransform: "none" }}
        >
          {isSubmitting ? "Submitting…" : "Submit Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RequisitionHeadcountChangeDialog;
