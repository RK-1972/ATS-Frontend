import {
  Avatar,
  Box,
  Chip,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import {
  EmptyState,
  EnterpriseSurface,
  StatusChip
} from "@/components/enterprise";
import { formatExperience } from "@/enterprise/candidateWorkspaceUtils";

function DetailField({ label, value }) {
  return (
    <Box minWidth={0}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function HmCandidateDetailPanel({ candidate, requisition }) {
  const theme = useTheme();
  const { radius } = theme.tokens;

  if (!candidate) {
    return (
      <EnterpriseSurface sx={{ flex: 1, p: 2 }}>
        <EmptyState
          title="Select a candidate"
          description="Choose a candidate from the list to view read-only pipeline details."
        />
      </EnterpriseSurface>
    );
  }

  const displayName = [candidate.first_name, candidate.last_name]
    .filter(Boolean)
    .join(" ")
    .trim() || candidate.candidate_code || "Candidate";

  return (
    <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
      <EnterpriseSurface sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-start">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              borderRadius: `${radius.md}px`,
              bgcolor: "primary.main",
              color: "primary.contrastText"
            }}
          >
            {(candidate.first_name?.[0] || "C").toUpperCase()}
          </Avatar>

          <Box flex={1} minWidth={0}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexWrap="wrap"
            >
              <Typography variant="h6" fontWeight={700} noWrap>
                {displayName}
              </Typography>
              <StatusChip status={candidate.stage_name || "Applied"} />
              <Chip
                size="small"
                label="Read-only"
                variant="outlined"
                sx={{ height: 24 }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {candidate.candidate_code || "—"}
              {candidate.email_id ? ` · ${candidate.email_id}` : ""}
            </Typography>
          </Box>
        </Stack>
      </EnterpriseSurface>

      <EnterpriseSurface sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          Pipeline
        </Typography>

        <Stack spacing={1.5}>
          <DetailField label="Current stage" value={candidate.stage_name} />
          <DetailField label="Source" value={candidate.source_type} />
          <DetailField
            label="Applied on"
            value={
              candidate.applied_date
                ? new Date(candidate.applied_date).toLocaleDateString()
                : "—"
            }
          />
          <DetailField label="Recruiter" value={candidate.recruiter_id} />
          {candidate.remarks ? (
            <DetailField label="Remarks" value={candidate.remarks} />
          ) : null}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2" color="text.secondary">
          Full pipeline history is available through recruiter authorization only.
          This view shows the current authoritative stage from enterprise mappings.
        </Typography>
      </EnterpriseSurface>

      <EnterpriseSurface sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          Requisition context
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flexWrap="wrap"
          useFlexGap
        >
          <DetailField
            label="Requisition"
            value={candidate.requisition_code || requisition?.requisition_code}
          />
          <DetailField
            label="Position"
            value={candidate.job_title || requisition?.job_title}
          />
          <DetailField
            label="Client / BU"
            value={candidate.client_name || requisition?.client_name}
          />
          <DetailField
            label="Department"
            value={candidate.project_name || requisition?.project_name}
          />
        </Stack>
      </EnterpriseSurface>

      <EnterpriseSurface sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          Candidate profile
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flexWrap="wrap"
          useFlexGap
        >
          <DetailField label="Mobile" value={candidate.mobile_number} />
          <DetailField label="Primary skill" value={candidate.primary_skill} />
          <DetailField
            label="Experience"
            value={formatExperience(candidate.total_experience)}
          />
        </Stack>
      </EnterpriseSurface>
    </Stack>
  );
}

export default HmCandidateDetailPanel;
