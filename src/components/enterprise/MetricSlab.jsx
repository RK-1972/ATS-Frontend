import { Paper, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MetricCell from "./MetricCell";

function MetricSlab({ metrics = [], highlightKey, onMetricClick = null }) {
  const theme = useTheme();
  const { radius } = theme.tokens;

  if (!metrics.length) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: `${radius.md}px`,
        border: 1,
        borderColor: "divider",
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: `repeat(${Math.min(metrics.length, 6)}, 1fr)`
          }
        }}
      >
        {metrics.map((metric, index) => (
          <Box
            key={metric.key || metric.label}
            sx={{
              borderRight: {
                md: index < metrics.length - 1 ? 1 : 0
              },
              borderBottom: {
                xs: index < metrics.length - 2 ? 1 : 0,
                md: 0
              },
              borderColor: "divider"
            }}
          >
            <MetricCell
              label={metric.label}
              value={metric.value}
              subtitle={metric.subtitle}
              highlight={metric.key === highlightKey || metric.highlight}
              placeholder={metric.placeholder}
              onClick={
                onMetricClick && metric.key
                  ? () => onMetricClick(metric.key)
                  : null
              }
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export default MetricSlab;
