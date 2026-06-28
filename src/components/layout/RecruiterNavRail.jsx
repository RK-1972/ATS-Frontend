import React from "react";

import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  IconButton,
  Tooltip,
  Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

const RECRUITER_NAV_ITEMS = [
  {
    label: "Recruiter Workspace",
    path: "/recruiter",
    icon: DashboardOutlinedIcon
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

  const navItems = [

    ...RECRUITER_NAV_ITEMS,

    ...(loggedInUser?.secondary_role === "Interviewer"
      ? [{
          label: "Interviewer Workspace",
          path: "/interviewer",
          icon: WorkOutlineOutlinedIcon
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

    if (path === "/recruiter") {
      return location.pathname === "/recruiter" || location.pathname.startsWith("/recruiter/");
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
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                onClick={() => handleNavigate(item.path)}
                disabled={!item.path}
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
