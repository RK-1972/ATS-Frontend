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
  const hasLeadingContent = Boolean(title || subtitle);

  return (
    <Box sx={{ mb: dense ? 2 : 3 }}>
      {breadcrumbs.length > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 0.5,
            fontSize: typography.caption.fontSize,
            overflowWrap: "anywhere"
          }}
        >
          {breadcrumbs.map((b) => b.label).join(" / ")}
        </Typography>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent={hasLeadingContent || statusChip ? "space-between" : "flex-end"}
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1}
      >
        {hasLeadingContent ? (
          <Box sx={{ minWidth: 0 }}>
            {title ? (
              typeof title === "string" ? (
                <Typography
                  sx={{
                    ...typography.pageTitle,
                    color: "text.primary"
                  }}
                >
                  {title}
                </Typography>
              ) : (
                <Box sx={{ minWidth: 0, maxWidth: "100%" }}>{title}</Box>
              )
            ) : null}

            {subtitle ? (
              <Typography
                color="text.secondary"
                mt={title ? 0.5 : 0}
                sx={{
                  fontSize: typography.secondary.fontSize,
                  maxWidth: 720
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        ) : null}

        {statusChip || actions ? (
          <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
            {statusChip}
            {actions}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

export default WorkspaceHeader;
