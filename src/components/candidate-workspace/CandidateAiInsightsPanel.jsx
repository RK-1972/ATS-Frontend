import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Typography
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { useTheme } from "@mui/material/styles";

import { AIInsightCard, EnterpriseSurface, EnterpriseModuleIcon, MetricCell } from "@/components/enterprise";

function PlaceholderInsight({ title, description, chips = [], highlight = false }) {
  const theme = useTheme();
  const { radius } = theme.tokens;

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: `${radius.sm}px`,
        border: 1,
        borderColor: highlight ? "primary.main" : "divider",
        bgcolor: highlight ? undefined : "background.default",
        background: highlight
          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
          : undefined,
        color: highlight ? "primary.contrastText" : "inherit"
      }}
    >
      <Typography variant="body2" fontWeight={700} mb={0.25}>
        {title}
      </Typography>
      <Typography
        variant="caption"
        display="block"
        mb={chips.length ? 0.75 : 0}
        sx={{ color: highlight ? "inherit" : "text.secondary", opacity: highlight ? 0.92 : 1 }}
      >
        {description}
      </Typography>
      {chips.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {chips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              size="small"
              variant={highlight ? "filled" : "outlined"}
              sx={
                highlight
                  ? { bgcolor: "rgba(255,255,255,0.18)", color: "inherit", borderColor: "transparent" }
                  : undefined
              }
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

function CandidateAiInsightsPanel({ open, onToggle, skillChips = [] }) {
  const theme = useTheme();

  if (!open) {
    return (
      <Box
        sx={{
          width: 44,
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          pt: 0.5
        }}
      >
        <IconButton onClick={onToggle} aria-label="Expand AI insights" size="small">
          <AutoAwesomeOutlinedIcon color="primary" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: "100%", lg: 300 },
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        maxHeight: { lg: "calc(100vh - 160px)" },
        overflow: "auto",
        position: { lg: "sticky" },
        top: { lg: 12 }
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={0.75} alignItems="center">
          <EnterpriseModuleIcon
            icon={AutoAwesomeOutlinedIcon}
            module="team"
            density="sm"
            size={28}
            iconSize={16}
          />
          <Typography variant="subtitle2" fontWeight={700}>
            AI Insights
          </Typography>
          <Chip label="Preview" size="small" color="primary" variant="outlined" sx={{ height: 22 }} />
        </Stack>
        <IconButton size="small" onClick={onToggle} sx={{ display: { xs: "none", lg: "inline-flex" } }}>
          <ChevronRightOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <AIInsightCard
        title="Candidate Summary"
        placeholder="AI narrative summary of profile, trajectory, and hiring context."
      />

      <EnterpriseSurface sx={{ p: 1.25 }}>
        <Typography variant="caption" fontWeight={700} display="block" mb={0.75}>
          Fitment Score
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <MetricCell label="Match" value="—" placeholder />
          <Box flex={1}>
            <LinearProgress variant="determinate" value={0} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        </Stack>
      </EnterpriseSurface>

      <PlaceholderInsight
        title="Strengths"
        description="Ranked strengths against role requirements."
        chips={["Delivery", "Communication", "Technical Depth"]}
      />
      <PlaceholderInsight
        title="Missing Skills"
        description="Gap analysis for target requisition."
        chips={["Kubernetes", "System Design"]}
      />
      <PlaceholderInsight
        title="Suggested Requisitions"
        description="Best-fit open roles by match score."
        chips={["REQ-24001", "REQ-24018"]}
      />
      <PlaceholderInsight
        title="Interview Readiness"
        description="Stage readiness and preparation signals."
        chips={skillChips.slice(0, 2)}
      />
      <PlaceholderInsight
        title="Missing Documents"
        description="Compliance and completeness checks."
        chips={["Passport", "Experience Letter"]}
      />
      <PlaceholderInsight title="Recent Activity" description="AI-curated highlights from timeline." />
      <PlaceholderInsight
        title="Next Best Action"
        description="Recommended recruiter action for today."
        chips={["Schedule Interview"]}
        highlight
      />
      <PlaceholderInsight
        title="Duplicate Candidate Detection"
        description="Potential duplicate profiles across channels."
        chips={["92% match · C-240118"]}
      />
    </Box>
  );
}

export default CandidateAiInsightsPanel;
