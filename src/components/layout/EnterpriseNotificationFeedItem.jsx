import React from "react";

import { Box, Typography, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

import { formatNotificationRelativeTime } from "@/utils/formatNotificationRelativeTime";

const CATEGORY_VISUALS = {
  budget: {
    Icon: AccountBalanceWalletOutlinedIcon,
    accentKey: "success"
  },
  resourceRequisition: {
    Icon: BusinessCenterOutlinedIcon,
    accentKey: "warning"
  },
  candidateOwnership: {
    Icon: PeopleOutlinedIcon,
    accentKey: "primary"
  },
  interviewScheduled: {
    Icon: EventOutlinedIcon,
    accentKey: "info"
  },
  assignedRequisition: {
    Icon: PersonAddOutlinedIcon,
    accentKey: "secondary"
  }
};

function resolveNotificationTimestamp(notification) {
  return (
    notification?.sortTimestamp
    ?? notification?.assigned_on
    ?? notification?.submitted_date
    ?? notification?.requested_on
    ?? null
  );
}

function EnterpriseNotificationFeedItem({
  categoryKey,
  categoryLabel,
  title,
  message,
  notification,
  onClick
}) {
  const theme = useTheme();
  const visual = CATEGORY_VISUALS[categoryKey] || CATEGORY_VISUALS.budget;
  const { Icon } = visual;
  const accentColor = theme.palette[visual.accentKey]?.main || theme.palette.primary.main;
  const relativeTime = formatNotificationRelativeTime(
    resolveNotificationTimestamp(notification)
  );

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: "flex",
        width: "100%",
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        bgcolor: alpha(theme.palette.primary.main, 0.035),
        px: 1.5,
        py: 1.15,
        gap: 1.25,
        font: "inherit",
        color: "inherit",
        transition: theme.transitions.create(["background-color"], {
          duration: theme.transitions.duration.shorter
        }),
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.06)
        },
        "&:focus-visible": {
          outline: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
          outlineOffset: -2
        }
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(accentColor, 0.12),
          color: accentColor,
          mt: 0.15
        }}
      >
        <Icon sx={{ fontSize: 17 }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          borderLeft: `2px solid ${alpha(accentColor, 0.55)}`,
          pl: 1.25
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 0.35 }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              lineHeight: 1.3,
              textTransform: "uppercase",
              color: accentColor
            }}
          >
            {categoryLabel}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{ flexShrink: 0, pt: 0.1 }}
          >
            {relativeTime ? (
              <Typography
                component="span"
                sx={{
                  fontSize: 11,
                  lineHeight: 1.3,
                  color: "text.secondary",
                  whiteSpace: "nowrap"
                }}
              >
                {relativeTime}
              </Typography>
            ) : null}
            <Box
              aria-hidden="true"
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: theme.palette.info.main,
                flexShrink: 0
              }}
            />
          </Stack>
        </Stack>

        <Typography
          sx={{
            fontSize: 13.5,
            fontWeight: 600,
            lineHeight: 1.35,
            color: "text.primary",
            mb: 0.25
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 400,
            lineHeight: 1.45,
            color: "text.secondary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
}

export default EnterpriseNotificationFeedItem;
