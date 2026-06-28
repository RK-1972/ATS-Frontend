import { Outlet, useNavigate } from "react-router-dom";

import {
  Box,
  Snackbar,
  Alert
} from "@mui/material";

import AppHeader from "../layout/AppHeader";
import AdminNavRail from "../layout/AdminNavRail";
import MasterDataSidebar from "./MasterDataSidebar";
import useMasterData from "@/hooks/useMasterData";

function MasterDataLayout() {

  const navigate = useNavigate();

  const loggedInUser =
    JSON.parse(localStorage.getItem("user") || "null");

  const userRole = loggedInUser?.role_name || "Admin";

  const masterDataState = useMasterData();

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
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: { xs: "column", md: "row" },
            minWidth: 0
          }}
        >

          <MasterDataSidebar />

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

            <Outlet context={masterDataState} />

          </Box>

        </Box>

      </Box>

      <Snackbar
        open={Boolean(masterDataState.ui.toastMessage)}
        autoHideDuration={4000}
        onClose={() => masterDataState.setToastMessage("")}
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
          {masterDataState.ui.toastMessage}
        </Alert>

      </Snackbar>

    </Box>

  );

}

export default MasterDataLayout;
