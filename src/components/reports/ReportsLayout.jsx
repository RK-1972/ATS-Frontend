import { Outlet, useNavigate } from "react-router-dom";

import { Box } from "@mui/material";

import AppHeader from "../layout/AppHeader";
import AdminNavRail from "../layout/AdminNavRail";
import ReportsSidebar from "./ReportsSidebar";

function ReportsLayout() {
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("work_assignments");
    localStorage.removeItem("work_assignment_status");
    localStorage.removeItem("workspace");
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
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

      <Box
        sx={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          maxWidth: "100%",
          overflowX: "hidden"
        }}
      >
        <AdminNavRail />

        <Box
          sx={{
            display: "flex",
            flex: "1 1 0%",
            flexDirection: { xs: "column", md: "row" },
            minWidth: 0,
            maxWidth: "100%"
          }}
        >
          <ReportsSidebar />

          <Box
            component="main"
            sx={{
              flex: "1 1 0%",
              minWidth: 0,
              maxWidth: "100%",
              px: { xs: 2, sm: 2.5 },
              py: { xs: 2, sm: 2 },
              boxSizing: "border-box"
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ReportsLayout;
