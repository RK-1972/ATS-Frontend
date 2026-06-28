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
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, sm: 2.5 },
            py: { xs: 2, sm: 2.5 },
            maxWidth: 1400
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
