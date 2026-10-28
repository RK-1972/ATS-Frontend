import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import {
  canWithdrawOfferStatus,
  isPendingApprovalStatus,
  resolveOfferStatus
} from "@/utils/offerApprovalUtils";
import {
  validateCommercialOfferFields,
  validateOfferCtcAmount,
  validateNonNegativeOfferAmount,
  validateOptionalOfferCtcAmount
} from "@/utils/offerCommercialUtils";

import OfferApprovedSummaryPanel from "./OfferApprovedSummaryPanel";
import ClarificationTimeline from "@/components/workforce-planning/ClarificationTimeline";
import { dispatchApprovalNotificationsUpdated } from "@/utils/enterpriseNotificationEvents";

function validateWorkspaceCommercialForm(form) {
  const errors = {
    offeredCtc: validateOfferCtcAmount(form.offeredCtc, "Offered CTC"),
    variablePay: validateNonNegativeOfferAmount(form.variablePay, "Variable pay"),
    joiningBonus: validateNonNegativeOfferAmount(form.joiningBonus, "Joining bonus")
  };

  const commercialValidation = validateCommercialOfferFields({
    expected_joining_date: form.expectedJoiningDate,
    variable_pay: form.variablePay,
    variable_pay_frequency: form.variablePayFrequency,
    joining_bonus: form.joiningBonus,
    joining_bonus_frequency: form.joiningBonusFrequency
  });

  return {
    offeredCtc: errors.offeredCtc,
    variablePay: errors.variablePay || commercialValidation.errors.variable_pay,
    variablePayFrequency: commercialValidation.errors.variable_pay_frequency,
    joiningBonus: errors.joiningBonus || commercialValidation.errors.joining_bonus,
    joiningBonusFrequency: commercialValidation.errors.joining_bonus_frequency
  };
}

