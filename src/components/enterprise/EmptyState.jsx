import { Box, Typography, Stack, Button } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { useTheme } from "@mui/material/styles";

function EmptyState({
  icon: Icon = InboxOutlinedIcon,
  title = "Nothing here yet",
  description,
  actionLabel,
  onAction
}) {
  const theme = useTheme();
  const { typography } = theme.tokens;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 4,
        px: 2
      }}
    >
      <Icon sx={{ fontSize: 40, color: "text.disabled", mb: 1.5 }} />
      <Typography sx={{ ...typography.sectionTitle, fontSize: 16 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          color="text.secondary"
          maxWidth={400}
          mt={0.5}
          sx={{ fontSize: typography.secondary.fontSize }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" size="small" onClick={onAction} sx={{ mt: 2 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

export default EmptyState;
