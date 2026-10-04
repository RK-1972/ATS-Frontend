import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import { FramerDrawerTransition } from "@/theme/motionRenderer";
import {
  getHelpVideoPlaybackMode,
  isHelpVideoAvailable
} from "@/help/helpTopicVideo";

function HelpTopicRow({ topic, onWatchLocalVideo, onWatchExternalVideo }) {
  const video = topic.video;
  const videoAvailable = isHelpVideoAvailable(video);
  const playbackMode = getHelpVideoPlaybackMode(video);

  const handleWatchVideo = () => {
    if (!videoAvailable || !video?.publicUrl) {
      return;
    }

    if (playbackMode === "local") {
      onWatchLocalVideo({
        title: topic.title,
        src: video.publicUrl
      });
      return;
    }

    if (playbackMode === "external") {
      onWatchExternalVideo(video.publicUrl);
    }
  };

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        maxWidth: "100%",
        overflow: "hidden"
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={1}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ lineHeight: 1.3, minWidth: 0, flex: 1 }}
        >
          {topic.title}
        </Typography>
        {videoAvailable ? (
          <Chip
            size="small"
            icon={<VideocamOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            label="Video"
            sx={{
              height: 22,
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 600,
              "& .MuiChip-label": { px: 0.75 }
            }}
          />
        ) : null}
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.5, lineHeight: 1.45 }}
      >
        {topic.summary}
      </Typography>

      {videoAvailable ? (
        <Button
          size="small"
          variant="text"
          startIcon={<PlayCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={handleWatchVideo}
          sx={{
            mt: 0.75,
            px: 0.5,
            minHeight: 32,
            textTransform: "none",
            fontWeight: 600
          }}
        >
          Watch video
          {video.durationLabel && video.durationLabel !== "—"
            ? ` (${video.durationLabel})`
            : ""}
        </Button>
      ) : null}
    </Box>
  );
}

function HelpVideoPlayer({ title, src, onBack }) {
  return (
    <Box sx={{ maxWidth: "100%" }}>
      <Button
        size="small"
        startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />}
        onClick={onBack}
        sx={{
          mb: 1,
          px: 0.5,
          minHeight: 32,
          textTransform: "none",
          fontWeight: 600
        }}
      >
        Back to topics
      </Button>

      <Typography variant="body2" fontWeight={600} sx={{ mb: 1, lineHeight: 1.35 }}>
        {title}
      </Typography>

      <Box
        component="video"
        src={src}
        controls
        playsInline
        sx={{
          width: "100%",
          maxWidth: "100%",
          borderRadius: 1.5,
          bgcolor: "common.black",
          display: "block"
        }}
      />
    </Box>
  );
}

function OptalynxHelpDrawer({
  open,
  onClose,
  moduleTitle,
  topics,
  isLoading,
  loadError
}) {
  const theme = useTheme();
  const { tokens: motionTokens } = theme.motion;
  const [activePlayback, setActivePlayback] = useState(null);

  useEffect(() => {
    if (!open) {
      setActivePlayback(null);
    }
  }, [open]);

  useEffect(() => {
    setActivePlayback(null);
  }, [topics]);

  const handleWatchExternalVideo = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      slots={{ transition: FramerDrawerTransition }}
      transitionDuration={{
        enter: motionTokens.duration.enter,
        exit: motionTokens.duration.exit
      }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 380 },
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            overflow: "hidden"
          }
        }
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                flexShrink: 0
              }}
            >
              <HelpOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box minWidth={0}>
              <Typography variant="subtitle2" fontWeight={700} lineHeight={1.25}>
                Help
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.3 }}
              >
                {moduleTitle}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            aria-label="Close help"
            onClick={onClose}
            size="small"
            sx={{ mt: -0.25 }}
          >
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          overflowX: "hidden",
          px: 2,
          py: 1.5,
          minWidth: 0
        }}
      >
        {activePlayback ? (
          <HelpVideoPlayer
            title={activePlayback.title}
            src={activePlayback.src}
            onBack={() => setActivePlayback(null)}
          />
        ) : null}

        {!activePlayback && isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading topics…
          </Typography>
        ) : null}

        {!activePlayback && !isLoading && loadError ? (
          <Typography variant="body2" color="error">
            {loadError}
          </Typography>
        ) : null}

        {!activePlayback && !isLoading && !loadError && topics.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No help topics are available for this area yet.
          </Typography>
        ) : null}

        {!activePlayback && !isLoading && !loadError && topics.length > 0 ? (
          <Stack spacing={1.25}>
            {topics.map((topic) => (
              <HelpTopicRow
                key={topic.topicId}
                topic={topic}
                onWatchLocalVideo={setActivePlayback}
                onWatchExternalVideo={handleWatchExternalVideo}
              />
            ))}
          </Stack>
        ) : null}
      </Box>
    </Drawer>
  );
}

export default OptalynxHelpDrawer;
