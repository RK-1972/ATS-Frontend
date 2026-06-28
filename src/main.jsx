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

bootstrapEnterpriseData();

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>

    <CssBaseline />

    <App />

</ThemeProvider>
);
