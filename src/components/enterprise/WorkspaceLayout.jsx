import { useEffect, useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pageFramerProps } from "../../theme/motion";
import AppHeader from "../layout/AppHeader";
import NavRailResponsiveShell from "../layout/NavRailResponsiveShell";

/**
 * Shared workspace shell.
 * Motion renderer: Framer Motion page enter on route change (Motion Tokens).
 */
function WorkspaceLayout({
  navRail = null,
  sidebar = null,
  children,
  rightPanel = null,
  inspector = null,
  timeline = null,
  toast = null,
  onToastClose,
  maxWidth,
  workspaceBodySx = {},
  workspaceRowSx = {},
  workspaceMainSx = {},
  workspaceRightPanelSx = {}
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { layout } = theme.tokens;
  const contentMaxWidth = maxWidth || layout.maxContentWidth;
  const reduced = useReducedMotion();
  const pageMotion = pageFramerProps(Boolean(reduced));

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("work_assignments");
    localStorage.removeItem("work_assignment_status");
    localStorage.removeItem("workspace");
    navigate("/login");
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const hasNavRail = Boolean(navRail);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <AppHeader
        loggedInUser={loggedInUser}
        userRole={userRole}
        onLogout={handleLogout}
        showMobileNavMenu={hasNavRail}
        onMobileNavOpen={() => setMobileNavOpen(true)}
      />

      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          ...workspaceBodySx
        }}
      >
        <NavRailResponsiveShell
          navRail={navRail}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: { xs: "column", md: "row" },
            minWidth: 0,
            minHeight: 0,
            ...workspaceRowSx
          }}
        >
          {sidebar}

          <Box
            component="main"
            sx={{
              flex: "1 1 0%",
              minWidth: 0,
              maxWidth: "100%",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              alignSelf: "stretch",
              ...workspaceMainSx
            }}
          >
            <AnimatePresence mode="wait">
              <Box
                component={motion.div}
                key={location.pathname}
                initial={pageMotion.initial}
                animate={pageMotion.animate}
                exit={pageMotion.exit}
                transition={pageMotion.transition}
                sx={{
                  flex: 1,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 2, sm: 2 },
                  maxWidth: rightPanel ? "100%" : contentMaxWidth,
                  width: "100%",
                  minWidth: 0,
                  mx: rightPanel ? 0 : "auto",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0
                }}
              >
                {children}
              </Box>
            </AnimatePresence>

            {timeline && (
              <Box
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  pb: 2,
                  maxWidth: contentMaxWidth,
                  width: "100%",
                  mx: "auto"
                }}
              >
                {timeline}
              </Box>
            )}
          </Box>

          {rightPanel ? (
            <Box
              component="aside"
              aria-label="Workspace right panel"
              sx={{
                display: { xs: "none", lg: "flex" },
                flexDirection: "column",
                flexShrink: 0,
                minWidth: 0,
                alignSelf: "flex-start",
                boxSizing: "border-box",
                pt: 2,
                pr: 2.5,
                pb: 2,
                ...workspaceRightPanelSx
              }}
            >
              {rightPanel}
            </Box>
          ) : null}
        </Box>
      </Box>

      {inspector}

      {toast?.message && (
        <Snackbar
          open={Boolean(toast.message)}
          autoHideDuration={4000}
          onClose={onToastClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert severity={toast.severity || "success"} variant="filled" sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

export default WorkspaceLayout;
