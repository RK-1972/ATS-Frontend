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

import { EnterpriseSurface } from "@/components/enterprise";
import { formatExperience, formatPersonIdentity } from "@/enterprise/candidateWorkspaceUtils";
import PersonIdentityText from "@/components/candidate-workspace/PersonIdentityText";

function CompactMeta({ label, value, identityName, identityId, singleLine = false }) {
  const displayValue =
    identityName !== undefined
      ? formatPersonIdentity(identityName, identityId)
      : value || "—";

  const valueContent =
    identityName !== undefined ? (
      <PersonIdentityText
        name={identityName}
        id={identityId}
        variant="body2"
        fontWeight={600}
        noWrap={singleLine}
      />
    ) : (
      <Typography
        variant="body2"
        fontWeight={600}
        lineHeight={1.3}
        noWrap={singleLine}
        sx={{
          minWidth: 0,
          maxWidth: "100%",
          ...(singleLine
            ? {
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block"
              }
            : {
                overflowWrap: "anywhere",
                wordBreak: "break-word"
              })
        }}
      >
        {displayValue}
      </Typography>
    );

  return (
    <Box sx={{ minWidth: 0, maxWidth: "100%", width: "100%" }}>
      <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2} noWrap>
        {label}
      </Typography>
      <Tooltip title={displayValue} placement="top" disableHoverListener={displayValue === "—"}>
        <Box sx={{ minWidth: 0, maxWidth: "100%", lineHeight: 1.3 }}>{valueContent}</Box>
      </Tooltip>
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
        minWidth: 0,
        maxWidth: "100%",
        p: { xs: 1.5, sm: 2 },
        background: (t) =>
          t.palette.mode === "dark"
            ? `linear-gradient(135deg, ${t.palette.primary.dark}18 0%, ${t.palette.background.paper} 50%)`
            : `linear-gradient(135deg, ${t.palette.primary.main}0d 0%, ${t.palette.background.paper} 55%)`
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems="stretch"
        sx={{ minWidth: 0, maxWidth: "100%", width: "100%" }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          flex={1}
          minWidth={0}
          alignItems="flex-start"
          sx={{ minWidth: 0, maxWidth: "100%", pr: { md: 1.5 } }}
        >
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

          <Box flex={1} minWidth={0} sx={{ minWidth: 0, maxWidth: "100%" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              mb={1}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%"
              }}
            >
              {designation} · {candidate.current_company || "—"}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))"
                },
                columnGap: 2,
                rowGap: 1.25,
                mb: 1.25,
                minWidth: 0,
                maxWidth: "100%",
                width: "100%",
                boxSizing: "border-box",
                "& > *": {
                  minWidth: 0,
                  maxWidth: "100%"
                }
              }}
            >
              <CompactMeta label="Experience" value={formatExperience(candidate.total_experience)} />
              <CompactMeta label="Location" value={candidate.current_location} />
              <CompactMeta
                label="Recruiter"
                identityName={candidate.recruiter_name}
                identityId={candidate.recruiter_id}
                singleLine
              />
              <CompactMeta label="Source" value={masterLabels.source} singleLine />
              <CompactMeta label="Stage" value={stage} />
              <CompactMeta label="Resume" value={resumeStatus} />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.75,
                alignItems: "center",
                minWidth: 0,
                maxWidth: "100%",
                width: "100%"
              }}
            >
              {skillChips.length > 0 ? (
                skillChips.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{ height: 24, borderRadius: `${radius.pill}px`, maxWidth: "100%" }}
                  />
                ))
              ) : (
                <Chip label="Skills pending" size="small" variant="outlined" sx={{ height: 24 }} />
              )}
            </Box>
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
              display: { xs: "none", md: "grid" },
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

          <Stack direction="row" spacing={0.75} mt={1} sx={{ display: { xs: "flex", md: "none" } }}>
            <Button
              size="small"
              variant="contained"
              fullWidth
              onClick={() => onAction?.("upload-resume")}
              sx={{ minHeight: { xs: 44, md: 32 } }}
            >
              Upload
            </Button>
            <Button
              size="small"
              variant="outlined"
              fullWidth
              disabled={!candidate.resume_path}
              onClick={() => onAction?.("download-resume")}
              sx={{ minHeight: { xs: 44, md: 32 } }}
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
