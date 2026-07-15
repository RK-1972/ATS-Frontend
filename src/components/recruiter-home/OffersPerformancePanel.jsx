import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ConfigMetricSlab from "../platform-config/ConfigMetricSlab";
import { PANEL_SHELL, PANEL_HEADER } from "./recruiterHomeTokens";

function OffersPerformancePanel({ offers = 0, joined = 0, range = "week", onRangeChange }) {
  return (
    <Box sx={{ ...PANEL_SHELL, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ ...PANEL_HEADER, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="caption" fontWeight={700}>
          Performance
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={range}
          onChange={(_, value) => value && onRangeChange?.(value)}
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: 10,
              px: 1,
              py: 0.25,
              minHeight: 24
            }
          }}
        >
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">30d</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ px: 1, py: 1 }}>
        <ConfigMetricSlab
          metrics={[
            { key: "offers", label: "Offers", value: String(offers), highlight: offers > 0 },
            { key: "joined", label: "Joined", value: String(joined), highlight: joined > 0 }
          ]}
          highlightKey={joined > 0 ? "joined" : "offers"}
        />
      </Box>
    </Box>
  );
}

export default OffersPerformancePanel;
