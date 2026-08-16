import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { Box } from "@mui/material";

import AppHeader from "../layout/AppHeader";
import AdminNavRail from "../layout/AdminNavRail";
import RequisitionsSidebar from "./RequisitionsSidebar";
import useWorkforcePlanning from "../../hooks/useWorkforcePlanning";

function RequisitionsModuleLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name || "Admin";

  const { refreshWorkforce } = useWorkforcePlanning();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    refreshWorkforce?.().catch(() => {
      // keep existing UI responsive even if refresh fails
    });
  }, [location.pathname, refreshWorkforce]);

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

      <Box sx={{ display: "flex", flex: 1 }}>
        <AdminNavRail />

        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: { xs: "column", md: "row" },
            minWidth: 0
          }}
        >
          <RequisitionsSidebar />

          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 2, sm: 2.5 },
              py: { xs: 2, sm: 2.5 },
              maxWidth: 1480
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default RequisitionsModuleLayout;
