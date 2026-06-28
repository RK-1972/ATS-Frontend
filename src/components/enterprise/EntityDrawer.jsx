import {
  Drawer,
  Box,
  IconButton,
  Typography
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useTheme } from "@mui/material/styles";

function EntityDrawer({
  open,
  onClose,
  title,
  subtitle,
  width = 480,
  children,
  footer = null
}) {
  const theme = useTheme();
  const { shadows, typography } = theme.tokens;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: width },
            display: "flex",
            flexDirection: "column",
            boxShadow: shadows.drawer
          }
        }
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider"
        }}
      >
        <Box>
          <Typography sx={{ ...typography.sectionTitle }}>{title}</Typography>
          {subtitle && (
            <Typography
              color="text.secondary"
              sx={{ fontSize: typography.caption.fontSize }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton aria-label="Close" onClick={onClose} size="small">
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {children}
      </Box>

      {footer && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.default"
          }}
        >
          {footer}
        </Box>
      )}
    </Drawer>
  );
}

export default EntityDrawer;
