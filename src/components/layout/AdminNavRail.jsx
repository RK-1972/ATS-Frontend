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

import useEnterpriseStore from "@/store/enterpriseStore";
import { isNavPathVisible } from "@/enterprise/moduleVisibility";

const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/",
    icon: DashboardOutlinedIcon
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
    label: "User Management",
    path: "/users",
    icon: PeopleAltOutlinedIcon
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

  const visibleItems = ADMIN_NAV_ITEMS.filter((item) =>
    isNavPathVisible(item.path, userRole, platformConfig)
  );

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
