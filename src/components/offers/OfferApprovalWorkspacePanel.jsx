import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import { StatusChip } from "@/components/enterprise";
import { formatCurrency } from "@/utils/formatCurrency";
import OfferApprovalHistory from "@/components/offers/OfferApprovalHistory";

function SummaryField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

/**
 * Offer Approval detail panel — mirrors Budget ApprovalWorkspacePanel composition.
 * Actions call existing offer APIs (approve / reject / request-clarification).
 */
function OfferApprovalWorkspacePanel({
  offer,
  onApprove,
  onReject,
  onSendBack
}) {
  const [comment, setComment] = useState("");
  const [dialog, setDialog] = useState({ open: false, type: null });
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");

  if (!offer) {
    return (
      <EnterpriseCard>
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
            Select an offer request to review
          </Typography>
        </Box>
      </EnterpriseCard>
    );
  }

  const canAct = /pending/i.test(String(offer.offerStatus || ""));
  const pendingStep = offer.currentApprovalStep || "HM Review";
  const candidateName = offer.candidateName || offer.candidate_name;
  const clientName = offer.businessUnit || offer.business_unit;
  const projectName = offer.department;
  const offeredCtc = Number(offer.offeredCtc ?? offer.offered_ctc ?? 0);
  const approvedBudget = Number(offer.approvedBudget ?? offer.approved_budget ?? 0);
  const variancePct = Number(offer.variancePct ?? offer.variance_pct ?? 0);

  const openDialog = (type) => {
    setActionError("");
    setDialog({ open: true, type });
  };

  const closeDialog = () => {
    if (acting) {
      return;
    }
    setDialog({ open: false, type: null });
  };

  const dialogMeta =
    {
      approve: {
        title: "Approve Offer Request?",
        confirmLabel: "Approve",
        confirmColor: "success",
        needsComments: false
      },
      sendBack: {
        title: "Send Back Offer Request?",
        confirmLabel: "Send Back",
        confirmColor: "warning",
        needsComments: true
      },
      reject: {
        title: "Reject Offer Request?",
        confirmLabel: "Reject",
        confirmColor: "error",
        needsComments: true
      }
    }[dialog.type] || {};

  const handleConfirm = async () => {
    if (!dialog.type) {
      return;
    }

    if (dialogMeta.needsComments && !String(comment || "").trim()) {
      return;
    }

    setActing(true);
    setActionError("");

    try {
      if (dialog.type === "approve") {
        await onApprove(offer.offerId, pendingStep, comment);
      } else if (dialog.type === "sendBack") {
        await onSendBack(offer.offerId, comment);
      } else if (dialog.type === "reject") {
        await onReject(offer.offerId, comment);
      }
      setComment("");
      setDialog({ open: false, type: null });
    } catch (error) {
      setActionError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to complete approval action."
      );
    } finally {
      setActing(false);
    }
  };

  const approvalRows = Array.isArray(offer.approvalSteps) ? offer.approvalSteps : [];

  return (
    <Stack spacing={1.5}>
      <EnterpriseCard
        title={candidateName || "Offer Request"}
        subtitle={`${offer.offerId} · ${offer.requisitionCode || "—"}`}
        actions={<StatusChip status={offer.offerStatus || "Pending Approval"} />}
      >
        <Box
          sx={{
            mb: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(31, 59, 99, 0.04)",
            border: 1,
            borderColor: "divider"
          }}
        >
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ fontSize: 14, mb: 1.5 }}
          >
            Offer details
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryField label="Candidate Name" value={candidateName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryField label="Client Name" value={clientName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryField label="Project Name" value={projectName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryField label="Offered CTC" value={formatCurrency(offeredCtc)} />
            </Grid>
          </Grid>
        </Box>

        <Stack
          direction="row"
          spacing={3}
          flexWrap="wrap"
          useFlexGap
          sx={{
            pt: 1.5,
            borderTop: 1,
            borderColor: "divider",
            mb: 1.5
          }}
        >
          <SummaryField label="Position" value={offer.positionTitle} />
          <SummaryField label="Grade" value={offer.grade} />
          <SummaryField label="Location" value={offer.location} />
          <SummaryField label="Recruiter" value={offer.recruiterId} />
          <SummaryField label="Hiring Manager" value={offer.hiringManager} />
        </Stack>

        <Stack
          direction="row"
          spacing={3}
          flexWrap="wrap"
          useFlexGap
          sx={{
            pt: 1.5,
            borderTop: 1,
            borderColor: "divider"
          }}
        >
          <SummaryField
            label="Approved Budget"
            value={formatCurrency(approvedBudget)}
          />
          <SummaryField
            label="Variance"
            value={`${variancePct.toFixed(2)}%`}
          />
          <SummaryField label="Current step" value={pendingStep} />
          <SummaryField
            label="Approver role"
            value={offer.currentApproverRole || "—"}
          />
        </Stack>
      </EnterpriseCard>

      {approvalRows.length ? (
        <OfferApprovalHistory
          steps={approvalRows}
          title="Approval steps"
          subtitle="From existing offer approval records"
        />
      ) : null}

      {canAct ? (
        <EnterpriseCard title="Review decision">
          {actionError ? (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {actionError}
            </Alert>
          ) : null}

          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            placeholder="Add comments…"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            sx={{ mb: 1.5 }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleOutlinedIcon />}
              onClick={() => openDialog("approve")}
              disabled={acting}
              sx={{ fontWeight: 600 }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<UndoOutlinedIcon />}
              onClick={() => openDialog("sendBack")}
              disabled={acting}
              sx={{ fontWeight: 600 }}
            >
              Send Back
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CancelOutlinedIcon />}
              onClick={() => openDialog("reject")}
              disabled={acting}
              sx={{ fontWeight: 600 }}
            >
              Reject
            </Button>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 1.5 }}
          >
            Actions run through the existing Offer / Workflow approval APIs. No new
            approval engine is used.
          </Typography>
        </EnterpriseCard>
      ) : null}

      <EnterpriseConfirmationDialog
        open={dialog.open}
        title={dialogMeta.title || "Confirm"}
        message={`${offer.offerId} — ${candidateName || "Offer"} · Step: ${pendingStep}`}
        confirmLabel={dialogMeta.confirmLabel || "Confirm"}
        confirmColor={dialogMeta.confirmColor || "primary"}
        loading={acting}
        onConfirm={handleConfirm}
        onClose={closeDialog}
      >
        {dialogMeta.needsComments ? (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            size="small"
            label="Comments"
            required
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            error={dialog.open && !String(comment || "").trim()}
            helperText={
              dialog.open && !String(comment || "").trim()
                ? "Comments are required."
                : " "
            }
            sx={{ mt: 1.25 }}
          />
        ) : null}
      </EnterpriseConfirmationDialog>
    </Stack>
  );
}

export default OfferApprovalWorkspacePanel;
