import { Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";
import { cardFramerProps } from "../../theme/motion";

/**
 * Shared enterprise Paper surface.
 * Motion renderer: Framer Motion using theme Motion Tokens / card presets.
 *
 * Uses Paper + component={motion.div} (not a parallel MotionSurface).
 * CSS transitions disabled so Framer owns transform/shadow (MuiPaper overrides
 * otherwise fight Framer and make motion look like it is not running).
 */
function EnterpriseSurface({ children, sx = {}, elevation = 0, padding = true }) {
  const theme = useTheme();
  const { radius } = theme.tokens;
  const reduced = useReducedMotion();
  const framer = cardFramerProps(Boolean(reduced));

  return (
    <Paper
      component={motion.div}
      elevation={elevation}
      initial={framer.initial}
      animate={framer.animate}
      whileHover={framer.whileHover}
      transition={framer.transition}
      sx={{
        p: padding ? { xs: 1.5, sm: 2 } : 0,
        borderRadius: `${radius.md}px`,
        border: elevation === 0 ? 1 : 0,
        borderColor: "divider",
        bgcolor: "background.paper",
        /* Framer owns motion — neutralize MuiPaper CSS transitions */
        transition: "none",
        ...sx
      }}
    >
      {children}
    </Paper>
  );
}

export default EnterpriseSurface;
