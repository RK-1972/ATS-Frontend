import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";

const REPORTS_SECTIONS = [
  {
    key: "center",
    label: "Report Center",
    path: "/reports",
    icon: AssessmentOutlinedIcon,
    exact: true
  },
  {
    key: "builder",
    label: "Report Builder",
    path: "/reports/builder",
    icon: TableChartOutlinedIcon
  }
];

function ReportsSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (section) => {
    if (section.exact) {
      return location.pathname === section.path;
    }

    return location.pathname.startsWith(section.path);
  };

  return (
    <Box
      component="nav"
      aria-label="Reports sections"
      sx={{
        width: { xs: "100%", md: 240 },
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
          Reports
        </Typography>
        <Typography variant="body2" fontWeight={700} color="primary.main" mt={0.25}>
          Reports & Analytics
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1, py: 0.5 }}>
        {REPORTS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const active = isActive(section);

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

export default ReportsSidebar;
