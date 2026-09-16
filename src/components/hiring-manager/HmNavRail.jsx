import { useNavigate, useLocation } from "react-router-dom";
import { Box, IconButton, Tooltip, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";

const NAV_ITEMS = [
  {
    label: "Workspace Home",
    path: "/workspace",
    icon: HomeWorkOutlinedIcon
  },
  {
    label: "Hiring Manager Workspace",
    path: "/hiring-manager",
    icon: SupervisorAccountOutlinedIcon
  }
];

function HmNavRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  return (
    <Box
      component="nav"
      aria-label="Hiring Manager navigation"
      sx={{
        width: 56,
        flexShrink: 0,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        alignItems: "center",
        py: 1.5,
        gap: 0.5,
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper"
      }}
    >
      {NAV_ITEMS.map((item, index) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);

        return (
          <Box key={item.path} sx={{ width: "100%", display: "grid", placeItems: "center" }}>
            {index === 1 ? <Divider flexItem sx={{ width: 32, mb: 0.5 }} /> : null}
            <Tooltip title={item.label} placement="right">
              <IconButton
                size="small"
                aria-label={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  color: isActive ? "primary.main" : "text.secondary",
                  bgcolor: isActive ? `${theme.palette.primary.main}14` : "transparent"
                }}
              >
                <Icon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
}

export default HmNavRail;
