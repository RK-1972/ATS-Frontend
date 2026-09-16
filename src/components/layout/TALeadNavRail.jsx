import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  IconButton,
  Tooltip,
  Divider
} from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { framerTransition, translateTokenPx } from "@/theme/motion";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

import AuthorizationService from "@/services/authorizationService";
import { shouldShowWorkspaceSwitcher } from "@/enterprise/workspaceAvailability";

const WORKSPACE_HOME_PATH = "/workspace";
const TA_LEAD_HOME_PATH = "/ta-lead";
const RECRUITER_ASSIGNMENT_PATH = "/requisitions/assign-recruiters";
const REQUISITION_QUEUES_PATH = "/requisition-queues/approved";
const WORKFORCE_PLANNING_PATH = "/workforce-planning";
const MY_APPROVALS_PATH = "/my-approvals";

function TALeadNavRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const [canAssignRecruiters, setCanAssignRecruiters] = useState(false);

  const workspace = (() => {
    try {
      return JSON.parse(localStorage.getItem("workspace") || "{}") || {};
    } catch {
      return {};
    }
  })();

  const showRequestWorkspace = Boolean(workspace.showRequestWorkspace);
  const showApprovalWorkspace = Boolean(workspace.showApprovalWorkspace);
  const showWorkspaceSwitcher = shouldShowWorkspaceSwitcher();

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

  const navItems = [
    ...(showWorkspaceSwitcher
      ? [{
          label: "Workspace Home",
          path: WORKSPACE_HOME_PATH,
          icon: HomeWorkOutlinedIcon
        }]
      : []),
    {
      label: "TA Lead Home",
      path: TA_LEAD_HOME_PATH,
      icon: DashboardOutlinedIcon
    },
    ...(showRequestWorkspace
      ? [
          {
            label: "Workforce Planning",
            path: WORKFORCE_PLANNING_PATH,
            icon: GroupsOutlinedIcon
          },
          {
            label: "Requisition Queues",
            path: REQUISITION_QUEUES_PATH,
            icon: AssignmentTurnedInOutlinedIcon
          }
        ]
      : []),
    ...(canAssignRecruiters
      ? [{
          label: "Recruiter Assignment",
          path: RECRUITER_ASSIGNMENT_PATH,
          icon: PersonAddAlt1OutlinedIcon
        }]
      : []),
    ...(showApprovalWorkspace
      ? [{
          label: "My Approvals",
          path: MY_APPROVALS_PATH,
          icon: FactCheckOutlinedIcon
        }]
      : [])
  ];

  const isActive = (path) => {
    if (path === TA_LEAD_HOME_PATH) {
      return location.pathname === TA_LEAD_HOME_PATH;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Box
      component="nav"
      aria-label="TA Lead navigation"
      sx={{
        width: 56,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 1,
        gap: 0.5
      }}
    >
      {navItems.map((item, index) => {
        const active = isActive(item.path);
        const Icon = item.icon;

        return (
          <Box key={item.path} sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            {index > 0 && item.path === WORKFORCE_PLANNING_PATH && showWorkspaceSwitcher ? (
              <Divider sx={{ width: "70%", my: 0.5 }} />
            ) : null}
            <Tooltip title={item.label} placement="right">
              <IconButton
                size="small"
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                sx={{
                  color: active ? "primary.main" : "text.secondary",
                  bgcolor: active ? "action.selected" : "transparent",
                  borderRadius: 2,
                  width: 40,
                  height: 40
                }}
              >
                <motion.div
                  whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                  transition={framerTransition(reducedMotion)}
                  style={{ display: "flex", transform: translateTokenPx(0) }}
                >
                  <Icon fontSize="small" />
                </motion.div>
              </IconButton>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
}

export default TALeadNavRail;