function OfferWorkspaceDetailPanel({
  offer,
  onRelease,
  onAccept,
  onNegotiate,
  onRevise,
  onWithdraw,
  onCorrectPendingApproval,
  onAmendApproved,
  onSubmitClarification,
  loggedInUser = null,
  busy = false
}) {
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [reviseOpen, setReviseOpen] = useState(false);
  const [correctOpen, setCorrectOpen] = useState(false);
  const [amendOpen, setAmendOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [proposedCtc, setProposedCtc] = useState("");
  const [counterCtc, setCounterCtc] = useState("");
  const [negotiationNotes, setNegotiationNotes] = useState("");
  const [revisedCtc, setRevisedCtc] = useState("");
  const [reviseReason, setReviseReason] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [amendmentReason, setAmendmentReason] = useState("");
  const [amendForm, setAmendForm] = useState({
    offeredCtc: "",
    expectedJoiningDate: "",
    variablePay: "",
    variablePayFrequency: "Yearly",
    joiningBonus: "",
    joiningBonusFrequency: "One Time"
  });
  const [clarificationResponse, setClarificationResponse] = useState("");
  const [correctForm, setCorrectForm] = useState({
    offeredCtc: "",
    expectedJoiningDate: "",
    variablePay: "",
    variablePayFrequency: "Yearly",
    joiningBonus: "",
    joiningBonusFrequency: "One Time"
  });
  const [amendFieldErrors, setAmendFieldErrors] = useState({});
  const [correctFieldErrors, setCorrectFieldErrors] = useState({});
  const [negotiateFieldError, setNegotiateFieldError] = useState("");
  const [negotiateCounterError, setNegotiateCounterError] = useState("");
  const [reviseFieldError, setReviseFieldError] = useState("");

  const user = useMemo(() => {
    if (loggedInUser) {
      return loggedInUser;
    }
    try {
      return JSON.parse(localStorage.getItem("user") || "null") || {};
    } catch {
      return {};
    }
  }, [loggedInUser]);

  const correctionSummary = useMemo(() => {
    if (!offer || !correctOpen) {
      return null;
    }

    return {
      ctc: {
        from: offer.offeredCtc ?? offer.offered_ctc,
        to: correctForm.offeredCtc
      },
      joiningDate: {
        from: offer.expectedJoiningDate || offer.expected_joining_date,
        to: correctForm.expectedJoiningDate
      },
      variablePay: {
        from: offer.variablePay ?? offer.variable_pay,
        to: correctForm.variablePay
      },
      joiningBonus: {
        from: offer.joiningBonus ?? offer.joining_bonus,
        to: correctForm.joiningBonus
      }
    };
  }, [correctOpen, correctForm, offer]);

  const amendmentSummary = useMemo(() => {
    if (!offer || !amendOpen) {
      return null;
    }

    return {
      ctc: {
        from: offer.offeredCtc ?? offer.offered_ctc,
        to: amendForm.offeredCtc
      },
      joiningDate: {
        from: offer.expectedJoiningDate || offer.expected_joining_date,
        to: amendForm.expectedJoiningDate
      },
      variablePay: {
        from: offer.variablePay ?? offer.variable_pay,
        to: amendForm.variablePay
      },
      joiningBonus: {
        from: offer.joiningBonus ?? offer.joining_bonus,
        to: amendForm.joiningBonus
      }
    };
  }, [amendOpen, amendForm, offer]);

  if (!offer) {
    return <OfferApprovedSummaryPanel offer={null} />;
  }

  const status = resolveOfferStatus(offer);
  const canRelease = status === "Approved";
  const canRevise = status === "Draft";
  const clarificationPending = offer.clarificationPending || null;
  const canRespondToClarification =
    Boolean(onSubmitClarification) && canRespondToOfferClarification(offer, user);
  const canCorrectPending =
    isPendingApprovalStatus(status)
    && Boolean(onCorrectPendingApproval)
    && canWritePendingApprovalOffer(offer, user)
    && !clarificationPending;
  const canAmendApproved =
    status === "Approved"
    && Boolean(onAmendApproved)
    && canWritePendingApprovalOffer(offer, user);
  const canNegotiate = ["Approved", "Released"].includes(status);
  const canAccept = status === "Released";
  const canWithdraw =
    Boolean(onWithdraw)
    && canWithdrawOfferStatus(status)
    && (!isPendingApprovalStatus(status) || canWritePendingApprovalOffer(offer, user));

  const openCorrectDialog = () => {
    setCorrectForm({
      offeredCtc: String(offer.offeredCtc ?? offer.offered_ctc ?? ""),
      expectedJoiningDate: offer.expectedJoiningDate || offer.expected_joining_date || "",
      variablePay: String(offer.variablePay ?? offer.variable_pay ?? 0),
      variablePayFrequency: offer.variablePayFrequency || offer.variable_pay_frequency || "Yearly",
      joiningBonus: String(offer.joiningBonus ?? offer.joining_bonus ?? 0),
      joiningBonusFrequency: offer.joiningBonusFrequency || offer.joining_bonus_frequency || "One Time"
    });
    setCorrectionReason("");
    setCorrectOpen(true);
  };

  const openAmendDialog = () => {
    setAmendForm({
      offeredCtc: String(offer.offeredCtc ?? offer.offered_ctc ?? ""),
      expectedJoiningDate: offer.expectedJoiningDate || offer.expected_joining_date || "",
      variablePay: String(offer.variablePay ?? offer.variable_pay ?? 0),
      variablePayFrequency: offer.variablePayFrequency || offer.variable_pay_frequency || "Yearly",
      joiningBonus: String(offer.joiningBonus ?? offer.joining_bonus ?? 0),
      joiningBonusFrequency: offer.joiningBonusFrequency || offer.joining_bonus_frequency || "One Time"
    });
    setAmendmentReason("");
    setAmendOpen(true);
  };

  const handleAmend = async () => {
    const fieldErrors = validateWorkspaceCommercialForm(amendForm);
    setAmendFieldErrors(fieldErrors);

    if (Object.values(fieldErrors).some(Boolean) || !amendmentReason.trim()) {
      return;
    }

    await onAmendApproved?.(offer.offerId, {
      offered_ctc: Number(amendForm.offeredCtc),
      expected_joining_date: amendForm.expectedJoiningDate,
      variable_pay: Number(amendForm.variablePay || 0),
      variable_pay_frequency: amendForm.variablePayFrequency,
      joining_bonus: Number(amendForm.joiningBonus || 0),
      joining_bonus_frequency: amendForm.joiningBonusFrequency,
      reason: amendmentReason
    });
    setAmendOpen(false);
    setAmendFieldErrors({});
  };

  const handleNegotiate = async () => {
    const ctcError = validateOfferCtcAmount(proposedCtc, "Proposed CTC");
    const counterError = validateOptionalOfferCtcAmount(counterCtc, "Counter CTC");
    setNegotiateFieldError(ctcError);
    setNegotiateCounterError(counterError);
    if (ctcError || counterError) {
      return;
    }

    await onNegotiate?.(offer.offerId, {
      proposed_ctc: Number(proposedCtc),
      counter_ctc:
        String(counterCtc ?? "").trim() === "" ? undefined : Number(counterCtc),
      notes: negotiationNotes
    });
    setNegotiateOpen(false);
    setProposedCtc("");
    setCounterCtc("");
    setNegotiationNotes("");
    setNegotiateFieldError("");
    setNegotiateCounterError("");
  };

  const handleRevise = async () => {
    const ctcError = validateOfferCtcAmount(revisedCtc, "Offered CTC");
    setReviseFieldError(ctcError);
    if (ctcError) {
      return;
    }

    await onRevise?.(offer.offerId, {
      offered_ctc: Number(revisedCtc),
      reason: reviseReason
    });
    setReviseOpen(false);
    setRevisedCtc("");
    setReviseReason("");
    setReviseFieldError("");
  };

  const handleSubmitClarification = async () => {
    const comments = clarificationResponse.trim();
    if (!comments) {
      return;
    }
    await onSubmitClarification?.(offer.offerId, comments);
    setClarificationResponse("");
    dispatchApprovalNotificationsUpdated();
  };

  const handleCorrect = async () => {
    const fieldErrors = validateWorkspaceCommercialForm(correctForm);
    setCorrectFieldErrors(fieldErrors);

    if (Object.values(fieldErrors).some(Boolean) || !correctionReason.trim()) {
      return;
    }

    await onCorrectPendingApproval?.(offer.offerId, {
      offered_ctc: Number(correctForm.offeredCtc),
      expected_joining_date: correctForm.expectedJoiningDate,
      variable_pay: Number(correctForm.variablePay || 0),
      variable_pay_frequency: correctForm.variablePayFrequency,
      joining_bonus: Number(correctForm.joiningBonus || 0),
      joining_bonus_frequency: correctForm.joiningBonusFrequency,
      reason: correctionReason
    });
    setCorrectOpen(false);
    setCorrectFieldErrors({});
  };

  return (
    <Stack spacing={1.5}>
      <OfferApprovedSummaryPanel offer={offer} />

      {isPendingApprovalStatus(status) && !canCorrectPending && !canRespondToClarification ? (
        <Alert severity="info" variant="outlined">
          Pending-approval correction and discard are limited to the assigned recruiter, TA Lead, or
          Admin. If an approver requested clarification, resolve it before correcting.
        </Alert>
      ) : null}

      {(offer.clarificationRounds || []).length ? (
        <ClarificationTimeline
          rounds={(offer.clarificationRounds || []).filter((round) => !round.pending)}
          workflowTimeline={[]}
          requestorName={user.full_name || user.email_id || "You"}
        />
      ) : null}

      {canRespondToClarification ? (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
            border: 1,
            borderColor: "warning.main"
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
            Clarification required
          </Typography>
          {clarificationPending?.request_comments ? (
            <Typography variant="body2" sx={{ fontSize: 13, mb: 1.5 }}>
              {clarificationPending.request_comments}
            </Typography>
          ) : null}
          <TextField
            fullWidth
            required
            multiline
            minRows={3}
            size="small"
            label="Your response"
            value={clarificationResponse}
            onChange={(event) => setClarificationResponse(event.target.value)}
            disabled={busy}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={busy || !clarificationResponse.trim()}
            onClick={handleSubmitClarification}
            sx={{ fontWeight: 600 }}
          >
            Submit clarification
          </Button>
        </Box>
      ) : null}

      {(canRelease || canRevise || canCorrectPending || canAmendApproved || canNegotiate || canAccept || canWithdraw) ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper"
          }}
        >
          {canRelease ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<SendOutlinedIcon />}
              disabled={busy}
              onClick={() => onRelease?.(offer.offerId)}
            >
              Release Offer
            </Button>
          ) : null}
          {canCorrectPending ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon />}
              disabled={busy}
              onClick={openCorrectDialog}
            >
              Correct & Resubmit
            </Button>
          ) : null}
          {canAmendApproved ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon />}
              disabled={busy}
              onClick={openAmendDialog}
            >
              Amend & Resubmit
            </Button>
          ) : null}
          {canRevise ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon />}
              disabled={busy}
              onClick={() => {
                setRevisedCtc(String(offer.offeredCtc ?? offer.offered_ctc ?? ""));
                setReviseOpen(true);
              }}
            >
              Revise CTC
            </Button>
          ) : null}
          {canNegotiate ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<HandshakeOutlinedIcon />}
              disabled={busy}
              onClick={() => {
                setProposedCtc(String(offer.offeredCtc ?? offer.offered_ctc ?? ""));
                setNegotiateOpen(true);
              }}
            >
              Record Negotiation
            </Button>
          ) : null}
          {canAccept ? (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleOutlinedIcon />}
              disabled={busy}
              onClick={() => onAccept?.(offer.offerId)}
            >
              Mark Accepted
            </Button>
          ) : null}
          {canWithdraw ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<UndoOutlinedIcon />}
              disabled={busy}
              onClick={() => {
                setWithdrawReason("");
                setWithdrawOpen(true);
              }}
            >
              {isPendingApprovalStatus(status) ? "Discard Request" : "Withdraw Offer"}
            </Button>
          ) : null}
        </Box>
      ) : null}

      <EnterpriseConfirmationDialog
        open={withdrawOpen}
        title={
          isPendingApprovalStatus(status)
            ? "Discard this pending offer request?"
            : "Withdraw this offer request?"
        }
        message={
          isPendingApprovalStatus(status)
            ? "Active approval work will be cancelled and the offer will move to Withdrawn. A new request will need a new offer ID."
            : "The offer will move to Withdrawn and leave active approval or release queues."
        }
        confirmLabel={isPendingApprovalStatus(status) ? "Discard" : "Withdraw"}
        confirmColor="error"
        loading={busy}
        onClose={() => {
          if (!busy) {
            setWithdrawOpen(false);
          }
        }}
        onConfirm={async () => {
          if (!String(withdrawReason || "").trim()) {
            return;
          }
          await onWithdraw?.(offer.offerId, withdrawReason);
          setWithdrawOpen(false);
          setWithdrawReason("");
        }}
      >
        <TextField
          label="Reason"
          value={withdrawReason}
          onChange={(event) => setWithdrawReason(event.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={{ mt: 2 }}
          required
        />
      </EnterpriseConfirmationDialog>

      <Dialog open={amendOpen} onClose={() => !busy && setAmendOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Amend Approved Offer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning" variant="outlined">
              Amended terms require a full new approval cycle. The offer will return to Pending
              Approval and prior approval decisions are kept for audit only.
            </Alert>
            <TextField
              label="Offered CTC"
              type="number"
              value={amendForm.offeredCtc}
              onChange={(event) =>
                setAmendForm((prev) => ({ ...prev, offeredCtc: event.target.value }))
              }
              fullWidth
              error={Boolean(amendFieldErrors.offeredCtc)}
              helperText={amendFieldErrors.offeredCtc || " "}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
            <TextField
              label="Expected joining date"
              type="date"
              value={amendForm.expectedJoiningDate || ""}
              onChange={(event) =>
                setAmendForm((prev) => ({ ...prev, expectedJoiningDate: event.target.value }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Variable pay"
              type="number"
              value={amendForm.variablePay}
              onChange={(event) =>
                setAmendForm((prev) => ({ ...prev, variablePay: event.target.value }))
              }
              fullWidth
              error={Boolean(amendFieldErrors.variablePay)}
              helperText={amendFieldErrors.variablePay || " "}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <TextField
              label="Variable pay frequency"
              value={amendForm.variablePayFrequency}
              onChange={(event) =>
                setAmendForm((prev) => ({ ...prev, variablePayFrequency: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Joining bonus"
              type="number"
              value={amendForm.joiningBonus}
              onChange={(event) =>
                setAmendForm((prev) => ({ ...prev, joiningBonus: event.target.value }))
              }
              fullWidth
              error={Boolean(amendFieldErrors.joiningBonus)}
              helperText={amendFieldErrors.joiningBonus || " "}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <TextField
              label="Joining bonus frequency"
              value={amendForm.joiningBonusFrequency}
              onChange={(event) =>
                setAmendForm((prev) => ({ ...prev, joiningBonusFrequency: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Amendment reason"
              value={amendmentReason}
              onChange={(event) => setAmendmentReason(event.target.value)}
              fullWidth
              multiline
              minRows={2}
              required
            />
            {amendmentSummary ? (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Summary of changes
                </Typography>
                <Typography variant="body2">
                  CTC: {amendmentSummary.ctc.from} → {amendmentSummary.ctc.to}
                </Typography>
                <Typography variant="body2">
                  Joining date: {amendmentSummary.joiningDate.from || "—"} →{" "}
                  {amendmentSummary.joiningDate.to || "—"}
                </Typography>
                <Typography variant="body2">
                  Variable pay: {amendmentSummary.variablePay.from} → {amendmentSummary.variablePay.to}
                </Typography>
                <Typography variant="body2">
                  Joining bonus: {amendmentSummary.joiningBonus.from} → {amendmentSummary.joiningBonus.to}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAmendOpen(false)} disabled={busy}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !amendmentReason.trim() || !amendForm.offeredCtc}
            onClick={handleAmend}
          >
            Resubmit for approval
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={correctOpen} onClose={() => setCorrectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Correct & Resubmit for Approval</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning" variant="outlined">
              Pending approval steps will restart from step 1. Completed approval history is kept for
              audit.
            </Alert>
            <TextField
              label="Offered CTC"
              type="number"
              value={correctForm.offeredCtc}
              onChange={(event) =>
                setCorrectForm((prev) => ({ ...prev, offeredCtc: event.target.value }))
              }
              fullWidth
              error={Boolean(correctFieldErrors.offeredCtc)}
              helperText={correctFieldErrors.offeredCtc || " "}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
            <TextField
              label="Expected joining date"
              type="date"
              value={correctForm.expectedJoiningDate || ""}
              onChange={(event) =>
                setCorrectForm((prev) => ({ ...prev, expectedJoiningDate: event.target.value }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Variable pay"
              type="number"
              value={correctForm.variablePay}
              onChange={(event) =>
                setCorrectForm((prev) => ({ ...prev, variablePay: event.target.value }))
              }
              fullWidth
              error={Boolean(correctFieldErrors.variablePay)}
              helperText={correctFieldErrors.variablePay || " "}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <TextField
              label="Variable pay frequency"
              value={correctForm.variablePayFrequency}
              onChange={(event) =>
                setCorrectForm((prev) => ({ ...prev, variablePayFrequency: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Joining bonus"
              type="number"
              value={correctForm.joiningBonus}
              onChange={(event) =>
                setCorrectForm((prev) => ({ ...prev, joiningBonus: event.target.value }))
              }
              fullWidth
              error={Boolean(correctFieldErrors.joiningBonus)}
              helperText={correctFieldErrors.joiningBonus || " "}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <TextField
              label="Joining bonus frequency"
              value={correctForm.joiningBonusFrequency}
              onChange={(event) =>
                setCorrectForm((prev) => ({ ...prev, joiningBonusFrequency: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Correction reason"
              value={correctionReason}
              onChange={(event) => setCorrectionReason(event.target.value)}
              fullWidth
              multiline
              minRows={2}
              required
            />
            {correctionSummary ? (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Summary of changes
                </Typography>
                <Typography variant="body2">CTC: {correctionSummary.ctc.from} → {correctionSummary.ctc.to}</Typography>
                <Typography variant="body2">
                  Joining date: {correctionSummary.joiningDate.from || "—"} →{" "}
                  {correctionSummary.joiningDate.to || "—"}
                </Typography>
                <Typography variant="body2">
                  Variable pay: {correctionSummary.variablePay.from} → {correctionSummary.variablePay.to}
                </Typography>
                <Typography variant="body2">
                  Joining bonus: {correctionSummary.joiningBonus.from} → {correctionSummary.joiningBonus.to}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCorrectOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !correctionReason.trim() || !correctForm.offeredCtc}
            onClick={handleCorrect}
          >
            Resubmit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={negotiateOpen} onClose={() => setNegotiateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Negotiation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Proposed CTC"
              type="number"
              value={proposedCtc}
              onChange={(event) => setProposedCtc(event.target.value)}
              fullWidth
              error={Boolean(negotiateFieldError)}
              helperText={negotiateFieldError || " "}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
            <TextField
              label="Counter CTC (optional)"
              type="number"
              value={counterCtc}
              onChange={(event) => setCounterCtc(event.target.value)}
              fullWidth
              error={Boolean(negotiateCounterError)}
              helperText={negotiateCounterError || "Candidate counter-offer amount, if known."}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
            <TextField
              label="Notes"
              value={negotiationNotes}
              onChange={(event) => setNegotiationNotes(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNegotiateOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={busy || !proposedCtc} onClick={handleNegotiate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reviseOpen} onClose={() => setReviseOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Revise Offer CTC</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Offered CTC"
              type="number"
              value={revisedCtc}
              onChange={(event) => setRevisedCtc(event.target.value)}
              fullWidth
              error={Boolean(reviseFieldError)}
              helperText={reviseFieldError || " "}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
            <TextField
              label="Reason"
              value={reviseReason}
              onChange={(event) => setReviseReason(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviseOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={busy || !revisedCtc} onClick={handleRevise}>
            Revise
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default OfferWorkspaceDetailPanel;
