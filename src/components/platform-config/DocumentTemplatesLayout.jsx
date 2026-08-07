import { NavLink, Outlet, useLocation } from "react-router-dom";

import { Box, Tab, Tabs } from "@mui/material";

const TEMPLATE_TABS = [
  {
    label: "Templates",
    path: "/platform-configuration/document-templates"
  },
  {
    label: "Supported Placeholders",
    path: "/platform-configuration/document-templates/placeholders"
  }
];

function DocumentTemplatesLayout() {
  const location = useLocation();

  const activeTab =
    TEMPLATE_TABS.find((tab) => location.pathname === tab.path)?.path ||
    TEMPLATE_TABS[0].path;

  return (
    <Box>
      <Tabs
        value={activeTab}
        sx={{
          mb: 2,
          minHeight: 40,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            minHeight: 40
          }
        }}
      >
        {TEMPLATE_TABS.map((tab) => (
          <Tab
            key={tab.path}
            label={tab.label}
            value={tab.path}
            component={NavLink}
            to={tab.path}
          />
        ))}
      </Tabs>

      <Outlet />
    </Box>
  );
}

export default DocumentTemplatesLayout;
