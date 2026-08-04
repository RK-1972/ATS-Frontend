import { Box, Typography } from "@mui/material";
import {
  MdGroups,
  MdWorkOutline,
  MdEvent,
  MdRateReview,
  MdCardGiftcard
} from "react-icons/md";
import EnterpriseSurface from "@/components/enterprise/EnterpriseSurface";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import { DESIGN, PANEL_SHELL } from "./recruiterHomeTokens";

const CARDS = [
  {
    key: "candidates",
    label: "Active Candidates",
    icon: MdGroups,
    module: "candidates"
  },
  {
    key: "requisitions",
    label: "Open Requisitions",
    icon: MdWorkOutline,
    module: "requisitions"
  },
  {
    key: "interviews",
    label: "Interviews Today",
    icon: MdEvent,
    module: "interviews"
  },
  {
    key: "feedback",
    label: "Pending Feedback",
    icon: MdRateReview,
    module: "approvals"
  },
  {
    key: "offers",
    label: "Offer Stage",
    icon: MdCardGiftcard,
    module: "team"
  }
];

/**
 * Cockpit summary KPI cards — public contract unchanged.
 * Icons inherit Enterprise Module Icon standard (dense size for KPI strip).
 */
function CockpitSummaryCards({
  totalCandidates = 0,
  openRequisitions = 0,
  interviewsTodayCount = 0,
  pendingFeedbackCount = 0,
  offersInPipeline = 0
}) {
  const values = {
    candidates: totalCandidates,
    requisitions: openRequisitions,
    interviews: interviewsTodayCount,
    feedback: pendingFeedbackCount,
    offers: offersInPipeline
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" },
        gap: 1,
        mb: 1,
        flexShrink: 0
      }}
    >
      {CARDS.map(({ key, label, icon: Icon, module }) => (
        <EnterpriseSurface
          key={key}
          elevation={0}
          padding={false}
          sx={{
            ...PANEL_SHELL,
            px: 1.5,
            py: 1.25,
            transition: "none"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <EnterpriseModuleIcon
              icon={Icon}
              module={module}
              density="sm"
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: DESIGN.textSecondary, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, color: DESIGN.textPrimary, mt: 0.25 }}>
                {values[key]}
              </Typography>
              <Typography sx={{ fontSize: 11, color: DESIGN.textMuted, mt: 0.35 }}>
                No comparison data
              </Typography>
            </Box>
          </Box>
        </EnterpriseSurface>
      ))}
    </Box>
  );
}

export default CockpitSummaryCards;
