import {
  Box,
  Typography,
  Stack,
  TextField,
  Button
} from "@mui/material";

import { MdCancel, MdCheckCircleOutline, MdUndo } from "react-icons/md";

import { useState, useMemo } from "react";

import ConfigSurface from "../platform-config/ConfigSurface";
import { formatCurrency } from "@/utils/formatCurrency";
import WorkforceStatusChip from "./WorkforceStatusChip";
import ApprovalTimeline from "./ApprovalTimeline";
import ApprovalHistory from "./ApprovalHistory";
import useEnterpriseAudit from "../../hooks/useEnterpriseAudit";

function mapAuditToHistoryEntry(record) {

  const actionMap = {
    BudgetApproved: "Approved",
    BudgetRejected: "Rejected",
    BudgetSentBack: "Sent Back"
  };

  return {
    action: actionMap[record.eventType] || record.action,
    actor: record.user,
    date: record.timestamp,
    comment: record.metadata?.comment || null
  };

}

function ApprovalWorkspacePanel({
  request,
  onApprove,
  onReject,
  onSendBack
}) {

  const [comment, setComment] = useState("");
  const auditEvents = useEnterpriseAudit("Workforce Planning");

  const historyEntries = useMemo(() => {

    if (!request) {
      return [];
    }

    const auditHistory = auditEvents
      .filter(
        (record) =>
          record.entity === "Budget Request" &&
          record.entityId === request.id
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

  const isActionable =
    request.status !== "Approved" &&
    request.status !== "Rejected";

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

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mt: 0.25 }}>
              {request.department} · Grade {request.grade} · {request.headcount} HC ·{" "}
              {formatCurrency(request.proposed_budget)}
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
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              Submitted by
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
              {request.submitted_by}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              Current approver
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
              {request.current_approver}
            </Typography>
          </Box>

        </Stack>

        <Box mt={1.5}>
          <Typography variant="body2" fontWeight={700} mb={0.5} sx={{ fontSize: 14 }}>
            Justification
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.45 }}>
            {request.justification}
          </Typography>
        </Box>

      </ConfigSurface>

      <ApprovalTimeline events={request.timeline} />

      <ApprovalHistory entries={historyEntries} />

      {isActionable && (

        <ConfigSurface>

          <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
            Review decision
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            placeholder="Add comments for the hiring manager or next approver…"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            sx={{ mb: 1.5 }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>

            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<MdCheckCircleOutline size={18} />}
              onClick={() => {
                onApprove(request.id, comment);
                setComment("");
              }}
              sx={{ fontWeight: 600 }}
            >
              Approve
            </Button>

            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<MdUndo size={18} />}
              onClick={() => {
                onSendBack(request.id, comment);
                setComment("");
              }}
              sx={{ fontWeight: 600 }}
            >
              Send back
            </Button>

            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<MdCancel size={18} />}
              onClick={() => {
                onReject(request.id, comment);
                setComment("");
              }}
              sx={{ fontWeight: 600 }}
            >
              Reject
            </Button>

          </Stack>

        </ConfigSurface>

      )}

    </Stack>

  );

}

export default ApprovalWorkspacePanel;
