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
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";

const ACTIONS = [
  { key: "schedule", label: "Schedule Interview", icon: MdSchedule },
  { key: "today", label: "My Interviews Today", icon: MdEvent },
  { key: "candidate", label: "Open Candidate", icon: MdPerson, route: "/candidates" },
  { key: "requisition", label: "Open Requisition", icon: MdWorkOutline },
  { key: "advance", label: "Advance Candidate", icon: MdForward, route: "/candidates" },
  { key: "search", label: "Search Candidate", icon: MdSearch, route: "/candidates" }
];

function CockpitQuickActionsPanel({ onNavigate, onQuickAction }) {
  const handleClick = (action) => {
    if (action.key === "schedule" || action.key === "today" || action.key === "requisition") {
      onQuickAction?.(action.key);
      return;
    }

    if (action.route) {
      onNavigate?.(action.route);
    }
  };

  return (
    <Box sx={{ ...PANEL_SHELL, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ ...PANEL_HEADER, display: "flex", alignItems: "center", gap: 0.75 }}>
        <EnterpriseModuleIcon
          icon={MdBolt}
          module="notifications"
          density="sm"
          size={24}
          iconSize={14}
        />
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: DESIGN.textSecondary, letterSpacing: "0.04em" }}>
          QUICK ACTIONS
        </Typography>
      </Box>

      <List dense disablePadding sx={{ py: 0.5 }}>
        {ACTIONS.map(({ key, label, icon: Icon }) => (
          <ListItemButton
            key={key}
            onClick={() => handleClick({ key, label, icon: Icon })}
            sx={{
              ...ROW_INTERACTIVE,
              py: 0.65,
              px: 1.5
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
