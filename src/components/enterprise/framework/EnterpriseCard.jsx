import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";
import { cardFramerProps } from "../../../theme/motion";

/**
 * Shared enterprise Card (Paper + header).
 * Motion renderer: Framer Motion using theme Motion Tokens / card presets.
 * CSS transitions disabled so Framer owns transform/shadow.
 */
function EnterpriseCard({
  title = null,
  subtitle = null,
  actions = null,
  children = null
}) {
  const theme = useTheme();
  const { presets } = theme.motion;
  const reduced = useReducedMotion();
  const framer = cardFramerProps(Boolean(reduced));
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <Paper
      component={motion.div}
      elevation={0}
      initial={framer.initial}
      animate={framer.animate}
      whileHover={framer.whileHover}
      transition={framer.transition}
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        transition: "none",
        "&:focus-within": {
          outlineWidth: presets.focus.outlineWidth,
          outlineStyle: presets.focus.outlineStyle,
          outlineColor: presets.focus.outlineColor,
          outlineOffset: presets.focus.outlineOffset
        }
      }}
    >
      {hasHeader ? (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={1.5}
            sx={{ px: 1.5, py: 1.25 }}
          >
            <Box minWidth={0}>
              {title ? (
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="text.primary"
                  lineHeight={1.3}
                >
                  {title}
                </Typography>
              ) : null}

              {subtitle ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: title ? 0.25 : 0 }}
                >
                  {subtitle}
                </Typography>
              ) : null}
            </Box>

            {actions ? (
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                flexShrink={0}
              >
                {actions}
              </Stack>
            ) : null}
          </Stack>

          <Divider />
        </>
      ) : null}

      {children ? (
        <Box sx={{ px: 1.5, py: 1.5 }}>
          {children}
        </Box>
      ) : null}
    </Paper>
  );
}

export default EnterpriseCard;
