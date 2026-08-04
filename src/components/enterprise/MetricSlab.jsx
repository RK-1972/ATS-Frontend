import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MetricCell from "./MetricCell";
import EnterpriseSurface from "./EnterpriseSurface";

/**
 * Metric strip — public contract unchanged.
 * Internally uses EnterpriseSurface so Framer enterprise motion applies
 * without consumers changing imports/props/layout.
 */
function MetricSlab({ metrics = [], highlightKey, onMetricClick = null }) {
  const theme = useTheme();
  const { radius } = theme.tokens;

  if (!metrics.length) {
    return null;
  }

  return (
    <EnterpriseSurface
      elevation={0}
      padding={false}
      sx={{
        borderRadius: `${radius.md}px`,
        border: 1,
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "background.paper"
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
    </EnterpriseSurface>
  );
}

export default MetricSlab;
