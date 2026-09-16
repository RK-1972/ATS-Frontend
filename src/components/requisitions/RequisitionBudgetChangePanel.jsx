import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

import recruitmentRepository from "@/repositories/recruitmentRepository";
import {
  BUDGET_CHANGE_STATUS,
  isPendingBudgetChange
} from "@/constants/budgetChangeStatus";
import RequisitionBudgetChangeDialog from "./RequisitionBudgetChangeDialog";

function statusChipColor(status) {
  if (status === BUDGET_CHANGE_STATUS.APPROVED) {
    return "success";
  }
  if (status === BUDGET_CHANGE_STATUS.REJECTED) {
    return "error";
  }
  if (isPendingBudgetChange(status)) {
    return "warning";
  }
  return "default";
}

function formatBudget(value) {
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

function RequisitionBudgetChangePanel({ requisitionCode, reqStatus }) {
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requisitionCode) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const response = await recruitmentRepository.listBudgetChanges(requisitionCode);
        if (!cancelled) {
          setBundle(response?.data || response || null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError.response?.data?.message || "Failed to load budget change history."
          );
          setBundle(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requisitionCode, reqStatus]);

  const loadHistory = async () => {
    if (!requisitionCode) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await recruitmentRepository.listBudgetChanges(requisitionCode);
      setBundle(response?.data || response || null);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load budget change history.");
      setBundle(null);
    } finally {
      setLoading(false);
    }
  };

  const pendingChange = bundle?.pending_change || null;
  const hasPending = Boolean(pendingChange);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setError("");

    try {
      await recruitmentRepository.requestBudgetChange(requisitionCode, payload);
      setDialogOpen(false);
      await loadHistory();
    } catch (submitError) {
      setError(
        submitError.response?.data?.message || "Failed to submit budget change request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Budget Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current approved budget: {formatBudget(bundle?.current_budget)}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          onClick={() => setDialogOpen(true)}
          disabled={loading || hasPending}
          sx={{ textTransform: "none", alignSelf: { xs: "stretch", sm: "auto" } }}
        >
          Request Budget Change
        </Button>
      </Stack>

      {hasPending ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Pending change: {formatBudget(pendingChange.old_budget)} →{" "}
          {formatBudget(pendingChange.requested_budget)} ({pendingChange.change_type}).
          Effective budget remains {formatBudget(bundle?.current_budget)} until approval completes.
        </Alert>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Requested</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Requester</TableCell>
            <TableCell>Outcome</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(bundle?.history || []).length ? (
            bundle.history.map((row) => (
              <TableRow key={row.change_id}>
                <TableCell>
                  {row.requested_on
                    ? new Date(row.requested_on).toLocaleString()
                    : "—"}
                </TableCell>
                <TableCell>{formatBudget(row.old_budget)}</TableCell>
                <TableCell>{formatBudget(row.requested_budget)}</TableCell>
                <TableCell>{row.change_type}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.status}
                    color={statusChipColor(row.status)}
                  />
                </TableCell>
                <TableCell>{row.requested_by || "—"}</TableCell>
                <TableCell>{row.approval_outcome || row.reason || "—"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">
                  {loading ? "Loading budget change history…" : "No budget changes yet."}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <RequisitionBudgetChangeDialog
        open={dialogOpen}
        requisitionCode={requisitionCode}
        currentBudget={bundle?.current_budget ?? 0}
        wfpPositionBudget={bundle?.wfp_position_budget}
        offerBudgetFloor={bundle?.offer_budget_floor ?? 0}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}

export default RequisitionBudgetChangePanel;
