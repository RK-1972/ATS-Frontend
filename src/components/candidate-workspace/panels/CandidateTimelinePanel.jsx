import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

import { EnterpriseSurface } from "@/components/enterprise";

const ICON_MAP = {
  person_add: PersonAddOutlinedIcon,
  upload_file: UploadFileOutlinedIcon,
  link: LinkOutlinedIcon,
  timeline: TimelineOutlinedIcon,
  edit: EditOutlinedIcon,
  event: EventOutlinedIcon,
  feedback: RateReviewOutlinedIcon,
  joined: WorkOutlineOutlinedIcon
};

const TONE_COLOR = {
  primary: "primary.main",
  info: "info.main",
  success: "success.main",
  warning: "warning.main",
  muted: "text.disabled"
};

function CandidateTimelinePanel({ events = [] }) {
  const theme = useTheme();
  const { radius } = theme.tokens;
  const realEvents = events.filter((event) => !event.placeholder);

  return (
    <EnterpriseSurface>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Activity Timeline
      </Typography>

      {realEvents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Activity will appear as the candidate progresses through the hiring pipeline.
        </Typography>
      ) : (
        <Stack spacing={0} sx={{ position: "relative", pl: 1 }}>
          <Box
            sx={{
              position: "absolute",
              top: 12,
              bottom: 12,
              left: 19,
              width: 2,
              bgcolor: "divider"
            }}
          />

          {realEvents.map((event, index) => {
            const Icon = ICON_MAP[event.icon] || EventOutlinedIcon;

            return (
              <Stack
                key={event.id || `${event.type}-${index}`}
                direction="row"
                spacing={1.5}
                sx={{ py: 1.25, position: "relative" }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.pill,
                    bgcolor: "background.paper",
                    border: 2,
                    borderColor: TONE_COLOR[event.tone] || "primary.main",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    zIndex: 1
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: TONE_COLOR[event.tone] || "primary.main" }} />
                </Box>

                <Box minWidth={0} flex={1}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    gap={0.5}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {event.type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.date ? new Date(event.date).toLocaleString() : "Pending"}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mt={0.25}>
                    {event.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    By {event.user || "System"}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      )}
    </EnterpriseSurface>
  );
}

export default CandidateTimelinePanel;
