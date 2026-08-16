import { useRef, useEffect, useState, useCallback } from "react";

import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Popper,
  Paper,
  Fade
} from "@mui/material";

import {
  MdAccountBalance,
  MdCheckCircle,
  MdDescription,
  MdGroups,
  MdHowToReg,
  MdLocalOffer,
  MdPersonAdd,
  MdRecordVoiceOver,
  MdWorkOutline
} from "react-icons/md";

import {
  buildDetailRows,
  getMilestoneKeyLine,
  mapDisplayStatus
} from "./lifecycleTimelinePresentation";

const STAGE_ICONS = {
  budget_submitted: MdAccountBalance,
  budget_approved: MdCheckCircle,
  requisition_created: MdDescription,
  requisition_submitted: MdWorkOutline,
  requisition_approved: MdCheckCircle,
  recruiter_assigned: MdPersonAdd,
  candidate_pipeline: MdGroups,
  interview_progress: MdRecordVoiceOver,
  offer_progress: MdLocalOffer,
  hire_outcome: MdHowToReg,
  position_budget_approval: MdAccountBalance,
  approved_position: MdCheckCircle,
  requisition_raised: MdDescription,
  ta_leader_review: MdWorkOutline,
  approved_requisition: MdCheckCircle,
  recruiter_notified: MdPersonAdd,
  applied: MdGroups,
  screening: MdGroups,
  l1: MdRecordVoiceOver,
  l2: MdRecordVoiceOver,
  client: MdGroups,
  offer: MdLocalOffer,
  budget_validation: MdAccountBalance,
  finance_approval: MdCheckCircle,
  leadership_approval: MdCheckCircle,
  release_offer: MdLocalOffer,
  joined: MdHowToReg
};

const CARD_WIDTH = 128;
const TIMELINE_CARD_MIN_HEIGHT = 132;
const TIMELINE_TRACK_VERTICAL_PADDING = 32;

/** Fallback panel height aligned to timeline header + milestone track. */
const HCT_LIFECYCLE_PANEL_FALLBACK_HEIGHT = 41 + TIMELINE_CARD_MIN_HEIGHT + TIMELINE_TRACK_VERTICAL_PADDING;

