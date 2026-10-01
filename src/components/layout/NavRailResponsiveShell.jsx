import { Box, Drawer } from "@mui/material";

/**
 * Desktop: inline nav rail. Mobile (xs–sm): same rail in a left drawer.
 */
function NavRailResponsiveShell({ navRail, mobileOpen, onMobileClose }) {
  if (!navRail) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexShrink: 0
        }}
      >
        {navRail}
      </Box>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{ display: { md: "none" } }}
        PaperProps={{
          sx: {
            width: 72,
            boxSizing: "border-box"
          }
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%"
          }}
          onClick={onMobileClose}
          onKeyDown={onMobileClose}
          role="presentation"
        >
          {navRail}
        </Box>
      </Drawer>
    </>
  );
}

export default NavRailResponsiveShell;
