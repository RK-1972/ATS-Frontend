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

import { BUDGET_CHANGE_TYPE } from "@/constants/budgetChangeStatus";

function formatBudgetLabel(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function RequisitionBudgetChangeDialog({
  open,
  requisitionCode,
  currentBudget = 0,
  wfpPositionBudget = null,
  offerBudgetFloor = 0,
  onClose,
  onSubmit,
  isSubmitting = false
}) {
  const [changeType, setChangeType] = useState(BUDGET_CHANGE_TYPE.INCREASE);
  const [requestedBudget, setRequestedBudget] = useState("");
  const [reason, setReason] = useState("");

  const parsedRequested = Number(requestedBudget);
  const isValidNumber = Number.isFinite(parsedRequested) && parsedRequested >= 0;
  const belowOfferFloor = isValidNumber && parsedRequested < offerBudgetFloor;
  const unchanged = isValidNumber && parsedRequested === currentBudget;
  const exceedsWfp =
    isValidNumber
    && parsedRequested > currentBudget
    && wfpPositionBudget != null
    && parsedRequested > wfpPositionBudget;
  const canSubmit =
    Boolean(reason.trim())
    && isValidNumber
    && !belowOfferFloor
    && !unchanged
    && !exceedsWfp
    && !isSubmitting;

  const helperText = useMemo(() => {
    if (!isValidNumber && requestedBudget !== "") {
      return "Enter a valid non-negative budget amount.";
    }
    if (belowOfferFloor) {
      return `Requested budget cannot be below the highest active offer CTC (${formatBudgetLabel(offerBudgetFloor)}).`;
    }
    if (exceedsWfp) {
      return `Requested budget exceeds the linked WFP approved position budget (${formatBudgetLabel(wfpPositionBudget)}). Raise an upstream WFP budget request first.`;
    }
    if (unchanged) {
      return "Requested budget must differ from the current approved budget.";
    }
    return `Current approved budget: ${formatBudgetLabel(currentBudget)}. Active offer floor: ${formatBudgetLabel(offerBudgetFloor)}.`;
  }, [
    belowOfferFloor,
    currentBudget,
    exceedsWfp,
    isValidNumber,
    offerBudgetFloor,
    requestedBudget,
    unchanged,
    wfpPositionBudget
  ]);

  const handleClose = () => {
    setChangeType(BUDGET_CHANGE_TYPE.INCREASE);
    setRequestedBudget("");
    setReason("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    await onSubmit({
      requested_budget: parsedRequested,
      change_type: changeType,
      reason: reason.trim()
    });

    setChangeType(BUDGET_CHANGE_TYPE.INCREASE);
    setRequestedBudget("");
    setReason("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Budget Change</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Requisition <strong>{requisitionCode}</strong>
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Typography variant="body2">
              Current: {formatBudgetLabel(currentBudget)}
            </Typography>
            {wfpPositionBudget != null ? (
              <Typography variant="body2">
                WFP ceiling: {formatBudgetLabel(wfpPositionBudget)}
              </Typography>
            ) : null}
            <Typography variant="body2">
              Offer floor: {formatBudgetLabel(offerBudgetFloor)}
            </Typography>
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel id="budget-change-type-label">Change Type</InputLabel>
            <Select
              labelId="budget-change-type-label"
              label="Change Type"
              value={changeType}
              onChange={(event) => setChangeType(event.target.value)}
            >
              <MenuItem value={BUDGET_CHANGE_TYPE.INCREASE}>Increase</MenuItem>
              <MenuItem value={BUDGET_CHANGE_TYPE.REDUCTION}>Reduction</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Requested Budget"
            type="number"
            size="small"
            fullWidth
            value={requestedBudget}
            onChange={(event) => setRequestedBudget(event.target.value)}
            helperText={helperText}
            inputProps={{ min: 0 }}
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
            The effective budget remains unchanged until the existing requisition
            approval workflow completes. Existing offer budgets are not retroactively updated.
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

export default RequisitionBudgetChangeDialog;
