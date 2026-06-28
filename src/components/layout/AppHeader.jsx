import React from "react";

import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import BrandLogo from "./BrandLogo";

function AppHeader({

  loggedInUser,
  userRole,
  onLogout

}) {

  const theme = useTheme();
  const { brand, layout } = theme.tokens;

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

              sx={{

                color: "#FFFFFF",

                "&:hover": {

                  backgroundColor: "rgba(255,255,255,.08)"

                }

              }}

            >

              <NotificationsNoneOutlinedIcon />

            </IconButton>

          </Tooltip>

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