import "@fontsource/roboto/300";
import "@fontsource/roboto/400";
import "@fontsource/roboto/500";
import "@fontsource/roboto/700";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import bootstrapEnterpriseData from "./enterprise/bootstrap";
import { enforceSession } from "./utils/sessionAuth";
import useEnterpriseStore from "./store/enterpriseStore";

// Startup session gate — clear expired JWT before any bootstrap API work
// and before protected routes can paint previous-session UI.
const startupSession = enforceSession();
if (
  !startupSession.ok &&
  (startupSession.reason === "expired" || startupSession.reason === "invalid")
) {
  useEnterpriseStore.getState().resetEnterpriseSession();
}

bootstrapEnterpriseData();

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>

    <CssBaseline />

    <App />

</ThemeProvider>
);
