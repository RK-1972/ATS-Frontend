import React, { useEffect, useMemo, useState } from "react";
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
  MenuItem,
  Stack,
  useMediaQuery
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

import candidateRepository from "@/repositories/candidateRepository";
import MyApprovalsService from "@/services/myApprovalsService";
import BrandLogo from "./BrandLogo";
import EnterpriseNotificationFeedItem from "./EnterpriseNotificationFeedItem";
import { OptalynxCopilot } from "../copilot";
import OptalynxHelp from "../help/OptalynxHelp";
import { clearAuthStorage, getStoredToken } from "@/utils/sessionAuth";
import {
  APPROVAL_NOTIFICATIONS_UPDATED_EVENT,
  OWNERSHIP_REQUESTS_UPDATED_EVENT
} from "@/utils/enterpriseNotificationEvents";
import {
  buildNotificationFeed,
  countNotifications
} from "@/utils/enterpriseNotificationSections";

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
const mobileIconButtonSx = {
  color: "#FFFFFF",
  width: 44,
  height: 44,
  "&:hover": {
    backgroundColor: "rgba(255,255,255,.08)"
  }
};

function AppHeader({
  loggedInUser: loggedInUserProp,
  userRole: userRoleProp,
  onLogout,
  showUserActions,
  showMobileNavMenu = false,
  onMobileNavOpen
}) {
  const theme = useTheme();
  const { brand, layout } = theme.tokens;
  const isMobileViewport = useMediaQuery(theme.breakpoints.down("md"));
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

  const [ownershipNotifications, setOwnershipNotifications] = useState([]);
  const [budgetNotifications, setBudgetNotifications] = useState([]);
  const [requisitionNotifications, setRequisitionNotifications] = useState([]);
  const [offerNotifications, setOfferNotifications] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const notificationFeed = useMemo(
    () =>
      buildNotificationFeed({
        budget: budgetNotifications,
        resourceRequisition: requisitionNotifications,
        offer: offerNotifications,
        candidateOwnership: ownershipNotifications,
        interviewScheduled: [],
        assignedRequisition: []
      }),
    [
      budgetNotifications,
      requisitionNotifications,
      offerNotifications,
      ownershipNotifications
    ]
  );

  const pendingCount = countNotifications(notificationFeed);

  const loadEnterpriseNotifications = () => {
    Promise.all([
      candidateRepository.getMyOwnershipRequests(),
      MyApprovalsService.listMyBudgetApprovalNotifications(),
      MyApprovalsService.listMyRequisitionApprovalNotifications(),
      MyApprovalsService.listMyOfferApprovalNotifications()
    ])
      .then(([ownershipRequests, budgetRows, requisitionRows, offerRows]) => {
        setOwnershipNotifications(
          (Array.isArray(ownershipRequests) ? ownershipRequests : []).map(
            MyApprovalsService.mapOwnershipNotification
          )
        );
        setBudgetNotifications(
          (Array.isArray(budgetRows) ? budgetRows : []).map(
            MyApprovalsService.mapBudgetApprovalNotification
          )
        );
        setRequisitionNotifications(
          (Array.isArray(requisitionRows) ? requisitionRows : []).map(
            MyApprovalsService.mapRequisitionApprovalNotification
          )
        );
        setOfferNotifications(
          (Array.isArray(offerRows) ? offerRows : []).map(
            MyApprovalsService.mapOfferApprovalNotification
          )
        );
      })
      .catch(() => {
        setOwnershipNotifications([]);
        setBudgetNotifications([]);
        setRequisitionNotifications([]);
        setOfferNotifications([]);
      });
  };

  useEffect(() => {
    if (!shouldShowUserActions) {
      return undefined;
    }

    loadEnterpriseNotifications();

    const handleWindowFocus = () => {
      loadEnterpriseNotifications();
    };

    const handleOwnershipUpdated = () => {
      loadEnterpriseNotifications();
    };

    const handleApprovalNotificationsUpdated = () => {
      loadEnterpriseNotifications();
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener(
      OWNERSHIP_REQUESTS_UPDATED_EVENT,
      handleOwnershipUpdated
    );
    window.addEventListener(
      APPROVAL_NOTIFICATIONS_UPDATED_EVENT,
      handleApprovalNotificationsUpdated
    );

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener(
        OWNERSHIP_REQUESTS_UPDATED_EVENT,
        handleOwnershipUpdated
      );
      window.removeEventListener(
        APPROVAL_NOTIFICATIONS_UPDATED_EVENT,
        handleApprovalNotificationsUpdated
      );
    };
  }, [shouldShowUserActions]);

  const handleBellClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleReviewOwnership = () => {
    handleMenuClose();
    navigate("/recruiter/ownership-requests");
  };

  const handleRequisitionApprovalClick = (taskId) => {
    handleMenuClose();
    navigate("/my-approvals", { state: { taskId } });
  };

  const handleNotificationClick = (categoryKey, notification) => {
    if (categoryKey === "budget") {
      handleBudgetApprovalClick(notification.taskId);
      return;
    }

    if (categoryKey === "resourceRequisition") {
      handleRequisitionApprovalClick(notification.taskId);
      return;
    }

    if (categoryKey === "offer") {
      handleOfferApprovalClick(notification.taskId, notification);
      return;
    }

    if (categoryKey === "candidateOwnership") {
      handleReviewOwnership();
    }
  };

  const resolveNotificationKey = (categoryKey, notification, index) => {
    if (categoryKey === "budget") {
      return `budget-${notification.taskId}`;
    }

    if (categoryKey === "resourceRequisition") {
      return `requisition-${notification.taskId}`;
    }

    if (categoryKey === "offer") {
      return `offer-${notification.taskId}`;
    }

    if (categoryKey === "candidateOwnership") {
      return `ownership-${notification.requestId || index}`;
    }

    if (categoryKey === "interviewScheduled") {
      return `interview-${notification.id || notification.taskId || index}`;
    }

    return `assigned-requisition-${notification.id || notification.taskId || index}`;
  };

  const handleBudgetApprovalClick = (taskId) => {
    handleMenuClose();
    navigate("/my-approvals", { state: { taskId } });
  };

  const handleOfferApprovalClick = (taskId, notification = null) => {
    handleMenuClose();

    let workspace = {};
    try {
      workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
    } catch (_error) {
      workspace = {};
    }

    if (workspace.showOfferWorkspace) {
      navigate("/offers/pending-approvals", {
        state: {
          offerId: notification?.document_number || notification?.offerId || null,
          taskId
        }
      });
      return;
    }

    navigate("/my-approvals", { state: { taskId } });
  };

  const handleLogout = () => {
    setUserMenuAnchor(null);
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }

    clearAuthStorage();
    navigate("/login");
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const notificationMenu = (
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                  list: {
                    sx: { p: 0 }
                  },
                  paper: {
                    sx: {
                      width: 360,
                      maxWidth: "92vw",
                      borderRadius: 2,
                      mt: 0.5,
                      overflow: "hidden"
                    }
                  }
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderBottom: 1,
                    borderColor: "divider"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, fontSize: 14 }}
                    >
                      Notifications
                    </Typography>
                    {pendingCount > 0 ? (
                      <Chip
                        label={pendingCount}
                        size="small"
                        sx={{
                          height: 20,
                          minWidth: 24,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.info.main, 0.12),
                          color: "info.main",
                          "& .MuiChip-label": { px: 0.85 }
                        }}
                      />
                    ) : null}
                  </Stack>
                </Box>

                {pendingCount > 0 ? (
                  <Box
                    sx={{
                      maxHeight: 420,
                      overflowY: "auto"
                    }}
                  >
                    {notificationFeed.map((item, index) => (
                      <React.Fragment
                        key={resolveNotificationKey(
                          item.categoryKey,
                          item,
                          index
                        )}
                      >
                        <EnterpriseNotificationFeedItem
                          categoryKey={item.categoryKey}
                          categoryLabel={item.categoryLabel}
                          title={item.title}
                          message={item.message}
                          notification={item}
                          onClick={() =>
                            handleNotificationClick(item.categoryKey, item)
                          }
                        />
                        {index < notificationFeed.length - 1 ? (
                          <Divider />
                        ) : null}
                      </React.Fragment>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ px: 2, py: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No pending notifications.
                    </Typography>
                  </Box>
                )}
              </Menu>
  );

  const desktopUserCluster = shouldShowUserActions ? (
    <>
      <OptalynxHelp
        iconButtonSx={{
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,.08)"
          }
        }}
      />

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

      {notificationMenu}

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
  ) : null;

  const mobileUserCluster = shouldShowUserActions ? (
    <>
      <OptalynxHelp iconButtonSx={mobileIconButtonSx} />

      <OptalynxCopilot iconButtonSx={mobileIconButtonSx} />

      <Tooltip title="Notifications">
        <IconButton onClick={handleBellClick} sx={mobileIconButtonSx} aria-label="Notifications">
          <Badge badgeContent={pendingCount} color="error" invisible={pendingCount === 0}>
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {notificationMenu}

      <Tooltip title="Account">
        <IconButton
          onClick={handleUserMenuOpen}
          sx={mobileIconButtonSx}
          aria-label="Open account menu"
        >
          <Avatar
            sx={{
              bgcolor: "#F59E0B",
              color: "#1F3B63",
              width: 32,
              height: 32,
              fontWeight: 700,
              fontSize: 14
            }}
          >
            {resolvedUser?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { minWidth: 240, maxWidth: "92vw" }
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
            {resolvedUser?.full_name || "User"}
          </Typography>
          <Chip
            label={workAssignmentLabel}
            size="small"
            title={workAssignmentLabel}
            sx={{ mt: 1, maxWidth: "100%" }}
          />
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.25 }}>
          <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  ) : null;

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
      {isMobileViewport ? (
        <Toolbar
          sx={{
            px: 1,
            minHeight: `${layout.headerHeight}px !important`,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            minWidth: 0
          }}
        >
          {showMobileNavMenu ? (
            <IconButton
              onClick={onMobileNavOpen}
              sx={mobileIconButtonSx}
              aria-label="Open navigation menu"
            >
              <MenuOutlinedIcon />
            </IconButton>
          ) : (
            <Box sx={{ width: 44, flexShrink: 0 }} aria-hidden />
          )}

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            <BrandLogo compact />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              flexShrink: 0,
              minWidth: 0
            }}
          >
            {mobileUserCluster}
          </Box>
        </Toolbar>
      ) : (
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
            {desktopUserCluster}
          </Box>
        </Toolbar>
      )}
    </AppBar>
  );
}

export default AppHeader;
