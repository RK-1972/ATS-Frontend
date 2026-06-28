import { Box, Typography, Stack } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { useTheme } from "@mui/material/styles";
import EnterpriseSurface from "./EnterpriseSurface";

function AIInsightCard({
  title = "AI Insights",
  insights = [],
  placeholder = "AI-powered recruiting intelligence will surface priority actions, risk signals, and recommendations here."
}) {
  const theme = useTheme();
  const { typography, brand, radius } = theme.tokens;

  return (
    <EnterpriseSurface
      sx={{
        background: `linear-gradient(135deg, ${brand.metricHighlight} 0%, transparent 100%)`
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
        <AutoAwesomeOutlinedIcon color="primary" sx={{ fontSize: 20 }} />
        <Typography sx={{ ...typography.sectionTitle, fontSize: 16 }}>
          {title}
        </Typography>
      </Stack>

      {insights.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontSize: typography.secondary.fontSize }}>
          {placeholder}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {insights.map((insight) => (
            <Box
              key={insight.id || insight.title}
              sx={{
                p: 1.25,
                borderRadius: `${radius.sm}px`,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper"
              }}
            >
              <Typography
                sx={{ fontSize: typography.secondary.fontSize, fontWeight: 600 }}
              >
                {insight.title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: typography.caption.fontSize, mt: 0.25 }}
              >
                {insight.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </EnterpriseSurface>
  );
}

export default AIInsightCard;
