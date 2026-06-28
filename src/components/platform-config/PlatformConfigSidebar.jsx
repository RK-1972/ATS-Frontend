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

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

const CONFIG_SECTIONS = [
  {
    key: "overview",
    label: "Overview",
    path: "/platform-configuration",
    icon: HomeOutlinedIcon
  },
  {
    key: "modules",
    label: "Modules",
    path: "/platform-configuration/modules",
    icon: ViewModuleOutlinedIcon
  },
  {
    key: "workflows",
    label: "Workflows",
    path: "/platform-configuration/workflows",
    icon: AccountTreeOutlinedIcon
  },
  {
    key: "budget",
    label: "Budget & Workforce",
    path: "/platform-configuration/budget",
    icon: PaymentsOutlinedIcon
  },
  {
    key: "notifications",
    label: "Notifications",
    path: "/platform-configuration/notifications",
    icon: NotificationsOutlinedIcon
  },
  {
    key: "ai",
    label: "AI",
    path: "/platform-configuration/ai",
    icon: AutoAwesomeOutlinedIcon
  },
  {
    key: "roles",
    label: "Role Visibility",
    path: "/platform-configuration/roles",
    icon: VisibilityOutlinedIcon
  }
];

function PlatformConfigSidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  return (

    <Box
      component="nav"
      aria-label="Platform configuration sections"
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
          Configuration
        </Typography>

        <Typography
          variant="body2"
          fontWeight={700}
          color="primary.main"
          mt={0.25}
        >
          Platform Center
        </Typography>

      </Box>

      <Divider />

      <List sx={{ px: 1, py: 1 }}>

        {CONFIG_SECTIONS.map((section) => {

          const Icon = section.icon;

          const active =
            section.path === "/platform-configuration"
              ? location.pathname === "/platform-configuration"
              : location.pathname === section.path;

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
                <Icon sx={{ fontSize: 20 }} />
              </ListItemIcon>

              <ListItemText
                primary={section.label}
                primaryTypographyProps={{
                  fontWeight: active ? 700 : 500,
                  fontSize: 13
                }}
              />

            </ListItemButton>

          );

        })}

      </List>

    </Box>

  );

}

export default PlatformConfigSidebar;

export { CONFIG_SECTIONS };
