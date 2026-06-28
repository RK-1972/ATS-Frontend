import { Box, Typography, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function WorkspaceHeader({
  title,
  subtitle,
  breadcrumbs = [],
  statusChip = null,
  actions = null,
  dense = true
}) {
  const theme = useTheme();
  const { typography } = theme.tokens;

  return (
    <Box sx={{ mb: dense ? 2 : 3 }}>
      {breadcrumbs.length > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 0.5,
            fontSize: typography.caption.fontSize
          }}
        >
          {breadcrumbs.map((b) => b.label).join(" / ")}
        </Typography>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1}
      >
        <Box minWidth={0}>
          <Typography
            sx={{
              ...typography.pageTitle,
              color: "text.primary"
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              color="text.secondary"
              mt={0.5}
              maxWidth={720}
              sx={{ fontSize: typography.secondary.fontSize }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Stack direction="row" alignItems="center" gap={1} flexShrink={0}>
          {statusChip}
          {actions}
        </Stack>
      </Stack>
    </Box>
  );
}

export default WorkspaceHeader;