function MilestoneDetailCard({ title, rows }) {

  return (

    <Paper
      elevation={4}
      sx={{
        p: 1.5,
        minWidth: 220,
        maxWidth: 300,
        borderRadius: 2,
        border: 1,
        borderColor: "divider"
      }}
    >

      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {rows.map((row) => (
          <Box key={`${row.label}-${row.value}`}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              display="block"
              sx={{ lineHeight: 1.2 }}
            >
              {row.label}
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>

    </Paper>

  );

}

function WorkflowCard({
  stage,
  selected,
  onSelect,
  cardRef,
  summary,
  metadata,
  onHoverChange
}) {

  const anchorRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const Icon = STAGE_ICONS[stage.key] ?? MdCheckCircle;
  const display = mapDisplayStatus(stage.status);
  const label = stage.name;
  const keyLine = getMilestoneKeyLine(stage, summary);
  const detailRows = buildDetailRows(stage, summary, metadata);
  const screenReaderDetails = detailRows.map((row) => `${row.label}: ${row.value}`).join(". ");
  const descriptionId = `milestone-detail-${stage.key}`;

  const openDetail = useCallback((immediate = false) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    if (immediate) {
      setDetailOpen(true);
      onHoverChange?.(true);
      return;
    }

    hoverTimerRef.current = setTimeout(() => {
      setDetailOpen(true);
      onHoverChange?.(true);
    }, 200);
  }, [onHoverChange]);

  const closeDetail = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    setDetailOpen(false);
    onHoverChange?.(false);
  }, [onHoverChange]);

  useEffect(() => () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  }, []);

  return (

    <Box
      sx={{
        position: "relative",
        flexShrink: 0,
        display: "flex"
      }}
    >

      <Box
        ref={(node) => {
          anchorRef.current = node;
          setAnchorEl(node);

          if (typeof cardRef === "function") {
            cardRef(node);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${label}, ${stage.status}. ${keyLine}.`}
        aria-describedby={descriptionId}
        aria-expanded={detailOpen}
        onClick={() => onSelect(stage.key)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(stage.key);
          }
        }}
        onMouseEnter={() => openDetail(false)}
        onMouseLeave={closeDetail}
        onFocus={() => openDetail(true)}
        onBlur={closeDetail}
        sx={{
          width: CARD_WIDTH,
          minHeight: TIMELINE_CARD_MIN_HEIGHT,
          flexShrink: 0,
          border: 2,
          borderColor: selected ? "primary.main" : "divider",
          borderRadius: 2,
          bgcolor: selected ? "rgba(31, 59, 99, 0.04)" : "background.paper",
          px: 1.25,
          py: 1.25,
          cursor: "pointer",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxShadow: selected ? 1 : 0,
          display: "flex",
          flexDirection: "column",
          outline: "none",
          "&:hover": {
            borderColor: "primary.light",
            boxShadow: 1
          },
          "&:focus-visible": {
            borderColor: "primary.main",
            boxShadow: 2
          }
        }}
      >

        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: selected ? "primary.main" : "rgba(31, 59, 99, 0.08)",
            color: selected ? "primary.contrastText" : "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 0.875,
            flexShrink: 0
          }}
        >
          <Icon size={18} />
        </Box>

        <Typography
          variant="caption"
          fontWeight={700}
          lineHeight={1.3}
          sx={{
            fontSize: 11.5,
            mb: 0.75,
            minHeight: 30,
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            display: "-webkit-box"
          }}
        >
          {label}
        </Typography>

        <Chip
          label={display.label}
          size="small"
          color={display.color}
          variant={display.variant}
          sx={{
            height: 22,
            fontSize: 10,
            fontWeight: 700,
            mb: 0.75,
            alignSelf: "flex-start",
            maxWidth: "100%",
            "& .MuiChip-label": { px: 0.75, whiteSpace: "normal", lineHeight: 1.2 }
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: 10.5,
            lineHeight: 1.3,
            mt: "auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {keyLine}
        </Typography>

        <Typography
          id={descriptionId}
          component="span"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0
          }}
        >
          {screenReaderDetails}
        </Typography>

      </Box>

      <Popper
        open={detailOpen && Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="top"
        transition
        disablePortal
        modifiers={[
          { name: "offset", options: { offset: [0, 10] } },
          { name: "preventOverflow", options: { padding: 8 } }
        ]}
        sx={{ zIndex: (theme) => theme.zIndex.tooltip + 1 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <Box
              onMouseEnter={() => openDetail(false)}
              onMouseLeave={closeDetail}
            >
              <MilestoneDetailCard title={label} rows={detailRows} />
            </Box>
          </Fade>
        )}
      </Popper>

    </Box>

  );

}

function CardConnector({ active }) {

  return (

    <Box
      sx={{
        flexShrink: 0,
        width: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center"
      }}
    >

      <Box
        sx={{
          height: 2,
          width: "100%",
          bgcolor: active ? "success.main" : "divider",
          borderRadius: 1
        }}
      />

    </Box>

  );

}

function TimelineWorkspaceShell({ subtitle, children, centerContent = false }) {

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden",
        width: "100%",
        minWidth: 0,
        maxWidth: "100%"
      }}
    >

      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1
        }}
      >

        <Typography variant="subtitle2" fontWeight={700}>
          Hiring Lifecycle
        </Typography>

        {subtitle ? (
          <Typography variant="caption" color="text.secondary" textAlign="right">
            {subtitle}
          </Typography>
        ) : null}

      </Box>

      <Box
        sx={{
          minHeight: TIMELINE_CARD_MIN_HEIGHT + TIMELINE_TRACK_VERTICAL_PADDING,
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          overflow: centerContent ? "visible" : "hidden",
          display: centerContent ? "flex" : "grid",
          gridTemplateColumns: centerContent ? undefined : "minmax(0, 1fr)",
          alignItems: centerContent ? "center" : undefined,
          justifyContent: centerContent ? "center" : undefined,
          px: centerContent ? 3 : 0,
          py: centerContent ? 2 : 0
        }}
      >
        {children}
      </Box>

    </Box>

  );

}

function TimelinePlaceholder({ message, loading = false }) {

  return (

    <TimelineWorkspaceShell centerContent>

      {loading ? (
        <CircularProgress size={28} />
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {message}
        </Typography>
      )}

    </TimelineWorkspaceShell>

  );

}

function EnterpriseProcessTimeline({

  stages,
  selectedKey,
  onSelect,
  loading = false,
  error = "",
  emptyMessage = "Select a requisition to view the hiring lifecycle.",
  lifecycleSummary = null,
  lifecycleMetadata = null

}) {

  const scrollRef = useRef(null);
  const cardRefs = useRef({});

  useEffect(() => {

    if (!stages?.length) {
      return;
    }

    const container = scrollRef.current;
    const el = cardRefs.current[selectedKey];

    if (!container || !el) {
      return;
    }

    const left =
      el.getBoundingClientRect().left
      - container.getBoundingClientRect().left
      + container.scrollLeft;
    const targetLeft = left - (container.clientWidth / 2) + (el.clientWidth / 2);

    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth"
    });

  }, [selectedKey, stages?.length]);

  if (loading) {
    return (
      <TimelinePlaceholder
        loading
        message="Loading hiring lifecycle..."
      />
    );
  }

  if (error) {
    return (
      <TimelinePlaceholder message={error} />
    );
  }

  if (!stages?.length) {
    return (
      <TimelinePlaceholder message={emptyMessage} />
    );
  }

  const completedCount = stages.filter(
    (stage) => stage.status === "Completed"
  ).length;

  return (

    <TimelineWorkspaceShell
      subtitle={`${completedCount} of ${stages.length} milestones complete`}
    >

      <Box
        ref={scrollRef}
        sx={{
          display: "block",
          overflowX: "auto",
          overflowY: "hidden",
          overscrollBehaviorX: "contain",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
          py: 2,
          px: 2,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 1
          }
        }}
      >

        <Box
          sx={{
            width: "max-content",
            minWidth: "100%",
            maxWidth: "none"
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "stretch"
            }}
          >

        {stages.map((stage, index) => {

          const selected = stage.key === selectedKey;
          const connectorActive = stage.status === "Completed";

          return (

            <Box
              key={stage.key}
              sx={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}
            >

              <WorkflowCard
                stage={stage}
                selected={selected}
                onSelect={onSelect}
                summary={lifecycleSummary}
                metadata={lifecycleMetadata}
                cardRef={(node) => {
                  cardRefs.current[stage.key] = node;
                }}
              />

              {index < stages.length - 1 && (
                <CardConnector active={connectorActive} />
              )}

            </Box>

          );

        })}

          </Box>

        </Box>

      </Box>

    </TimelineWorkspaceShell>

  );

}

export default EnterpriseProcessTimeline;

export { HCT_LIFECYCLE_PANEL_FALLBACK_HEIGHT };
