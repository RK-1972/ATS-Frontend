import {
  Box,
  Typography,
  Stack
} from "@mui/material";

import ConfigSurface from "../platform-config/ConfigSurface";

function ApprovalTimeline({ events }) {

  return (

    <ConfigSurface>

      <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
        Timeline
      </Typography>

      <Stack spacing={0}>

        {events.map((event, index) => (

          <Box
            key={`${event.step}-${index}`}
            sx={{
              display: "flex",
              gap: 1.25,
              py: 1,
              borderBottom: index < events.length - 1 ? 1 : 0,
              borderColor: "divider"
            }}
          >

            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: index === events.length - 1
                  ? "primary.main"
                  : "action.selected",
                mt: 0.75,
                flexShrink: 0
              }}
            />

            <Box flex={1} minWidth={0}>

              <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                {event.step}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                {event.actor} · {new Date(event.date).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </Typography>

              {event.comment && (
                <Typography variant="caption" display="block" mt={0.5} sx={{ fontSize: 12 }}>
                  {event.comment}
                </Typography>
              )}

            </Box>

          </Box>

        ))}

      </Stack>

    </ConfigSurface>

  );

}

export default ApprovalTimeline;
