import { useId } from "react";

import {
  Box,
  Typography,
  Paper,
  Popper,
  Fade
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";

import useInspectableCardDetail from "../../hooks/useInspectableCardDetail";
import { denseCardFramerProps, motionPresets } from "../../theme/motion";
import InspectableDetailCard from "./InspectableDetailCard";

function VisuallyHidden({ id, children }) {

  return (
    <Typography
      id={id}
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
      {children}
    </Typography>
  );

}

function DenseM3Icon({ Icon, emphasis = false }) {

  const theme = useTheme();
  const { denseMotionCard, brand, moduleIcon, shadows } = theme.tokens;
  const preset = moduleIcon.densities[denseMotionCard.icon.density] || moduleIcon.densities.xs;
  const boxSize = preset.size;
  const glyphSize = preset.iconSize;

  return (
    <Box
      aria-hidden
      sx={{
        width: boxSize,
        height: boxSize,
        flexShrink: 0,
        borderRadius: `${moduleIcon.radius}px`,
        bgcolor: emphasis ? "primary.main" : brand.metricHighlight,
        color: emphasis ? "primary.contrastText" : "primary.main",
        border: emphasis ? 0 : `1px solid ${theme.palette.divider}`,
        boxShadow: shadows.low,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: denseMotionCard.icon.marginBottom,
        transition: theme.motion.transitions(
          ["background-color", "box-shadow", "transform"],
          "hover",
          "decelerate"
        )
      }}
    >
      {Icon ? (
        <Icon
          size={glyphSize}
          style={{
            width: glyphSize,
            height: glyphSize,
            display: "block"
          }}
        />
      ) : null}
    </Box>
  );

}

/**
 * Optalynx Dense M3 Motion Card — central metric / summary card primitive.
 *
 * Icon → value → label → supporting context.
 * Subtle Framer elevation on hover; keyboard focus; optional inspectable detail popper.
 */
function DenseM3MotionCard({
  icon: Icon = null,
  value,
  label,
  subtitle = "",
  highlight = false,
  unavailable = false,
  detail = null,
  descriptionId: descriptionIdProp = "",
  sx = {}
}) {

  const theme = useTheme();
  const { denseMotionCard, brand, radius } = theme.tokens;
  const reduced = useReducedMotion();
  const framer = denseCardFramerProps(Boolean(reduced));
  const autoId = useId().replace(/:/g, "");
  const descriptionId = descriptionIdProp || `motion-card-${autoId}`;
  const inspectable = Boolean(detail);

  const {
    setAnchorEl,
    anchorEl,
    detailOpen,
    cardHandlers,
    popperHandlers
  } = useInspectableCardDetail({ enabled: inspectable });

  const screenReaderDetails = inspectable
    ? [
      value,
      ...(detail.rows || []).map((row) => `${row.label}: ${row.value}`)
    ].join(". ")
    : "";

  return (

    <>

      <Paper
        component={motion.div}
        ref={setAnchorEl}
        elevation={0}
        initial={framer.initial}
        animate={framer.animate}
        whileHover={framer.whileHover}
        transition={framer.transition}
        role={inspectable ? "button" : undefined}
        tabIndex={inspectable ? 0 : undefined}
        aria-label={inspectable ? `${label}, ${value}.` : undefined}
        aria-describedby={inspectable ? descriptionId : undefined}
        aria-expanded={inspectable ? detailOpen : undefined}
        {...(inspectable ? cardHandlers : {})}
        sx={{
          px: denseMotionCard.paddingX,
          py: denseMotionCard.paddingY,
          minHeight: denseMotionCard.minHeight,
          borderRadius: `${radius.md}px`,
          border: 1,
          borderColor: "divider",
          bgcolor: highlight ? brand.metricHighlight : "background.paper",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          minWidth: 0,
          outline: "none",
          cursor: inspectable ? "default" : undefined,
          position: "relative",
          transition: "none",
          "&:focus-visible": {
            outlineWidth: motionPresets.focus.outlineWidth,
            outlineStyle: motionPresets.focus.outlineStyle,
            outlineColor: motionPresets.focus.outlineColor,
            outlineOffset: motionPresets.focus.outlineOffset
          },
          ...sx
        }}
      >

        {Icon ? <DenseM3Icon Icon={Icon} emphasis={highlight} /> : null}

        <Typography
          fontWeight={denseMotionCard.value.fontWeight}
          color={highlight ? "primary.main" : unavailable ? "text.secondary" : "text.primary"}
          sx={{
            fontVariantNumeric: "tabular-nums",
            lineHeight: denseMotionCard.value.lineHeight,
            fontSize: denseMotionCard.value.fontSize,
            mb: 0.25,
            whiteSpace: "nowrap"
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={denseMotionCard.label.fontWeight}
          sx={{
            lineHeight: denseMotionCard.label.lineHeight,
            fontSize: denseMotionCard.label.fontSize,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {label}
        </Typography>

        {subtitle ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: denseMotionCard.subtitle.fontSize,
              lineHeight: denseMotionCard.subtitle.lineHeight,
              mt: 0.25,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {subtitle}
          </Typography>
        ) : null}

        {inspectable ? (
          <VisuallyHidden id={descriptionId}>
            {screenReaderDetails}
          </VisuallyHidden>
        ) : null}

      </Paper>

      {inspectable ? (
        <Popper
          open={detailOpen && Boolean(anchorEl)}
          anchorEl={anchorEl}
          placement="top"
          transition
          modifiers={[
            { name: "offset", options: { offset: [0, 8] } },
            { name: "preventOverflow", options: { padding: 8 } }
          ]}
          sx={{ zIndex: (muiTheme) => muiTheme.zIndex.tooltip + 1 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={150}>
              <Box {...popperHandlers}>
                <InspectableDetailCard
                  title={detail.title ?? label}
                  value={detail.value ?? value}
                  rows={detail.rows ?? []}
                />
              </Box>
            </Fade>
          )}
        </Popper>
      ) : null}

    </>

  );

}

export default DenseM3MotionCard;
