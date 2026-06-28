import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip
} from "@mui/material";

import {
  MdCancel,
  MdCheckCircleOutline,
  MdHelpOutline,
  MdReply,
  MdSend
} from "react-icons/md";

import ConfigSurface from "../platform-config/ConfigSurface";

function ApprovalWorkspaceContent({

  stage,
  showClarificationForm,
  clarificationDraft,
  onApprove,
  onReject,
  onRequestClarification,
  onSendClarification,
  onSubmitClarification,
  onUpdateClarification,
  onCancelClarification,
  embedded = false

}) {

  const isActionable =
    stage.status === "In Progress" ||
    stage.status === "Waiting for Clarification" ||
    stage.status === "Clarification Submitted";

  const isWaiting = stage.status === "Waiting for Clarification";

  return (

    <>

      {!embedded && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >

          <Typography variant="subtitle2" fontWeight={700}>
            Approval Workspace
          </Typography>

          <Chip
            label={stage.status}
            size="small"
            color={
              stage.status === "Completed"
                ? "success"
                : stage.status === "Waiting for Clarification"
                  ? "warning"
                  : stage.status === "Rejected"
                    ? "error"
                    : "primary"
            }
            variant={stage.status === "Completed" ? "filled" : "outlined"}
            sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
          />

        </Stack>
      )}

      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        {stage.name} · {stage.owner} · Unlimited clarification cycles
      </Typography>

      {isActionable && !isWaiting && !showClarificationForm && (

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap mb={1}>

          <Button
            variant="contained"
            size="small"
            color="success"
            startIcon={<MdCheckCircleOutline size={18} />}
            onClick={() => onApprove(stage.key)}
            sx={{ fontWeight: 600 }}
          >
            Approve
          </Button>

          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<MdCancel size={18} />}
            onClick={() => onReject(stage.key)}
            sx={{ fontWeight: 600 }}
          >
            Reject
          </Button>

          <Button
            variant="outlined"
            size="small"
            color="warning"
            startIcon={<MdHelpOutline size={18} />}
            onClick={() => onRequestClarification(stage.key)}
            sx={{ fontWeight: 600 }}
          >
            Request Clarification
          </Button>

        </Stack>

      )}

      {isWaiting && !showClarificationForm && (

        <Box
          sx={{
            p: 1,
            mb: 1,
            borderRadius: 1.5,
            bgcolor: "rgba(243, 156, 18, 0.08)",
            border: 1,
            borderColor: "warning.light"
          }}
        >

          <Typography variant="caption" fontWeight={700} color="warning.dark">
            Waiting for Clarification
          </Typography>

          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<MdReply size={18} />}
            onClick={() => onSubmitClarification(stage.key)}
            sx={{ mt: 0.75, fontWeight: 600 }}
          >
            Submit Clarification
          </Button>

        </Box>

      )}

      {showClarificationForm && (

        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            p: 1,
            bgcolor: "action.hover"
          }}
        >

          <Typography variant="caption" fontWeight={700} mb={0.75} display="block">
            Request Clarification
          </Typography>

          <Stack spacing={1}>

            <TextField
              label="Comment"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={clarificationDraft.comment}
              onChange={(e) =>
                onUpdateClarification("comment", e.target.value)
              }
            />

            <TextField
              label="Attach Document (mock)"
              size="small"
              fullWidth
              value={clarificationDraft.document}
              onChange={(e) =>
                onUpdateClarification("document", e.target.value)
              }
            />

            <Stack direction="row" spacing={1} flexWrap="wrap">

              <TextField
                label="Mention User"
                size="small"
                sx={{ flex: 1, minWidth: 120 }}
                value={clarificationDraft.mention}
                onChange={(e) =>
                  onUpdateClarification("mention", e.target.value)
                }
              />

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  label="Priority"
                  value={clarificationDraft.priority}
                  onChange={(e) =>
                    onUpdateClarification("priority", e.target.value)
                  }
                >
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Due Date"
                type="date"
                size="small"
                value={clarificationDraft.due_date}
                onChange={(e) =>
                  onUpdateClarification("due_date", e.target.value)
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />

            </Stack>

            <Stack direction="row" spacing={0.75}>

              <Button
                variant="contained"
                size="small"
                startIcon={<MdSend size={18} />}
                onClick={() => onSendClarification(stage.key)}
                sx={{ fontWeight: 600 }}
              >
                Send
              </Button>

              <Button
                variant="text"
                size="small"
                onClick={onCancelClarification}
              >
                Cancel
              </Button>

            </Stack>

          </Stack>

        </Box>

      )}

      {stage.status === "Completed" && (
        <Typography variant="caption" color="success.main" fontWeight={600}>
          Approval complete.
        </Typography>
      )}

    </>

  );

}

function StageApprovalPanel({

  embedded = false,
  stage,
  showClarificationForm,
  clarificationDraft,
  onApprove,
  onReject,
  onRequestClarification,
  onSendClarification,
  onSubmitClarification,
  onUpdateClarification,
  onCancelClarification

}) {

  if (!stage) {

    const empty = (
      <Typography variant="caption" color="text.secondary">
        Select an approval stage to take action.
      </Typography>
    );

    return embedded ? empty : <ConfigSurface>{empty}</ConfigSurface>;

  }

  if (!stage.is_approval_stage) {

    const msg = (
      <Typography variant="caption" color="text.secondary">
        Not an approval stage. Select Finance Approval, TA Leader Review, or
        Leadership Approval.
      </Typography>
    );

    return embedded ? msg : <ConfigSurface>{msg}</ConfigSurface>;

  }

  const content = (
    <ApprovalWorkspaceContent
      stage={stage}
      showClarificationForm={showClarificationForm}
      clarificationDraft={clarificationDraft}
      onApprove={onApprove}
      onReject={onReject}
      onRequestClarification={onRequestClarification}
      onSendClarification={onSendClarification}
      onSubmitClarification={onSubmitClarification}
      onUpdateClarification={onUpdateClarification}
      onCancelClarification={onCancelClarification}
      embedded={embedded}
    />
  );

  if (embedded) return content;

  return <ConfigSurface>{content}</ConfigSurface>;

}

export default StageApprovalPanel;
