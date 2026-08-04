import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

const OFFER_SECTIONS = [
  {
    key: "home",
    label: "Offer Workspace",
    path: "/offers",
    icon: DashboardOutlinedIcon
  },
  {
    key: "raise",
    label: "Raise Offer Request",
    path: "/offers/raise",
    icon: AddBusinessOutlinedIcon
  },
  {
    key: "my-requests",
    label: "My Offer Requests",
    path: "/offers/my-requests",
    icon: AssignmentOutlinedIcon
  },
  {
    key: "pending-approvals",
    label: "Pending Offer Approvals",
    path: "/offers/pending-approvals",
    icon: PendingActionsOutlinedIcon
  },
  {
    key: "approved",
    label: "Approved Offers",
    path: "/offers/approved",
    icon: VerifiedOutlinedIcon
  },
  {
    key: "rejected",
    label: "Rejected Offers",
    path: "/offers/rejected",
    icon: HighlightOffOutlinedIcon
  },
  {
    key: "withdrawn",
    label: "Withdrawn Offers",
    path: "/offers/withdrawn",
    icon: UndoOutlinedIcon
  }
];

/**
 * Offer Workspace module sidebar — mirrors WorkforcePlanningSidebar structure.
 * Placeholders only; no authorization gates in Phase 10.0.
 */
function OfferWorkspaceSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: "100%", md: 260 },
        flexShrink: 0,
        borderRight: { md: 1 },
        borderBottom: { xs: 1, md: 0 },
        borderColor: "divider",
        bgcolor: "background.paper",
        px: 1.5,
        py: 2
      }}
    >
      <Typography
        variant="overline"
        sx={{
          px: 1,
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: "0.06em"
        }}
      >
        Offer Management
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", px: 1, mt: 0.5, mb: 1.5 }}
      >
        Raise · Approve · Track
      </Typography>

      <Divider sx={{ mb: 1 }} />

      <List dense disablePadding>
        {OFFER_SECTIONS.map((section) => {
          const Icon = section.icon;
          const selected =
            section.path === "/offers"
              ? location.pathname === "/offers" || location.pathname === "/offers/"
              : location.pathname.startsWith(section.path);

          return (
            <ListItemButton
              key={section.key}
              selected={selected}
              onClick={() => navigate(section.path)}
              sx={{
                borderRadius: 2,
                mb: 0.25,
                "&.Mui-selected": {
                  bgcolor: "action.selected"
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" color={selected ? "primary" : "action"} />
              </ListItemIcon>
              <ListItemText
                primary={section.label}
                primaryTypographyProps={{
                  fontSize: 13,
                  fontWeight: selected ? 700 : 500
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default OfferWorkspaceSidebar;
