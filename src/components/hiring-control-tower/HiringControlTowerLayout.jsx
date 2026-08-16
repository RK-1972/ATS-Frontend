import { useNavigate } from "react-router-dom";

import {
  Box,
  Snackbar,
  Alert
} from "@mui/material";

import AppHeader from "../layout/AppHeader";
import AdminNavRail from "../layout/AdminNavRail";
import useHiringControlTower from "../../hooks/useHiringControlTower";
import HiringControlTowerPage from "../../pages/hiring-control-tower/HiringControlTowerPage";

function HiringControlTowerLayout() {

  const navigate = useNavigate();

  const loggedInUser =
    JSON.parse(localStorage.getItem("user") || "null");

  const userRole = loggedInUser?.role_name || "Admin";

  const towerState = useHiringControlTower();

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

      <Box sx={{ display: "flex", flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>

        <AdminNavRail />

        <Box
          component="main"
          sx={{
            flex: "1 1 0%",
            minWidth: 0,
            maxWidth: "100%",
            overflowX: "hidden",
            px: { xs: 2, sm: 2.5 },
            py: { xs: 2, sm: 2.5 }
          }}
        >

          <HiringControlTowerPage towerState={towerState} />

        </Box>

      </Box>

      <Snackbar
        open={Boolean(towerState.toastMessage)}
        autoHideDuration={4000}
        onClose={() => towerState.setToastMessage("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
      >

        <Alert
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {towerState.toastMessage}
        </Alert>

      </Snackbar>

    </Box>

  );

}

export default HiringControlTowerLayout;
