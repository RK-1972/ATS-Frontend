import { Outlet, useNavigate } from "react-router-dom";

import {
  Box,
  Snackbar,
  Alert
} from "@mui/material";

import { useState } from "react";

import AppHeader from "../layout/AppHeader";
import AdminNavRail from "../layout/AdminNavRail";
import PlatformConfigSidebar from "./PlatformConfigSidebar";
import ConfigSaveBar from "./ConfigSaveBar";
import usePlatformConfig from "../../hooks/usePlatformConfig";

function PlatformConfigLayout() {

  const navigate = useNavigate();

  const loggedInUser =
    JSON.parse(localStorage.getItem("user") || "null");

  const userRole = loggedInUser?.role_name || "Admin";

  const configState = usePlatformConfig();

  const [toast, setToast] = useState({
    open: false,
    message: ""
  });

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");

  };

  const handleSave = () => {

    configState.saveChanges();

    setToast({
      open: true,
      message: "Configuration published successfully."
    });

  };

  const handleDiscard = () => {
    configState.discardChanges();
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

          <PlatformConfigSidebar />

          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column"
            }}
          >

            <Box
              sx={{
                flex: 1,
                px: { xs: 2, sm: 2.5 },
                py: { xs: 2, sm: 2.5 },
                maxWidth: 1100
              }}
            >

              <Outlet context={configState} />

            </Box>

            <ConfigSaveBar
              isDirty={configState.isDirty}
              onSave={handleSave}
              onDiscard={handleDiscard}
              environment={configState.config.meta.environment}
            />

          </Box>

        </Box>

      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() =>
          setToast((prev) => ({ ...prev, open: false }))
        }
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
          {toast.message}
        </Alert>

      </Snackbar>

    </Box>

  );

}

export default PlatformConfigLayout;
