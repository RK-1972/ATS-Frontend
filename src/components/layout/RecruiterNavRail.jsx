import React, { useEffect, useState } from "react";

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
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import AuthorizationService from "@/services/authorizationService";

const WORKSPACE_HOME_PATH = "/workspace";
const RECRUITER_ASSIGNMENT_PATH = "/requisitions/assign-recruiters";
const MY_ASSIGNED_REQUISITIONS_PATH = "/recruiter/my-requisitions";
const OFFER_WORKSPACE_PATH = "/offers";

const WORKSPACE_HOME_ITEM = {
  label: "Workspace Home",
  path: WORKSPACE_HOME_PATH,
  icon: HomeWorkOutlinedIcon
};

const RECRUITER_NAV_ITEMS = [
  {
    label: "Recruiter Workspace",
    path: "/recruiter",
    icon: DashboardOutlinedIcon
  },
  {
    label: "My Assigned Requisitions",
    path: MY_ASSIGNED_REQUISITIONS_PATH,
    icon: AssignmentOutlinedIcon
  },
  {
    label: "Talent Management",
    path: "/candidates",
    icon: PeopleAltOutlinedIcon
  },
  {
    label: "Interview Management",
    path: "/interview-schedule",
    icon: EventOutlinedIcon
  },
  {
    label: "Feedback Management",
    path: null,
    icon: RateReviewOutlinedIcon
  }
];

function RecruiterNavRail({ loggedInUser }) {

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [canAssignRecruiters, setCanAssignRecruiters] = useState(false);

  let workspace = {};

  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  const showRecruitment = Boolean(workspace.showRecruitmentWorkspace);
  const showInterview = Boolean(workspace.showInterviewWorkspace);
  const showOffer = Boolean(workspace.showOfferWorkspace);

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
    WORKSPACE_HOME_ITEM,

    ...(showRecruitment ? RECRUITER_NAV_ITEMS : []),

    ...(canAssignRecruiters
      ? [{
          label: "Recruiter Assignment",
          path: RECRUITER_ASSIGNMENT_PATH,
          icon: PersonAddAlt1OutlinedIcon
        }]
      : []),

    ...(showInterview
      ? [{
          label: "Interviewer Workspace",
          path: "/interviewer",
          icon: WorkOutlineOutlinedIcon
        }]
      : []),

    ...(showOffer
      ? [{
          label: "Offer Workspace",
          path: OFFER_WORKSPACE_PATH,
          icon: LocalOfferOutlinedIcon
        }]
      : [])

  ];

  const handleNavigate = (path) => {

    if (path) {
      navigate(path);
    }

  };

  const isActive = (path) => {

    if (!path) {
      return false;
    }

    if (path === WORKSPACE_HOME_PATH) {
      return location.pathname === WORKSPACE_HOME_PATH;
    }

    if (path === "/recruiter") {
      return location.pathname === "/recruiter" || location.pathname === "/recruiter/";
    }

    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);

  };

  return (

    <Box
      component="nav"
      aria-label="Recruiter navigation"
      sx={{
        width: theme.tokens.layout.navRailWidth,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        py: 2,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        minHeight: `calc(100vh - ${theme.tokens.layout.headerHeight}px)`
      }}
    >

      {navItems.map((item, index) => {

        const Icon = item.icon;
        const active = isActive(item.path);

        return (

          <React.Fragment key={item.label}>

            {index === 1 && (
              <Divider
                flexItem
                sx={{ width: 48, my: 0.5 }}
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
                disabled={!item.path}
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
                  },
                  "&.Mui-disabled": {
                    color: "text.disabled",
                    opacity: 0.6
                  }
                }}
              >

                <Icon />

              </IconButton>

            </Tooltip>

          </React.Fragment>

        );

      })}

    </Box>

  );

}

export default RecruiterNavRail;
