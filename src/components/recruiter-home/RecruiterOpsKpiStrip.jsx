import { Box, Typography } from "@mui/material";
import { DESIGN, PANEL_SHELL, SUMMARY_STRIP_HEIGHT } from "./recruiterHomeTokens";

function MetricSegment({ value, label }) {
  return (
    <Typography component="span" sx={{ fontSize: 13, color: DESIGN.textSecondary, whiteSpace: "nowrap" }}>
      <Box component="span" sx={{ fontWeight: 700, color: DESIGN.textPrimary }}>{value}</Box>
      {" "}{label}
    </Typography>
  );
}

function RecruiterOpsKpiStrip({
  totalCandidates = 0,
  actionCount = 0,
  interviewsTodayCount = 0,
  pendingFeedbackCount = 0,
  offersInPipeline = 0
}) {
  const segments = [
    { value: totalCandidates, label: "Active Candidates" },
    { value: actionCount, label: "Actions Pending" },
    { value: interviewsTodayCount, label: "Interviews Today" },
    { value: pendingFeedbackCount, label: "Feedback Pending" },
    { value: offersInPipeline, label: "Offer Stage" }
  ];

  return (
    <Box
      sx={{
        ...PANEL_SHELL,
        height: SUMMARY_STRIP_HEIGHT,
        maxHeight: SUMMARY_STRIP_HEIGHT,
        display: "flex",
        alignItems: "center",
        px: 1.5,
        mb: 0.5,
        flexShrink: 0,
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 0,
          overflow: "hidden",
          width: "100%"
        }}
      >
        {segments.map((seg, index) => (
          <Box key={seg.label} sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {index > 0 && (
              <Typography
                component="span"
                sx={{ mx: 1.25, fontSize: 13, color: DESIGN.textMuted, userSelect: "none" }}
              >
                •
              </Typography>
            )}
            <MetricSegment value={seg.value} label={seg.label} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default RecruiterOpsKpiStrip;
