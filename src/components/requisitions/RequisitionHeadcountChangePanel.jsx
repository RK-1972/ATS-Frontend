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
  HEADCOUNT_CHANGE_STATUS,
  isPendingHeadcountChange
} from "@/constants/headcountChangeStatus";
import RequisitionHeadcountChangeDialog from "./RequisitionHeadcountChangeDialog";

function statusChipColor(status) {
  if (status === HEADCOUNT_CHANGE_STATUS.APPROVED) {
    return "success";
  }
  if (status === HEADCOUNT_CHANGE_STATUS.REJECTED) {
    return "error";
  }
  if (isPendingHeadcountChange(status)) {
    return "warning";
  }
  return "default";
}

function RequisitionHeadcountChangePanel({ requisitionCode, reqStatus }) {
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
        const response = await recruitmentRepository.listHeadcountChanges(requisitionCode);
        if (!cancelled) {
          setBundle(response?.data || response || null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError.response?.data?.message || "Failed to load headcount change history."
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
      const response = await recruitmentRepository.listHeadcountChanges(requisitionCode);
      setBundle(response?.data || response || null);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load headcount change history.");
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
      await recruitmentRepository.requestHeadcountChange(requisitionCode, payload);
      setDialogOpen(false);
      await loadHistory();
    } catch (submitError) {
      setError(
        submitError.response?.data?.message || "Failed to submit headcount change request."
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
            Headcount Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current approved headcount: {bundle?.current_headcount ?? "—"}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          onClick={() => setDialogOpen(true)}
          disabled={loading || hasPending}
          sx={{ textTransform: "none", alignSelf: { xs: "stretch", sm: "auto" } }}
        >
          Request Headcount Change
        </Button>
      </Stack>

      {hasPending ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Pending change: {pendingChange.old_headcount} → {pendingChange.requested_headcount}
          ({pendingChange.change_type}). Effective headcount remains{" "}
          {bundle?.current_headcount} until approval completes.
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
                <TableCell>{row.old_headcount}</TableCell>
                <TableCell>{row.requested_headcount}</TableCell>
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
                  {loading ? "Loading headcount change history…" : "No headcount changes yet."}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <RequisitionHeadcountChangeDialog
        open={dialogOpen}
        requisitionCode={requisitionCode}
        currentHeadcount={bundle?.current_headcount ?? 1}
        capacityFloor={bundle?.capacity_floor ?? 0}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}

export default RequisitionHeadcountChangePanel;
