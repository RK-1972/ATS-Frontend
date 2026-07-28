import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  IconButton,
  Tooltip,
  Divider
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import ViewTimelineOutlinedIcon from "@mui/icons-material/ViewTimelineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import useEnterpriseStore from "@/store/enterpriseStore";
import { isNavPathVisible } from "@/enterprise/moduleVisibility";

const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/",
    icon: DashboardOutlinedIcon
  },
  {
    type: "section",
    label: "Security"
  },
  {
    label: "User Management",
    path: "/users",
    icon: PeopleAltOutlinedIcon
  },
  {
    type: "section",
    label: "Master Data"
  },
  {
    label: "Master Management",
    path: "/masters",
    icon: StorageOutlinedIcon
  },
  {
    label: "Enterprise Master Data",
    path: "/master-data",
    icon: DatasetOutlinedIcon
  },
  {
    label: "Work Assignments",
    path: "/work-assignments",
    icon: AssignmentOutlinedIcon
  },
  {
    type: "section",
    label: "Workforce"
  },
  {
    label: "Workforce Planning",
    path: "/workforce-planning",
    icon: GroupsOutlinedIcon
  },
  {
    label: "Talent Management",
    path: "/candidates",
    icon: WorkOutlineOutlinedIcon
  },
  {
    label: "Employee Work Assignments",
    path: "/employee-work-assignments",
    icon: AssignmentIndOutlinedIcon
  },
  {
    type: "section",
    label: "Configuration"
  },
  {
    label: "Platform Configuration",
    path: "/platform-configuration",
    icon: TuneOutlinedIcon
  },
  {
    label: "Business Rules",
    path: "/business-rules",
    icon: PolicyOutlinedIcon
  },
  {
    label: "Hiring Control Tower",
    path: "/hiring-control-tower",
    icon: ViewTimelineOutlinedIcon
  },
  {
    type: "section",
    label: "Audit"
  },
  {
    label: "Reports & Analytics",
    path: "/reports",
    icon: BarChartOutlinedIcon
  }
];

function AdminNavRail() {

  const navigate = useNavigate();
  const location = useLocation();
  const platformConfig = useEnterpriseStore((state) => state.platformConfig);

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name || "Admin";

  const visibleItems = ADMIN_NAV_ITEMS.filter((item) => {
    if (item.type === "section") {
      return true;
    }

    return isNavPathVisible(item.path, userRole, platformConfig);
  });

  const handleNavigate = (path) => {

    if (path) {
      navigate(path);
    }

  };

  const isActive = (path) => {

    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);

  };

  return (

    <Box
      component="nav"
      aria-label="Admin navigation"
      sx={{
        width: 80,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        py: 2,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        minHeight: "calc(100vh - 82px)"
      }}
    >

      {visibleItems.map((item, index) => {

        if (item.type === "section") {
          return (
            <Box
              key={`section-${item.label}`}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                my: 0.5
              }}
            >
              <Divider flexItem sx={{ width: 48, mx: "auto" }} />
              <Tooltip title={item.label} placement="right">
                <Box
                  aria-label={item.label}
                  sx={{
                    px: 0.5,
                    typography: "caption",
                    color: "text.secondary",
                    fontWeight: 700,
                    fontSize: 9,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: 72
                  }}
                >
                  {item.label}
                </Box>
              </Tooltip>
            </Box>
          );
        }

        const Icon = item.icon;
        const active = isActive(item.path);
        const showDivider = index === 1 && visibleItems[0]?.path === "/";

        return (

          <Box key={item.label}>

            {showDivider && (
              <Divider
                flexItem
                sx={{ width: 48, my: 0.5, mx: "auto" }}
              />
            )}

            <Tooltip
              title={item.label}
              placement="right"
            >

              <IconButton
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  color: active ? "primary.main" : "text.secondary",
                  bgcolor: active
                    ? "action.selected"
                    : "transparent",
                  "&:hover": {
                    bgcolor: active
                      ? "action.selected"
                      : "action.hover"
                  }
                }}
              >

                <Icon />

              </IconButton>

            </Tooltip>

          </Box>

        );

      })}

    </Box>

  );

}

export default AdminNavRail;
