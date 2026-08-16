import { useEffect, useRef, useState } from "react";
import { Box, Popover } from "@mui/material";

import { StatusChip } from "@/components/enterprise";
import InterviewProgressPreview from "./InterviewProgressPreview";
import { useInterviewProgressPreview } from "@/hooks/useInterviewProgressPreview";

function resolveMapId(row) {
  const mapId = row?.map_id ?? row?.mapId ?? row?.mapping_id ?? null;
  return mapId != null && String(mapId).trim() !== "" ? String(mapId).trim() : null;
}

function InterviewProgressStepCell({ row, value, chipSize }) {
  const mapId = resolveMapId(row);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pinned, setPinned] = useState(false);
  const closeTimerRef = useRef(null);
  const open = Boolean(anchorEl);
  const { data, loading, error, load } = useInterviewProgressPreview(mapId);
  const displayValue = value || "—";

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (open && mapId) {
      load();
    }
  }, [open, mapId, load]);

  const handleOpen = (event) => {
    clearCloseTimer();
    setAnchorEl(event.currentTarget);
  };

  const scheduleClose = () => {
    clearCloseTimer();

    if (pinned) {
      return;
    }

    closeTimerRef.current = setTimeout(() => {
      setAnchorEl(null);
    }, 120);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    clearCloseTimer();
    setPinned((current) => !current);
    setAnchorEl(event.currentTarget);

    if (!open) {
      load();
    }
  };

  const handlePopoverClose = () => {
    setPinned(false);
    setAnchorEl(null);
  };

  if (!mapId) {
    return (
      <StatusChip
        status={displayValue}
        variant="soft"
        size={chipSize}
      />
    );
  }

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-label={`View interview progress for map ${mapId}`}
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
        onFocus={handleOpen}
        onBlur={scheduleClose}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick(event);
          }
        }}
        sx={{
          display: "inline-flex",
          cursor: "pointer",
          borderRadius: 1,
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 1
          }
        }}
      >
        <StatusChip
          status={displayValue}
          variant="soft"
          size={chipSize}
        />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus
        disableAutoFocus
        disableEnforceFocus
        sx={{ pointerEvents: "none" }}
        slotProps={{
          paper: {
            elevation: 3,
            onMouseEnter: clearCloseTimer,
            onMouseLeave: scheduleClose,
            sx: {
              pointerEvents: "auto",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              mt: 0.25
            }
          }
        }}
      >
        <InterviewProgressPreview
          context={data}
          loading={loading}
          error={error}
        />
      </Popover>
    </>
  );
}

export default InterviewProgressStepCell;
