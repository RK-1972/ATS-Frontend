import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Badge,
  Menu,
  MenuItem
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import candidateRepository from "@/repositories/candidateRepository";
import BrandLogo from "./BrandLogo";
import { OptalynxCopilot } from "../copilot";
import { clearAuthStorage, getStoredToken } from "@/utils/sessionAuth";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (_error) {
    return null;
  }
}

function readStoredWorkAssignments() {
  try {
    const rows = JSON.parse(localStorage.getItem("work_assignments") || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch (_error) {
    return [];
  }
}

/**
 * Prefer an active work-assignment label for the header badge.
 * Falls back to role_name / activeWorkspace.
 */
function resolveWorkAssignmentLabel(userRole) {
  const assignments = readStoredWorkAssignments().filter(
    (row) => row && row.is_active !== false
  );

  if (assignments.length === 1) {
    return (
      assignments[0].assignment_name ||
      assignments[0].assignment_code ||
      userRole ||
      "—"
    );
  }

  if (assignments.length > 1) {
    const primary =
      assignments.find((row) => row.is_primary === true) || assignments[0];
    return (
      primary.assignment_name ||
      primary.assignment_code ||
      userRole ||
      "—"
    );
  }

  const activeWorkspace = localStorage.getItem("activeWorkspace");
  if (activeWorkspace && String(activeWorkspace).trim()) {
    return String(activeWorkspace).trim();
  }

  return userRole || "—";
}

/**
 * Single enterprise top bar. Branding comes only from BrandLogo.
 * Authenticated controls (avatar, name, work-assignment badge, notifications, logout)
 * are owned exclusively by this component.
 */
function AppHeader({
  loggedInUser: loggedInUserProp,
  userRole: userRoleProp,
  onLogout,
  showUserActions
}) {
  const theme = useTheme();
  const { brand, layout } = theme.tokens;
  const navigate = useNavigate();

  const storedUser = readStoredUser();
  const resolvedUser = loggedInUserProp || storedUser;
  const resolvedRole =
    userRoleProp ||
    resolvedUser?.role_name ||
    resolvedUser?.secondary_role ||
    "";
  const workAssignmentLabel = resolveWorkAssignmentLabel(resolvedRole);

  const isAuthenticated = Boolean(getStoredToken() && resolvedUser);
  const shouldShowUserActions =
    showUserActions !== undefined
      ? Boolean(showUserActions)
      : isAuthenticated;

  const [pendingCount, setPendingCount] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const loadPendingOwnershipCount = () => {
    candidateRepository
      .getMyOwnershipRequests()
      .then((requests) => setPendingCount(requests.length))
      .catch(() => setPendingCount(0));
  };

  useEffect(() => {
    if (!shouldShowUserActions) {
      return undefined;
    }

    loadPendingOwnershipCount();

    const handleWindowFocus = () => {
      loadPendingOwnershipCount();
    };

    const handleOwnershipUpdated = () => {
      loadPendingOwnershipCount();
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("ownershipRequestsUpdated", handleOwnershipUpdated);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener(
        "ownershipRequestsUpdated",
        handleOwnershipUpdated
      );
    };
  }, [shouldShowUserActions]);

  const handleBellClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleReviewNow = () => {
    handleMenuClose();
    navigate("/recruiter/ownership-requests");
  };

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }

    clearAuthStorage();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: brand.headerBg,
        height: layout.headerHeight,
        justifyContent: "center",
        borderBottom: `1px solid ${brand.headerBorder}`
      }}
    >
      <Toolbar
        sx={{
          px: 4,
          minHeight: `${layout.headerHeight}px !important`,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 2
        }}
      >
        <Box aria-hidden="true" />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            justifySelf: "center"
          }}
        >
          <BrandLogo />
        </Box>

        <Box
          sx={{
            minWidth: shouldShowUserActions ? 330 : 0,
            display: "flex",
            justifyContent: "flex-end",
            justifySelf: "end",
            alignItems: "center",
            gap: 2
          }}
        >
          {shouldShowUserActions ? (
            <>
              <OptalynxCopilot
                iconButtonSx={{
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,.08)"
                  }
                }}
              />

              <Tooltip title="Notifications">
                <IconButton
                  onClick={handleBellClick}
                  sx={{
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,.08)"
                    }
                  }}
                >
                  <Badge
                    badgeContent={pendingCount}
                    color="error"
                    invisible={pendingCount === 0}
                  >
                    <NotificationsNoneOutlinedIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: { minWidth: 220, borderRadius: 2, mt: 0.5 }
                }}
              >
                {pendingCount > 0 ? (
                  <>
                    <Box sx={{ px: 2, py: 1.25 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Ownership Requests
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.25 }}
                      >
                        {pendingCount} Pending Request
                        {pendingCount === 1 ? "" : "s"}
                      </Typography>
                    </Box>
                    <MenuItem onClick={handleReviewNow} sx={{ fontWeight: 600 }}>
                      Review Now
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem disabled sx={{ fontSize: 14 }}>
                    No pending notifications.
                  </MenuItem>
                )}
              </Menu>

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: "rgba(255,255,255,.15)"
                }}
              />

              <Avatar
                sx={{
                  bgcolor: "#F59E0B",
                  color: "#1F3B63",
                  width: 46,
                  height: 46,
                  fontWeight: 700,
                  fontSize: 18
                }}
              >
                {resolvedUser?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>

              <Box>
                <Typography
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: 16,
                    lineHeight: 1.2
                  }}
                >
                  {resolvedUser?.full_name || "User"}
                </Typography>

                <Chip
                  label={workAssignmentLabel}
                  size="small"
                  title={workAssignmentLabel}
                  sx={{
                    mt: 0.5,
                    maxWidth: 180,
                    bgcolor: "rgba(255,255,255,.12)",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    height: 24,
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }
                  }}
                />
              </Box>

              <Tooltip title="Logout">
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    color: "#FFFFFF",
                    ml: 1,
                    "&:hover": {
                      backgroundColor: "#EF4444"
                    }
                  }}
                >
                  <LogoutOutlinedIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
