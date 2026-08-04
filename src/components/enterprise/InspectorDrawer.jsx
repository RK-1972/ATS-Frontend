import {
  Drawer,
  Box,
  IconButton,
  Typography
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useTheme } from "@mui/material/styles";
import { FramerDrawerTransition } from "../../theme/motionRenderer";

function InspectorDrawer({
  open,
  onClose,
  title,
  subtitle,
  width,
  children,
  anchor = "right"
}) {
  const theme = useTheme();
  const { layout, shadows, typography } = theme.tokens;
  const { tokens: motionTokens } = theme.motion;
  const drawerWidth = width || layout.inspectorWidth;

  return (
    <Drawer
      anchor={anchor}
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
            width: { xs: "100%", sm: drawerWidth },
            maxWidth: "100%",
            boxShadow: shadows.drawer
          }
        }
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider"
        }}
      >
        <Box minWidth={0} pr={1}>
          <Typography sx={{ ...typography.sectionTitle }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              color="text.secondary"
              sx={{ fontSize: typography.caption.fontSize, mt: 0.25 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="Close inspector"
          onClick={onClose}
          size="small"
        >
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {children}
      </Box>
    </Drawer>
  );
}

export default InspectorDrawer;
