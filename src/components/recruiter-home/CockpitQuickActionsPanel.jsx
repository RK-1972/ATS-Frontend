import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import {
  MdBolt,
  MdSchedule,
  MdEvent,
  MdPerson,
  MdWorkOutline,
  MdForward,
  MdSearch,
  MdChevronRight
} from "react-icons/md";
import { DESIGN, PANEL_HEADER, PANEL_SHELL, ROW_INTERACTIVE } from "./recruiterHomeTokens";

const ACTIONS = [
  { key: "schedule", label: "Schedule Interview", icon: MdSchedule, route: "/interview-schedule" },
  { key: "today", label: "My Interviews Today", icon: MdEvent, toggle: true },
  { key: "candidate", label: "Open Candidate", icon: MdPerson, route: "/candidates" },
  { key: "requisition", label: "Open Requisition", icon: MdWorkOutline, route: "/requisitions" },
  { key: "advance", label: "Advance Candidate", icon: MdForward, route: "/candidates" },
  { key: "search", label: "Search Candidate", icon: MdSearch, route: "/candidates" }
];

function CockpitQuickActionsPanel({ onNavigate, onShowInterviewsToday, interviewsTodayActive = false }) {
  return (
    <Box sx={{ ...PANEL_SHELL, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ ...PANEL_HEADER, display: "flex", alignItems: "center", gap: 0.75 }}>
        <MdBolt size={18} color={DESIGN.blue} />
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: DESIGN.textSecondary, letterSpacing: "0.04em" }}>
          QUICK ACTIONS
        </Typography>
      </Box>

      <List dense disablePadding sx={{ py: 0.5 }}>
        {ACTIONS.map(({ key, label, icon: Icon, route, toggle }) => (
          <ListItemButton
            key={key}
            onClick={() => (toggle ? onShowInterviewsToday?.() : onNavigate?.(route))}
            selected={toggle && interviewsTodayActive}
            sx={{
              ...ROW_INTERACTIVE,
              py: 0.65,
              px: 1.5,
              "&.Mui-selected": { bgcolor: "#EFF8FF" }
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Icon size={18} color={DESIGN.textSecondary} />
            </ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} />
            <MdChevronRight size={18} color={DESIGN.textMuted} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default CockpitQuickActionsPanel;
