import { useCallback, useEffect, useState } from "react";

import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import {
  EmptyState,
  InspectorDrawer,
  LoadingState,
  StatusChip
} from "../enterprise";
import WorkforceStatusChip from "../workforce-planning/WorkforceStatusChip";
import ApprovalTimeline from "../workforce-planning/ApprovalTimeline";
import ClarificationTimeline from "../workforce-planning/ClarificationTimeline";
import WorkforceRequisitionQueueService from "@/services/workforceRequisitionQueueService";
import { formatCurrency } from "@/utils/formatCurrency";

function DetailRow({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.25, fontWeight: 600 }}
      >
        {label}
      </Typography>
      {typeof value === "string" || typeof value === "number" ? (
        <Typography variant="body2">{value ?? "—"}</Typography>
      ) : (
        value || <Typography variant="body2">—</Typography>
      )}
    </Box>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString();
}

function formatBudget(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return formatCurrency(Number(value));
}

function SectionHeading({ children }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ fontWeight: 700, letterSpacing: 0.8, display: "block", mb: 1 }}
    >
      {children}
    </Typography>
  );
}

function RequisitionInspectorDrawer({ open, requisitionCode, onClose, onSubmitted }) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [clarificationResponse, setClarificationResponse] = useState("");
  const [clarificationResponseTouched, setClarificationResponseTouched] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const clarificationResponseValid = Boolean(clarificationResponse.trim());

  const loadDetail = useCallback(async () => {
    if (!requisitionCode) {
      return;
    }

    setIsLoading(true);
    setLoadError("");
    setDetail(null);
    setClarificationResponse("");
    setClarificationResponseTouched(false);
    setSubmitError("");

    try {
      const response = await WorkforceRequisitionQueueService.getInspectorDetail(
        requisitionCode
      );
      setDetail(response?.data || null);

      if (!response?.data?.requisition) {
        setLoadError("Requisition not found.");
      }
    } catch (error) {
      setDetail(null);
      setLoadError(
        error.response?.data?.message || "Unable to load requisition details."
      );
    } finally {
      setIsLoading(false);
    }
  }, [requisitionCode]);

  useEffect(() => {
    if (open && requisitionCode) {
      loadDetail();
    } else if (!open) {
      setDetail(null);
      setLoadError("");
      setIsLoading(false);
      setClarificationResponse("");
      setClarificationResponseTouched(false);
      setSubmitError("");
    }
  }, [open, requisitionCode, loadDetail]);

  const handleSubmitClarification = async () => {
    setClarificationResponseTouched(true);

    if (!clarificationResponseValid || !requisitionCode) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await WorkforceRequisitionQueueService.submitClarification(
        requisitionCode,
        clarificationResponse.trim()
      );
      setClarificationResponse("");
      setClarificationResponseTouched(false);
      await loadDetail();
      onSubmitted?.();
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Unable to submit clarification."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const requisition = detail?.requisition;
  const requestor = detail?.requestor;
  const approvalSteps = detail?.approval_steps || [];
  const clarificationRounds = detail?.clarification_rounds || [];
  const clarificationPending = detail?.clarification_pending;
  const canResubmit = Boolean(detail?.can_resubmit);
  const timeline = (detail?.timeline || []).map((event) => ({
    step: event.event,
    actor: event.actor_role
      ? `${event.actor || "—"} · ${event.actor_role}`
      : event.actor || "—",
    date: event.recorded_on,
    comment: event.comment || null
  }));

  return (
    <InspectorDrawer
      open={open}
      onClose={onClose}
      title="Requisition Details"
      subtitle={requisition?.requisition_code || requisitionCode || ""}
    >
      {isLoading ? (
        <LoadingState message="Loading requisition details..." />
      ) : loadError ? (
        <EmptyState
          icon={ErrorOutlineOutlinedIcon}
          title="Unable to load requisition"
          description={loadError}
          actionLabel="Retry"
          onAction={loadDetail}
        />
      ) : requisition ? (
        <Stack spacing={2.5}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: 18 }}>
                {requisition.requisition_code}
              </Typography>
              <WorkforceStatusChip status={requisition.req_status || "—"} />
            </Stack>
          </Box>

          {clarificationRounds.length ? (
            <ClarificationTimeline
              rounds={clarificationRounds.filter((round) => !round.pending)}
              workflowTimeline={[]}
              requestorName={requestor?.name}
            />
          ) : null}

          {canResubmit ? (
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
                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 11, fontWeight: 600 }}
                  >
                    Approver&apos;s clarification
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 13, mt: 0.25 }}>
                    {clarificationPending.request_comments}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 11, display: "block", mt: 0.5 }}
                  >
                    {clarificationPending.requested_by || "Approver"}
                    {clarificationPending.requested_on
                      ? ` · ${formatDateTime(clarificationPending.requested_on)}`
                      : ""}
                  </Typography>
                </Box>
              ) : null}

              <TextField
                fullWidth
                required
                multiline
                minRows={3}
                size="small"
                label="Your response"
                placeholder="Enter your clarification response for the approver…"
                value={clarificationResponse}
                onChange={(event) => {
                  setClarificationResponse(event.target.value);
                  if (clarificationResponseTouched) {
                    setClarificationResponseTouched(true);
                  }
                }}
                onBlur={() => setClarificationResponseTouched(true)}
                disabled={isSubmitting}
                error={clarificationResponseTouched && !clarificationResponseValid}
                helperText={
                  clarificationResponseTouched && !clarificationResponseValid
                    ? "Please provide a response to the clarification request."
                    : "Required: Please provide a response to the clarification request."
                }
                sx={{ mb: 1.5 }}
              />

              {submitError ? (
                <Typography variant="caption" color="error" sx={{ display: "block", mb: 1 }}>
                  {submitError}
                </Typography>
              ) : null}

              <Button
                size="small"
                color="primary"
                variant="contained"
                disabled={!clarificationResponseValid || isSubmitting}
                onClick={handleSubmitClarification}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Submit Clarification
              </Button>
            </Box>
          ) : null}

          <Box>
            <SectionHeading>Requisition Details</SectionHeading>
            <Stack spacing={1.25}>
              <DetailRow label="Requisition Number" value={requisition.requisition_code} />
              <DetailRow label="Position / Designation" value={requisition.position_title} />
              <DetailRow
                label="Department / Project"
                value={requisition.department}
              />
              <DetailRow
                label="Client / Business Unit"
                value={requisition.business_unit}
              />
              <DetailRow label="Location" value={requisition.location} />
              <DetailRow label="Employment Type" value={requisition.employment_type} />
              <DetailRow label="Number of Positions" value={requisition.headcount} />
              <DetailRow
                label="Requested / Raised Date"
                value={formatDateTime(requisition.created_on)}
              />
              <DetailRow
                label="Expected Joining Date"
                value={formatDateTime(requisition.target_date)}
              />
              <DetailRow label="Priority" value={requisition.priority_level} />
              <DetailRow
                label="Current Status"
                value={<WorkforceStatusChip status={requisition.req_status || "—"} />}
              />
              <DetailRow label="Grade" value={requisition.grade} />
              <DetailRow label="Primary Skill" value={requisition.primary_skill} />
              <DetailRow
                label="Approved Position"
                value={requisition.approved_position_id}
              />
              <DetailRow label="Hiring Manager" value={requisition.hiring_manager} />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <SectionHeading>Requestor</SectionHeading>
            <Stack spacing={1.25}>
              <DetailRow label="Requestor Name" value={requestor?.name} />
              <DetailRow
                label="Employee Code"
                value={requestor?.employee_code}
              />
              <DetailRow label="Email" value={requestor?.email_id} />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <SectionHeading>Requisition Commercial / Workforce Details</SectionHeading>
            <Stack spacing={1.25}>
              <DetailRow
                label="Approved Budget"
                value={formatBudget(requisition.budget_approved)}
              />
              {requisition.job_description ? (
                <DetailRow
                  label="Job Description"
                  value={requisition.job_description}
                />
              ) : null}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <SectionHeading>Approval Summary</SectionHeading>
            {approvalSteps.length ? (
              <Stack spacing={1.25}>
                {approvalSteps.map((step) => (
                  <Box
                    key={`${step.step}-${step.approver_employee_code || step.title}`}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: "action.hover"
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                      Step {step.step}
                    </Typography>
                    <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                      <DetailRow label="Approver" value={step.approver_name} />
                      <DetailRow label="Role" value={step.approver_role} />
                      <DetailRow
                        label="Status"
                        value={<StatusChip status={step.status} variant="soft" />}
                      />
                      <DetailRow
                        label="Action Date/Time"
                        value={formatDateTime(step.action_on)}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No approval steps recorded for this requisition.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <SectionHeading>Approval Timeline</SectionHeading>
            {timeline.length ? (
              <ApprovalTimeline events={timeline} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No workflow timeline available.
              </Typography>
            )}
          </Box>
        </Stack>
      ) : (
        <EmptyState
          title="Requisition not found"
          description="The selected requisition could not be loaded."
        />
      )}
    </InspectorDrawer>
  );
}

export default RequisitionInspectorDrawer;
