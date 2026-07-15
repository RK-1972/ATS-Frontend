import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

import { EnterpriseSurface, StatusChip } from "@/components/enterprise";
import { formatExperience } from "@/enterprise/candidateWorkspaceUtils";

function CompactMeta({ label, value }) {
  return (
    <Box minWidth={0}>
      <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap lineHeight={1.3}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function CandidateHeroCard({
  candidate = {},
  mapping = {},
  displayName,
  profileCompletion = 0,
  profileCompletionBreakdown,
  skillChips = [],
  masterLabels = {},
  onAction
}) {
  const theme = useTheme();
  const { typography, radius } = theme.tokens;

  const resumeStatus = candidate.resume_path ? "Available" : "Missing";
  const stage = mapping.stage_name || candidate.current_stage || "Not mapped";
  const designation =
    masterLabels.designation !== "—"
      ? masterLabels.designation
      : candidate.current_designation || "—";

  return (
    <EnterpriseSurface
      elevation={1}
      padding
      sx={{
        mb: 1.5,
        p: { xs: 1.5, sm: 2 },
        background: (t) =>
          t.palette.mode === "dark"
            ? `linear-gradient(135deg, ${t.palette.primary.dark}18 0%, ${t.palette.background.paper} 50%)`
            : `linear-gradient(135deg, ${t.palette.primary.main}0d 0%, ${t.palette.background.paper} 55%)`
      }}
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems="stretch">
        <Stack direction="row" spacing={1.5} flex={1} minWidth={0} alignItems="flex-start">
          <Avatar
            src={candidate.profile_photo_url || undefined}
            sx={{
              width: 64,
              height: 64,
              fontSize: 24,
              borderRadius: `${radius.md}px`,
              boxShadow: 1
            }}
          >
            {(candidate.first_name?.[0] || "C").toUpperCase()}
          </Avatar>

          <Box flex={1} minWidth={0}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mb={0.25}>
              <Typography sx={{ ...typography.sectionTitle, fontSize: 20, lineHeight: 1.2 }}>
                {displayName}
              </Typography>
              <StatusChip status={masterLabels.status} variant="soft" size="small" />
              <Chip
                size="small"
                label={candidate.candidate_code || "—"}
                variant="outlined"
                sx={{ height: 22 }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={1} noWrap>
              {designation} · {candidate.current_company || "—"}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(5, minmax(0, 1fr))"
                },
                gap: 1.25,
                mb: 1
              }}
            >
              <CompactMeta label="Experience" value={formatExperience(candidate.total_experience)} />
              <CompactMeta label="Location" value={candidate.current_location} />
              <CompactMeta label="Recruiter" value={candidate.recruiter_name || candidate.recruiter_id} />
              <CompactMeta label="Source" value={masterLabels.source} />
              <CompactMeta label="Stage" value={stage} />
              <CompactMeta label="Resume" value={resumeStatus} />
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center">
              {skillChips.length > 0 ? (
                skillChips.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{ height: 24, borderRadius: `${radius.pill}px` }}
                  />
                ))
              ) : (
                <Chip label="Skills pending" size="small" variant="outlined" sx={{ height: 24 }} />
              )}
            </Stack>
          </Box>
        </Stack>

        <Box
          sx={{
            width: { xs: "100%", md: 240 },
            flexShrink: 0,
            p: 1.25,
            borderRadius: `${radius.md}px`,
            bgcolor: "background.default",
            border: 1,
            borderColor: "divider"
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" fontWeight={700}>
              Profile Completion
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight={700}>
              {profileCompletion}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={profileCompletion}
            sx={{ height: 6, borderRadius: 3, mb: 0.75 }}
          />
          {profileCompletionBreakdown?.sections && (
            <Stack spacing={0.25} mb={1}>
              {profileCompletionBreakdown.sections.map((section) => (
                <Stack key={section.key} direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {section.label}
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {section.percent}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0.75
            }}
          >
            <Tooltip title="Upload Resume">
              <IconButton size="small" color="primary" onClick={() => onAction?.("upload-resume")}>
                <UploadFileOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Resume">
              <span>
                <IconButton
                  size="small"
                  disabled={!candidate.resume_path}
                  onClick={() => onAction?.("download-resume")}
                >
                  <DownloadOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Map to Requisition">
              <IconButton size="small" onClick={() => onAction?.("map-requisition")}>
                <LinkOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Schedule Interview">
              <IconButton size="small" onClick={() => onAction?.("schedule-interview")}>
                <EventOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack direction="row" spacing={0.75} mt={1} sx={{ display: { md: "none" } }}>
            <Button size="small" variant="contained" fullWidth onClick={() => onAction?.("upload-resume")}>
              Upload
            </Button>
            <Button
              size="small"
              variant="outlined"
              fullWidth
              disabled={!candidate.resume_path}
              onClick={() => onAction?.("download-resume")}
            >
              Download
            </Button>
          </Stack>
        </Box>
      </Stack>
    </EnterpriseSurface>
  );
}

export default CandidateHeroCard;
