import { Box, Typography, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function ActivityTimeline({ events = [], maxItems = 8, emptyMessage = "No activity yet." }) {
  const theme = useTheme();
  const { typography, radius } = theme.tokens;
  const items = events.slice(0, maxItems);

  if (!items.length) {
    return (
      <Typography
        color="text.secondary"
        sx={{ fontSize: typography.secondary.fontSize, py: 1 }}
      >
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Stack spacing={0}>
      {items.map((event, index) => (
        <Box
          key={event.id || `${event.action}-${index}`}
          sx={{
            display: "flex",
            gap: 1.5,
            py: 1,
            borderBottom: index < items.length - 1 ? 1 : 0,
            borderColor: "divider"
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: radius.pill,
              bgcolor: event.color || "primary.main",
              mt: 0.75,
              flexShrink: 0
            }}
          />

          <Box minWidth={0} flex={1}>
            <Typography
              sx={{
                fontSize: typography.secondary.fontSize,
                fontWeight: 600,
                lineHeight: 1.35
              }}
            >
              {event.title || event.action}
            </Typography>

            {event.subtitle && (
              <Typography
                color="text.secondary"
                sx={{ fontSize: typography.caption.fontSize, mt: 0.25 }}
              >
                {event.subtitle}
              </Typography>
            )}

            {event.timestamp && (
              <Typography
                color="text.secondary"
                sx={{ fontSize: typography.label.fontSize, mt: 0.25 }}
              >
                {event.timestamp}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export default ActivityTimeline;
