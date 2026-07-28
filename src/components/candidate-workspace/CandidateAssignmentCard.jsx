import { useMemo } from "react";

import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";

import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";

const OWNERSHIP_TOOLTIP =
  "Request ownership before assigning this candidate.";

function CandidateAssignmentCard({
  candidate = {},
  mapping = {},
  isOwner = false,
  onAssign,
  onRelease
}) {
  const isAssigned = Boolean(mapping?.req_id);
  const container = String(candidate.candidate_container || "")
    .trim()
    .toUpperCase();
  const isEnterpriseTalentPool = container === "TALENT_POOL";
  const isPipelineCandidate = container === "PIPELINE";

  const loggedInUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );
  const employeeCode = loggedInUser?.employee_code || "";

  const isInMyPipeline = Boolean(
    mapping?.req_id &&
    employeeCode &&
    (mapping?.recruiter_id === employeeCode || isOwner)
  );

  const canAssignRequisition =
    isEnterpriseTalentPool || isInMyPipeline || isOwner;
  const ownershipRestricted = !isAssigned && !canAssignRequisition;

  const statusChipLabel = (() => {
    if (isAssigned) {
      return "Assigned";
    }
    if (isPipelineCandidate) {
      return "Pipeline Candidate";
    }
    if (isEnterpriseTalentPool) {
      return "Enterprise Talent Pool";
    }
    return "Not Assigned";
  })();

  const statusChipColor = isAssigned ? "success" : "warning";

  const actionButton = isAssigned ? (
    <Button
      variant="contained"
      startIcon={<AddTaskOutlinedIcon />}
      fullWidth
      onClick={onRelease}
      sx={{
        mt: 1,
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600
      }}
    >
      Release Candidate
    </Button>
  ) : (
    <Button
      variant="contained"
      startIcon={<AddTaskOutlinedIcon />}
      fullWidth
      disabled={ownershipRestricted}
      onClick={onAssign}
      sx={{
        mt: 1,
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600
      }}
    >
      Assign Requisition
    </Button>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper"
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AssignmentTurnedInOutlinedIcon color="primary" />

          <Typography variant="h6" fontWeight={600}>
            Assignment
          </Typography>
        </Stack>

        <Chip
          size="small"
          color={statusChipColor}
          label={statusChipLabel}
        />
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>

        <Stack direction="row" spacing={1.5} alignItems="center">

          <WorkOutlineOutlinedIcon
            color="action"
            fontSize="small"
          />

          <Box>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Requisition
            </Typography>

            <Typography fontWeight={600}>
              {mapping?.req_code || "Not Assigned"}
            </Typography>

          </Box>

        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">

          <PersonOutlineOutlinedIcon
            color="action"
            fontSize="small"
          />

          <Box>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Recruiter
            </Typography>

            <Typography fontWeight={600}>
              {mapping?.recruiter_id || "—"}
            </Typography>

          </Box>

        </Stack>

        {ownershipRestricted ? (
          <Tooltip title={OWNERSHIP_TOOLTIP}>
            <span>{actionButton}</span>
          </Tooltip>
        ) : (
          actionButton
        )}

      </Stack>

    </Paper>
  );
}

export default CandidateAssignmentCard;
