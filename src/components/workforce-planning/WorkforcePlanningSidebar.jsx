import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip
} from "@mui/material";

import {
  MdDashboard,
  MdFactCheck,
  MdInsights,
  MdInventory,
  MdRequestQuote,
  MdWarningAmber
} from "react-icons/md";

const WORKFORCE_SECTIONS = [
  {
    key: "dashboard",
    label: "Workforce Dashboard",
    path: "/workforce-planning",
    icon: MdDashboard
  },
  {
    key: "requests",
    label: "Budget Requests",
    path: "/workforce-planning/requests",
    icon: MdRequestQuote
  },
  {
    key: "approvals",
    label: "Approval Workspace",
    path: "/workforce-planning/approvals",
    icon: MdFactCheck,
    badge: 2
  },
  {
    key: "catalogue",
    label: "Approved Positions",
    path: "/workforce-planning/catalogue",
    icon: MdInventory
  },
  {
    key: "exceptions",
    label: "Budget Exceptions",
    path: "/workforce-planning/exceptions",
    icon: MdWarningAmber,
    badge: 1
  },
  {
    key: "analytics",
    label: "Analytics",
    path: "/workforce-planning/analytics",
    icon: MdInsights
  }
];

function WorkforcePlanningSidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  return (

    <Box
      component="nav"
      aria-label="Workforce planning sections"
      sx={{
        width: { xs: "100%", md: 260 },
        flexShrink: 0,
        bgcolor: "background.paper",
        borderRight: { md: 1 },
        borderColor: "divider",
        minHeight: { md: "calc(100vh - 82px)" },
        py: 1.5
      }}
    >

      <Box sx={{ px: 2, pb: 1.5 }}>

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase"
          }}
        >
          Workforce Planning
        </Typography>

        <Typography
          variant="body2"
          fontWeight={700}
          color="primary.main"
          mt={0.25}
        >
          Budget Management
        </Typography>

        <Chip
          label="Before Recruitment"
          size="small"
          color="secondary"
          variant="outlined"
          sx={{ mt: 1, fontWeight: 600, height: 22, fontSize: 11 }}
        />

      </Box>

      <Divider />

      <List sx={{ px: 1, py: 0.5 }}>

        {WORKFORCE_SECTIONS.map((section) => {

          const Icon = section.icon;

          const active =
            section.path === "/workforce-planning"
              ? location.pathname === "/workforce-planning"
              : location.pathname.startsWith(section.path);

          return (

            <ListItemButton
              key={section.key}
              selected={active}
              onClick={() => navigate(section.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.25,
                py: 0.75,
                minHeight: 40,
                "&.Mui-selected": {
                  bgcolor: "rgba(31, 59, 99, 0.08)",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": {
                    color: "primary.main"
                  }
                }
              }}
            >

              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon size={20} />
              </ListItemIcon>

              <ListItemText
                primary={section.label}
                primaryTypographyProps={{
                  fontWeight: active ? 700 : 500,
                  fontSize: 13
                }}
              />

              {section.badge && (
                <Chip
                  label={section.badge}
                  size="small"
                  color="error"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontWeight: 700,
                    fontSize: 10,
                    "& .MuiChip-label": { px: 0.5 }
                  }}
                />
              )}

            </ListItemButton>

          );

        })}

      </List>

    </Box>

  );

}

export default WorkforcePlanningSidebar;

export { WORKFORCE_SECTIONS };
