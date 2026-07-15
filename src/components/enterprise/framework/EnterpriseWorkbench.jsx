import { Box, Paper } from "@mui/material";

function EnterpriseWorkbench({
  header = null,
  kpis = null,
  leftRail = null,
  main = null,
  rightPanel = null,
  actionBar = null
}) {
  const surfaceSx = {
    elevation: 0,
    borderRadius: 3,
    border: 1,
    borderColor: "divider",
    bgcolor: "background.paper",
    minHeight: 0,
    display: "flex",
    flexDirection: "column"
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        bgcolor: "background.default"
      }}
    >
      {header ? (
        <Box sx={{ flexShrink: 0 }}>
          {header}
        </Box>
      ) : null}

      {kpis ? (
        <Paper
          elevation={0}
          sx={{
            mx: { xs: 1.5, sm: 2 },
            mt: 1.5,
            px: 1.5,
            py: 1.25,
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper"
          }}
        >
          {kpis}
        </Paper>
      ) : null}

      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          gap: 1.5,
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          pb: actionBar ? 9 : 1.5
        }}
      >
        {leftRail ? (
          <Paper
            elevation={0}
            sx={{
              ...surfaceSx,
              flexShrink: 0,
              width: { xs: "100%", lg: 280 },
              display: { xs: "none", lg: "flex" }
            }}
          >
            {leftRail}
          </Paper>
        ) : null}

        <Paper
          elevation={0}
          sx={{
            ...surfaceSx,
            flex: 1,
            minWidth: 0,
            px: 1.5,
            py: 1.5
          }}
        >
          {main}
        </Paper>

        {rightPanel ? (
          <Paper
            elevation={0}
            sx={{
              ...surfaceSx,
              flexShrink: 0,
              width: { xs: "100%", lg: 320 },
              display: { xs: "none", xl: "flex" }
            }}
          >
            {rightPanel}
          </Paper>
        ) : null}
      </Box>

      {actionBar ? (
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1100,
            px: { xs: 1.5, sm: 2 },
            py: 1.25,
            borderRadius: 0,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper"
          }}
        >
          {actionBar}
        </Paper>
      ) : null}
    </Box>
  );
}

export default EnterpriseWorkbench;
