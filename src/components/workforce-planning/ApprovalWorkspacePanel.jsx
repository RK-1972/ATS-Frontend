import {
  Box,
  Typography,
  Stack,
  TextField,
  Button
} from "@mui/material";

import { MdCancel, MdCheckCircleOutline, MdHelpOutline } from "react-icons/md";

import { useEffect, useMemo, useState } from "react";

import ConfigSurface from "../platform-config/ConfigSurface";
import { formatCurrency } from "@/utils/formatCurrency";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import WorkforceStatusChip from "./WorkforceStatusChip";
import ApprovalTimeline from "./ApprovalTimeline";
import ApprovalHistory from "./ApprovalHistory";
import useEnterpriseAudit from "../../hooks/useEnterpriseAudit";
import workforcePlanningClient from "@/api/clients/workforcePlanningClient";

function mapAuditToHistoryEntry(record) {
  const actionMap = {
    BudgetApproved: "Approved",
    BudgetRejected: "Rejected",
    BudgetRouted: "Level-1 Approved",
    ClarificationRequested: "Clarification Requested",
    ClarificationSubmitted: "Clarification Submitted",
    BudgetResumed: "Clarification Submitted",
    BudgetCompleted: "Approved"
  };

  return {
    action: actionMap[record.eventType] || record.action,
    actor: record.user,
    date: record.timestamp,
    comment: record.metadata?.comment || record.metadata?.comments || null
  };
}

function ApprovalWorkspacePanel({
  request,
  onApprove,
  onReject,
  onClarify,
  onResubmit
}) {
  const [comment, setComment] = useState("");
  const [actionContext, setActionContext] = useState(null);
  const [dialog, setDialog] = useState({ open: false, type: null });
  const [acting, setActing] = useState(false);
  const auditEvents = useEnterpriseAudit("Workforce Planning");

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      if (!request?.id) {
        setActionContext(null);
        return;
      }

      try {
        const context = await workforcePlanningClient.getBudgetActionContext(
          request.id
        );
        if (!cancelled) {
          setActionContext(context);
        }
      } catch {
        if (!cancelled) {
          setActionContext({ can_act: false, can_resubmit: false });
        }
      }
    }

    loadContext();
    return () => {
      cancelled = true;
    };
  }, [request?.id, request?.status, request?.current_approver]);

  const historyEntries = useMemo(() => {
    if (!request) {
      return [];
    }

    const auditHistory = auditEvents
      .filter(
        (record) =>
          record.entity === "Budget Request"
          && record.entityId === request.id
      )
      .map(mapAuditToHistoryEntry);

    return auditHistory.length ? auditHistory : request.history;
  }, [auditEvents, request]);

  if (!request) {
    return (
      <ConfigSurface sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
          Select a budget request to review
        </Typography>
      </ConfigSurface>
    );
  }

  const canAct = Boolean(actionContext?.can_act);
  const canResubmit = Boolean(actionContext?.can_resubmit);

  const openDialog = (type) => setDialog({ open: true, type });
  const closeDialog = () => {
    if (acting) return;
    setDialog({ open: false, type: null });
  };

  const dialogMeta = {
    approve: {
      title: "Approve Budget Request?",
      confirmLabel: "Approve",
      confirmColor: "success",
      needsComments: false
    },
    clarify: {
      title: "Request Clarification?",
      confirmLabel: "Send Back",
      confirmColor: "warning",
      needsComments: true
    },
    reject: {
      title: "Reject Budget Request?",
      confirmLabel: "Reject",
      confirmColor: "error",
      needsComments: true
    },
    resubmit: {
      title: "Resubmit Budget Request?",
      confirmLabel: "Resubmit",
      confirmColor: "primary",
      needsComments: false
    }
  }[dialog.type] || {};

  const handleConfirm = async () => {
    if (!dialog.type) return;

    if (dialogMeta.needsComments && !String(comment || "").trim()) {
      return;
    }

    setActing(true);
    try {
      if (dialog.type === "approve") {
        await onApprove(request.id, comment);
      } else if (dialog.type === "clarify") {
        await onClarify(request.id, comment);
      } else if (dialog.type === "reject") {
        await onReject(request.id, comment);
      } else if (dialog.type === "resubmit") {
        await onResubmit(request.id, comment);
      }
      setComment("");
      setDialog({ open: false, type: null });
    } finally {
      setActing(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <ConfigSurface>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={1}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: 11 }}
            >
              {request.id}
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              mt={0.25}
              sx={{ fontSize: 18, lineHeight: 1.25 }}
            >
              {request.position}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 13, mt: 0.25 }}
            >
              {request.department} · Grade {request.grade} · {request.headcount}{" "}
              HC · {formatCurrency(request.proposed_budget)}
            </Typography>
          </Box>
          <WorkforceStatusChip status={request.status} />
        </Stack>

        <Stack
          direction="row"
          spacing={3}
          mt={1.5}
          pt={1.5}
          borderTop={1}
          borderColor="divider"
          flexWrap="wrap"
          useFlexGap
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 11 }}
            >
              Submitted by
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
              {request.submitted_by}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 11 }}
            >
              Current approver
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
              {request.current_approver || "—"}
            </Typography>
          </Box>
        </Stack>

        <Box mt={1.5}>
          <Typography
            variant="body2"
            fontWeight={700}
            mb={0.5}
            sx={{ fontSize: 14 }}
          >
            Justification
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 13, lineHeight: 1.45 }}
          >
            {request.justification}
          </Typography>
        </Box>
      </ConfigSurface>

      <ApprovalTimeline events={request.timeline} />
      <ApprovalHistory entries={historyEntries} />

      {(canAct || canResubmit) && (
        <ConfigSurface>
          <Typography
            variant="body2"
            fontWeight={700}
            mb={1}
            sx={{ fontSize: 14 }}
          >
            {canResubmit ? "Clarification response" : "Review decision"}
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            placeholder={
              canResubmit
                ? "Optional comments for the approver…"
                : "Add comments…"
            }
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            sx={{ mb: 1.5 }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {canAct ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<MdCheckCircleOutline size={18} />}
                  onClick={() => openDialog("approve")}
                  sx={{ fontWeight: 600 }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<MdHelpOutline size={18} />}
                  onClick={() => openDialog("clarify")}
                  sx={{ fontWeight: 600 }}
                >
                  Clarify
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<MdCancel size={18} />}
                  onClick={() => openDialog("reject")}
                  sx={{ fontWeight: 600 }}
                >
                  Reject
                </Button>
              </>
            ) : null}

            {canResubmit ? (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => openDialog("resubmit")}
                sx={{ fontWeight: 600 }}
              >
                Resubmit
              </Button>
            ) : null}
          </Stack>
        </ConfigSurface>
      )}

      <EnterpriseConfirmationDialog
        open={dialog.open}
        title={dialogMeta.title || "Confirm"}
        message={`${request.id} — ${request.position}`}
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
          />
        ) : null}
      </EnterpriseConfirmationDialog>
    </Stack>
  );
}

export default ApprovalWorkspacePanel;
