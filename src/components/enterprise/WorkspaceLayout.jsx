import { Box, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import AppHeader from "../layout/AppHeader";

function WorkspaceLayout({
  navRail = null,
  sidebar = null,
  children,
  inspector = null,
  timeline = null,
  toast = null,
  onToastClose,
  maxWidth
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { layout } = theme.tokens;
  const contentMaxWidth = maxWidth || layout.maxContentWidth;

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
      />

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {navRail}

        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: { xs: "column", md: "row" },
            minWidth: 0,
            minHeight: 0
          }}
        >
          {sidebar}

          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              minHeight: 0
            }}
          >
            <Box
              sx={{
                flex: 1,
                px: { xs: 2, sm: 2.5 },
                py: { xs: 2, sm: 2 },
                maxWidth: contentMaxWidth,
                width: "100%",
                mx: "auto",
                display: "flex",
                flexDirection: "column",
                minHeight: 0
              }}
            >
              {children}
            </Box>

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
