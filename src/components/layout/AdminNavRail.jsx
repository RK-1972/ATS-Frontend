import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  IconButton,
  Tooltip,
  Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";
import { framerTransition, translateTokenPx } from "@/theme/motion";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
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
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import useEnterpriseStore from "@/store/enterpriseStore";
import { isNavPathVisible } from "@/enterprise/moduleVisibility";
import { shouldShowWorkspaceSwitcher } from "@/enterprise/workspaceAvailability";
import AuthorizationService from "@/services/authorizationService";
const WORKSPACE_HOME_PATH = "/workspace";
const RECRUITER_ASSIGNMENT_PATH = "/requisitions/assign-recruiters";
const OFFER_WORKSPACE_PATH = "/offers";
const REQUISITION_QUEUES_PATH = "/requisition-queues";

const WORKSPACE_HOME_ITEM = {
  label: "Workspace Home",
  path: WORKSPACE_HOME_PATH,
  icon: HomeWorkOutlinedIcon
};

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
    label: "Requisitions",
    path: REQUISITION_QUEUES_PATH,
    icon: AssignmentTurnedInOutlinedIcon,
    requiresRequisitionWorkspace: true
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
    label: "Offers"
  },
  {
    label: "Offer Workspace",
    path: OFFER_WORKSPACE_PATH,
    icon: LocalOfferOutlinedIcon,
    requiresOfferWorkspace: true
  },
  {
    type: "section",
    label: "Requisitions"
  },
  {
    label: "Recruiter Assignment",
    path: RECRUITER_ASSIGNMENT_PATH,
    icon: PersonAddAlt1OutlinedIcon
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
    path: "/reports/builder",
    icon: BarChartOutlinedIcon
  }
];

function AdminNavRail() {

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const platformConfig = useEnterpriseStore((state) => state.platformConfig);
  const [canAssignRecruiters, setCanAssignRecruiters] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name || "";

  let workspace = {};
  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  const isAdmin = userRole === "Admin";

  useEffect(() => {
    let cancelled = false;

    AuthorizationService.canAssignRecruiters()
      .then((allowed) => {
        if (!cancelled) {
          setCanAssignRecruiters(Boolean(allowed));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanAssignRecruiters(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = ADMIN_NAV_ITEMS.filter((item) => {
    if (item.type === "section") {
      return true;
    }

    // Recruiter Assignment: REQUISITION_ASSIGNER Work Assignment only.
    if (item.path === RECRUITER_ASSIGNMENT_PATH) {
      return canAssignRecruiters;
    }

    // Admin catalog: existing platform / role visibility only (login role_name).
    if (isAdmin) {
      return isNavPathVisible(item.path, userRole, platformConfig);
    }

    // Non-Admin on this rail: only destinations already granted via workspace flags
    // from Work Assignment resolution at login (no invented capability map).
    if (item.path === "/candidates") {
      return Boolean(workspace.showRecruitmentWorkspace);
    }

    if (item.path === "/workforce-planning") {
      return Boolean(workspace.showRequestWorkspace);
    }

    if (
      item.path === REQUISITION_QUEUES_PATH ||
      item.requiresRequisitionWorkspace
    ) {
      return Boolean(workspace.showRequestWorkspace);
    }

    if (item.path === OFFER_WORKSPACE_PATH || item.requiresOfferWorkspace) {
      return Boolean(workspace.showOfferWorkspace);
    }

    return false;
  });

  // Drop section labels that have no visible icons beneath them.
  const catalogItems = filteredItems.filter((item, index, list) => {
    if (item.type !== "section") {
      return true;
    }

    for (let i = index + 1; i < list.length; i += 1) {
      if (list[i].type === "section") {
        return false;
      }
      return true;
    }

    return false;
  });

  // Workspace switcher only when the user has more than one available workspace.
  const showWorkspaceSwitcher = shouldShowWorkspaceSwitcher({
    user: loggedInUser,
    workspaceFlags: workspace
  });

  const visibleItems = [
    ...(showWorkspaceSwitcher ? [WORKSPACE_HOME_ITEM] : []),
    ...catalogItems
  ];
  const handleNavigate = (path) => {

    if (path) {
      navigate(path);
    }

  };

  const isActive = (path) => {

    if (path === WORKSPACE_HOME_PATH) {
      return location.pathname === WORKSPACE_HOME_PATH;
    }

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
                component={motion.button}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                onClick={() => handleNavigate(item.path)}
                animate={{
                  boxShadow: active
                    ? theme.tokens.shadows.mid
                    : "0px 0px 0px rgba(31, 59, 99, 0)"
                }}
                whileHover={
                  reducedMotion
                    ? undefined
                    : {
                        boxShadow: theme.tokens.shadows.high,
                        y: translateTokenPx("hoverY") / 2,
                        transition: framerTransition("fast", "standard", false)
                      }
                }
                whileTap={
                  reducedMotion
                    ? undefined
                    : {
                        opacity: theme.motion.tokens.interaction.press.opacity
                      }
                }
                transition={framerTransition(
                  "fast",
                  "standard",
                  Boolean(reducedMotion)
                )}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  color: active ? "primary.main" : "text.secondary",
                  bgcolor: active
                    ? "action.selected"
                    : "transparent",
                  transition: "none",
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
