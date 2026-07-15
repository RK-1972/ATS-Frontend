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

function AppHeader({

  loggedInUser,
  userRole,
  onLogout

}) {

  const theme = useTheme();
  const { brand, layout } = theme.tokens;
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const loadPendingOwnershipCount = () => {
    candidateRepository
      .getMyOwnershipRequests()
      .then((requests) => setPendingCount(requests.length))
      .catch(() => setPendingCount(0));
  };

  useEffect(() => {
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
      window.removeEventListener("ownershipRequestsUpdated", handleOwnershipUpdated);
    };
  }, []);

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

          display: "flex",

          justifyContent: "space-between",

          alignItems: "center"

        }}

      >

        {/* ============================
             LEFT : IGS
        ============================ */}

        <Box

          sx={{

            minWidth: 220,

            display: "flex",

            flexDirection: "column",

            justifyContent: "center"

          }}

        >

          <Typography

            sx={{

              color: "#FFFFFF",

              fontSize: 30,

              fontWeight: 700,

              lineHeight: 1

            }}

          >

            IGS

          </Typography>

          <Typography

            sx={{

              color: "#F59E0B",

              fontSize: 12,

              letterSpacing: 1,

              mt: .4

            }}

          >

            ENGINEERING QUALITY

          </Typography>

        </Box>

        {/* ============================
             CENTER : BRAND
        ============================ */}

        <Box

          sx={{

            flex: 1,

            display: "flex",

            justifyContent: "center"

          }}

        >

          <BrandLogo />

        </Box>

        {/* ============================
             RIGHT : USER
        ============================ */}

        <Box

          sx={{

            minWidth: 330,

            display: "flex",

            justifyContent: "flex-end",

            alignItems: "center",

            gap: 2

          }}

        >

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
            PaperProps={{ sx: { minWidth: 220, borderRadius: 2, mt: 0.5 } }}
          >
            {pendingCount > 0 ? (
              <>
                <Box sx={{ px: 2, py: 1.25 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Ownership Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {pendingCount} Pending Request{pendingCount === 1 ? "" : "s"}
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

            {loggedInUser?.full_name?.charAt(0)?.toUpperCase() || "U"}

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

              {loggedInUser?.full_name || "User"}

            </Typography>

            <Chip

              label={userRole || "Recruiter"}

              size="small"

              sx={{

                mt: .5,

                bgcolor: "rgba(255,255,255,.12)",

                color: "#FFFFFF",

                fontWeight: 600,

                height: 24

              }}

            />

          </Box>

          <Tooltip title="Logout">

            <IconButton

              onClick={onLogout}

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

        </Box>

      </Toolbar>

    </AppBar>

  );

}

export default AppHeader;