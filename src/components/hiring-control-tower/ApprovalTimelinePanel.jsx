import {
  Box,
  Typography,
  Stack,
  Avatar,
  Chip
} from "@mui/material";

import {
  MdCancel,
  MdCheckCircle,
  MdHelpOutline,
  MdPersonAdd,
  MdSend,
  MdTrendingUp
} from "react-icons/md";

import { formatDateTime } from "@/utils/formatDateTime";

const EVENT_CONFIG = {
  approved: {
    icon: MdCheckCircle,
    color: "success",
    label: "Approved"
  },
  clarification: {
    icon: MdHelpOutline,
    color: "warning",
    label: "Clarification Requested"
  },
  assigned: {
    icon: MdPersonAdd,
    color: "info",
    label: "Assigned"
  },
  escalated: {
    icon: MdTrendingUp,
    color: "warning",
    label: "Escalated"
  },
  rejected: {
    icon: MdCancel,
    color: "error",
    label: "Rejected"
  },
  submitted: {
    icon: MdSend,
    color: "primary",
    label: "Submitted"
  }
};

function getInitials(name) {

  if (name === "System") return "SY";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

}

function ApprovalTimelinePanel({ events }) {

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden"
      }}
    >

      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Activity Log
        </Typography>
      </Box>

      <Box sx={{ maxHeight: 280, overflowY: "auto", px: 2, py: 1 }}>

        <Stack spacing={0}>

          {events.map((event, index) => {

            const config =
              EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.submitted;

            const Icon = config.icon;

            return (

              <Box
                key={event.id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  py: 1.25,
                  borderBottom: index < events.length - 1 ? 1 : 0,
                  borderColor: "divider"
                }}
              >

                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: 12,
                    fontWeight: 700,
                    bgcolor: "primary.main",
                    flexShrink: 0
                  }}
                >
                  {getInitials(event.actor)}
                </Avatar>

                <Box flex={1} minWidth={0}>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={2}
                    mb={0.5}
                  >

                    <Typography variant="body2" fontWeight={700} lineHeight={1.3}>
                      {event.actor}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      whiteSpace="nowrap"
                      sx={{ fontSize: 11, flexShrink: 0 }}
                    >
                      {formatDateTime(event.time, { includeYear: true })}
                    </Typography>

                  </Stack>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={0.75}
                    sx={{ fontSize: 11 }}
                  >
                    {event.role}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="flex-start" mb={0.5}>

                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        bgcolor: (theme) => {
                          const palette = theme.palette[config.color];
                          return palette?.main
                            ? `${palette.main}18`
                            : theme.palette.action.hover;
                        },
                        color: `${config.color}.main`
                      }}
                    >

                      <Icon size={14} />

                    </Box>

                    <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.4 }}>
                      {event.action}
                    </Typography>

                  </Stack>

                  {event.comment && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: 12,
                        fontStyle: "italic",
                        pl: 3.75,
                        mb: 0.75,
                        lineHeight: 1.4
                      }}
                    >
                      &ldquo;{event.comment}&rdquo;
                    </Typography>
                  )}

                  <Chip
                    label={config.label}
                    size="small"
                    color={config.color}
                    variant="outlined"
                    sx={{
                      height: 22,
                      fontSize: 10,
                      fontWeight: 700,
                      ml: event.comment ? 3.75 : 0
                    }}
                  />

                </Box>

              </Box>

            );

          })}

        </Stack>

      </Box>

    </Box>

  );

}

export default ApprovalTimelinePanel;
