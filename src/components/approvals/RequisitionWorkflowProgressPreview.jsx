import {
  Box,
  CircularProgress,
  Stack,
  Typography
} from "@mui/material";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import TripOriginOutlinedIcon from "@mui/icons-material/TripOriginOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

function formatPreviewDateTime(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function normalizeStepPhase(stepStatus = "") {
  const normalized = String(stepStatus || "").trim().toLowerCase();

  if (normalized === "completed") {
    return "completed";
  }

  if (normalized === "pending") {
    return "current";
  }

  if (
    normalized.includes("clarification")
    || normalized === "cancelled"
    || normalized === "rejected"
    || normalized === "returned"
  ) {
    return "special";
  }

  return "upcoming";
}

function resolveSpecialStateLabel(stepStatus = "") {
  const normalized = String(stepStatus || "").trim();

  if (!normalized) {
    return "Attention required";
  }

  return normalized;
}

export function buildRequisitionWorkflowPreviewStages(context, row = {}) {
  const stages = [];

  if (context?.submitted_on) {
    const requestorRole =
      String(row?.document_type || "").trim().toUpperCase() === "BUDGET"
        ? "Budget Requestor"
        : "Requisition Requestor";

    stages.push({
      key: "request-created",
      title: "Request Created",
      phase: "completed",
      statusLabel: "Completed",
      timestamp: context.submitted_on,
      approver: context.requestor_name || row.requestor || null,
      role: requestorRole
    });
  }

  (context?.approval_steps || []).forEach((step, index) => {
    const phase = normalizeStepPhase(step.status);

    stages.push({
      key: `approval-step-${step.step || index + 1}`,
      title: step.title || `Approval Step ${step.step || index + 1}`,
      phase,
      statusLabel:
        phase === "completed"
          ? "Completed"
          : phase === "current"
            ? "Current"
            : phase === "special"
              ? resolveSpecialStateLabel(step.status)
              : "Upcoming",
      timestamp: step.action_on || null,
      approver: step.approver_name || null,
      role: step.approver_role || null,
      rawStatus: step.status || null
    });
  });

  if (
    String(row?.task_type || "").toLowerCase() === "clarification"
    || context?.clarification_pending
  ) {
    stages.push({
      key: "clarification",
      title: "Clarification Required",
      phase: "special",
      statusLabel: "Clarification Required",
      timestamp:
        context?.clarification_pending?.requested_on
        || context?.clarification_pending?.recorded_on
        || null,
      approver: context?.clarification_pending?.requested_by || null,
      role: context?.clarification_pending?.requested_by_role || null,
      comment: context?.clarification_pending?.comments || null
    });
  }

  return stages;
}

function StageIcon({ phase }) {
  if (phase === "completed") {
    return (
      <CheckCircleOutlineOutlinedIcon
        sx={{ fontSize: 16, color: "success.main" }}
      />
    );
  }

  if (phase === "current") {
    return (
      <TripOriginOutlinedIcon
        sx={{ fontSize: 16, color: "primary.main" }}
      />
    );
  }

  if (phase === "special") {
    return (
      <ErrorOutlineOutlinedIcon
        sx={{ fontSize: 16, color: "warning.main" }}
      />
    );
  }

  return (
    <RadioButtonUncheckedOutlinedIcon
      sx={{ fontSize: 16, color: "text.disabled" }}
    />
  );
}

function WorkflowStageItem({ stage, isLast }) {
  const timestamp = formatPreviewDateTime(stage.timestamp);
  const isCurrent = stage.phase === "current";
  const isSpecial = stage.phase === "special";

  return (
    <Box sx={{ display: "flex", gap: 1.25 }}>
      <Stack alignItems="center" spacing={0} sx={{ pt: 0.15 }}>
        <StageIcon phase={stage.phase} />
        {!isLast ? (
          <Box
            sx={{
              width: "1px",
              flex: 1,
              minHeight: 18,
              bgcolor: "divider",
              my: 0.5
            }}
          />
        ) : null}
      </Stack>

      <Box sx={{ flex: 1, minWidth: 0, pb: isLast ? 0 : 1.25 }}>
        <Typography
          variant="body2"
          fontWeight={isCurrent ? 700 : 600}
          color={isCurrent ? "primary.main" : "text.primary"}
          sx={{ fontSize: 13, lineHeight: 1.35 }}
        >
          {stage.title}
        </Typography>

        <Typography
          variant="caption"
          color={
            isSpecial
              ? "warning.main"
              : isCurrent
                ? "primary.main"
                : "text.secondary"
          }
          sx={{ display: "block", fontWeight: 600, mt: 0.25 }}
        >
          {stage.statusLabel}
        </Typography>

        {stage.approver || stage.role ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.25, lineHeight: 1.4 }}
          >
            {[
              stage.approver,
              stage.role
            ].filter(Boolean).join(" · ")}
          </Typography>
        ) : null}

        {isCurrent && stage.approver ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.25 }}
          >
            Awaiting approval from {stage.approver}
          </Typography>
        ) : null}

        {timestamp ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.25 }}
          >
            {timestamp}
          </Typography>
        ) : null}

        {stage.comment ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.25, lineHeight: 1.4 }}
          >
            {stage.comment}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function RequisitionWorkflowProgressPreview({
  requisitionCode,
  documentCode,
  row,
  context,
  loading = false,
  error = ""
}) {
  const stages = buildRequisitionWorkflowPreviewStages(context, row);
  const headerCode = documentCode || requisitionCode;

  return (
    <Box sx={{ width: 320, p: 1.75 }}>
      <Stack spacing={1.25}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {headerCode}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Approval Progress
          </Typography>
        </Box>

        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Loading workflow progress…
            </Typography>
          </Stack>
        ) : null}

        {!loading && error ? (
          <Typography variant="caption" color="error.main">
            {error}
          </Typography>
        ) : null}

        {!loading && !error && stages.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No workflow progress available.
          </Typography>
        ) : null}

        {!loading && !error && stages.length > 0 ? (
          <Stack spacing={0}>
            {stages.map((stage, index) => (
              <WorkflowStageItem
                key={stage.key}
                stage={stage}
                isLast={index === stages.length - 1}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

export default RequisitionWorkflowProgressPreview;
