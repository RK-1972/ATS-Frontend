import { Box, Typography } from "@mui/material";
import {
  MdGroups,
  MdWorkOutline,
  MdEvent,
  MdRateReview,
  MdCardGiftcard
} from "react-icons/md";
import { DESIGN, PANEL_SHELL } from "./recruiterHomeTokens";

const CARDS = [
  { key: "candidates", label: "Active Candidates", icon: MdGroups, color: DESIGN.blue, bg: DESIGN.blueBg },
  { key: "requisitions", label: "Open Requisitions", icon: MdWorkOutline, color: DESIGN.purple, bg: DESIGN.purpleBg },
  { key: "interviews", label: "Interviews Today", icon: MdEvent, color: "#0E9384", bg: "#ECFDF3" },
  { key: "feedback", label: "Pending Feedback", icon: MdRateReview, color: DESIGN.orange, bg: DESIGN.orangeBg },
  { key: "offers", label: "Offer Stage", icon: MdCardGiftcard, color: DESIGN.green, bg: DESIGN.greenBg }
];

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
      {CARDS.map(({ key, label, icon: Icon, color, bg }) => (
        <Box key={key} sx={{ ...PANEL_SHELL, px: 1.5, py: 1.25 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </Box>
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
        </Box>
      ))}
    </Box>
  );
}

export default CockpitSummaryCards;
