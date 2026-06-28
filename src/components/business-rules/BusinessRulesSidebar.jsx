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
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

const BUSINESS_RULES_SECTIONS = [
  {
    key: "dashboard",
    label: "Rules Dashboard",
    path: "/business-rules",
    icon: DashboardOutlinedIcon
  },
  {
    key: "library",
    label: "Rule Library",
    path: "/business-rules/library",
    icon: MenuBookOutlinedIcon
  },
  {
    key: "designer",
    label: "Rule Designer",
    path: "/business-rules/designer",
    icon: DesignServicesOutlinedIcon
  },
  {
    key: "approval-matrix",
    label: "Approval Matrix",
    path: "/business-rules/approval-matrix",
    icon: GridViewOutlinedIcon
  },
  {
    key: "simulator",
    label: "Execution Preview",
    path: "/business-rules/simulator",
    icon: PlayCircleOutlineOutlinedIcon
  },
  {
    key: "history",
    label: "Version History",
    path: "/business-rules/history",
    icon: HistoryOutlinedIcon
  }
];

function BusinessRulesSidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  return (

    <Box
      component="nav"
      aria-label="Business rules sections"
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
          Business Rules
        </Typography>

        <Typography
          variant="body2"
          fontWeight={700}
          color="primary.main"
          mt={0.25}
        >
          Approval Engine
        </Typography>

      </Box>

      <Divider />

      <List sx={{ px: 1, py: 0.5 }}>

        {BUSINESS_RULES_SECTIONS.map((section) => {

          const Icon = section.icon;

          const active =
            section.path === "/business-rules"
              ? location.pathname === "/business-rules"
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

export default BusinessRulesSidebar;

export { BUSINESS_RULES_SECTIONS };
