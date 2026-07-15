import { Box, Button, Stack, Typography } from "@mui/material";
import {
  MdEvent,
  MdForward,
  MdPerson,
  MdSchedule,
  MdWorkOutline
} from "react-icons/md";
import { DESIGN, PANEL_SHELL, PANEL_HEADER, TRANSITION_MS } from "./recruiterHomeTokens";

const ACTIONS = [
  { key: "schedule", label: "Schedule Interview", icon: MdSchedule, route: "/interview-schedule" },
  { key: "today", label: "My Interviews Today", icon: MdEvent, toggle: true },
  { key: "candidate", label: "Open Candidate", icon: MdPerson, route: "/candidates" },
  { key: "requisition", label: "Open Requisition", icon: MdWorkOutline, route: "/requisitions" },
  { key: "advance", label: "Advance Candidate", icon: MdForward, route: "/candidates" }
];

function QuickActionsStrip({
  onNavigate,
  onShowInterviewsToday,
  interviewsTodayActive = false,
  layout = "sidebar"
}) {
  const isSidebar = layout === "sidebar";

  return (
    <Box
      sx={{
        ...PANEL_SHELL,
        flexShrink: 0,
        height: isSidebar ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
        width: isSidebar ? { xs: "100%", lg: 210 } : "100%"
      }}
    >
      <Box
        sx={{
          ...PANEL_HEADER,
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 0.45,
          flexShrink: 0
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: DESIGN.textSecondary }}>
          Quick Actions
        </Typography>
      </Box>

      <Stack
        direction={isSidebar ? "column" : "row"}
        spacing={isSidebar ? 0.25 : 0.25}
        flexWrap={isSidebar ? "nowrap" : "wrap"}
        useFlexGap
        sx={{
          flex: 1,
          px: 1,
          py: 0.5,
          justifyContent: isSidebar ? "flex-start" : "flex-start"
        }}
      >
        {ACTIONS.map(({ key, label, icon: Icon, route, toggle }) => (
          <Button
            key={key}
            size="small"
            fullWidth={isSidebar}
            variant={toggle && interviewsTodayActive ? "contained" : "text"}
            startIcon={<Icon size={15} />}
            onClick={() => (toggle ? onShowInterviewsToday?.() : onNavigate?.(route))}
            sx={{
              ...actionSx,
              justifyContent: isSidebar ? "flex-start" : "center",
              px: isSidebar ? 0.75 : 0.85
            }}
          >
            {label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}

const actionSx = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: 12,
  py: 0.3,
  minHeight: 26,
  color: DESIGN.textPrimary,
  borderRadius: 1.5,
  transition: `background-color ${TRANSITION_MS}, box-shadow ${TRANSITION_MS}`,
  "&:hover": { bgcolor: "#F9FAFB", boxShadow: "0 1px 2px rgba(16, 24, 40, 0.06)" },
  "& .MuiButton-startIcon": { mr: 0.4 }
};

export default QuickActionsStrip;
