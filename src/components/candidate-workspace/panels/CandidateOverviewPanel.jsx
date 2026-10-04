import { Box, Typography, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { EnterpriseSurface, MetricCell } from "@/components/enterprise";
import { formatExperience } from "@/enterprise/candidateWorkspaceUtils";
import PersonIdentityText from "@/components/candidate-workspace/PersonIdentityText";

function SummaryCard({ title, children, sx = {} }) {
  const theme = useTheme();
  const { typography } = theme.tokens;

  return (
    <EnterpriseSurface sx={{ height: "100%", ...sx }}>
      <Typography sx={{ ...typography.sectionTitle, fontSize: 15, mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </EnterpriseSurface>
  );
}

function FieldRow({ label, value }) {
  const isNode = value !== null && value !== undefined && typeof value === "object";

  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} py={0.75}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {isNode ? (
        <Box sx={{ textAlign: "right", minWidth: 0, maxWidth: "65%" }}>{value}</Box>
      ) : (
        <Typography variant="body2" fontWeight={600} textAlign="right">
          {value || "—"}
        </Typography>
      )}
    </Stack>
  );
}

function CandidateOverviewPanel({
  candidate = {},
  mapping = {},
  masterLabels = {},
  profileCompletion = 0,
  profileCompletionBreakdown
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(3, minmax(0, 1fr))"
        },
        gap: 2,
        minWidth: 0,
        maxWidth: "100%",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <SummaryCard title="Personal Summary">
        <FieldRow label="Full Name" value={`${candidate.first_name || ""} ${candidate.last_name || ""}`.trim()} />
        <FieldRow label="Email" value={candidate.email_id} />
        <FieldRow label="Mobile" value={candidate.mobile_number} />
        <FieldRow label="PAN" value={candidate.pan_number} />
      </SummaryCard>

      <SummaryCard title="Current Employment">
        <FieldRow label="Company" value={candidate.current_company} />
        <FieldRow label="Designation" value={masterLabels.designation !== "—" ? masterLabels.designation : candidate.current_designation} />
        <FieldRow label="Experience" value={formatExperience(candidate.total_experience)} />
        <FieldRow label="Location" value={candidate.current_location} />
      </SummaryCard>

      <SummaryCard title="Candidate Source">
        <FieldRow label="Source Channel" value={masterLabels.source} />
        <FieldRow label="Source Type" value={mapping.source_type} />
        <FieldRow label="Referral / Vendor" value={candidate.vendor_partner_code || candidate.referral_program_code} />
      </SummaryCard>

      <SummaryCard title="Recruiter">
        <FieldRow
          label="Assigned Recruiter"
          value={
            <PersonIdentityText
              name={candidate.recruiter_name}
              id={candidate.recruiter_id}
              align="right"
              noWrap
            />
          }
        />
        <FieldRow label="Created On" value={candidate.created_on ? new Date(candidate.created_on).toLocaleDateString() : "—"} />
        <FieldRow label="Last Updated" value={candidate.updated_on ? new Date(candidate.updated_on).toLocaleDateString() : "—"} />
      </SummaryCard>

      <SummaryCard title="Profile Completion">
        <MetricCell
          label="Overall"
          value={`${profileCompletion}%`}
          subtitle="Weighted across profile sections"
        />
        {profileCompletionBreakdown?.sections?.map((section) => (
          <Stack key={section.key} direction="row" justifyContent="space-between" py={0.5}>
            <Typography variant="caption" color="text.secondary">
              {section.label}
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {section.percent}%
            </Typography>
          </Stack>
        ))}
      </SummaryCard>
    </Box>
  );
}

export default CandidateOverviewPanel;
