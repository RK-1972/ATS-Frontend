import { Box, Typography, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function EntityHeader({
  title,
  subtitle,
  meta = [],
  statusChip = null,
  actions = null
}) {
  const theme = useTheme();
  const { typography, radius } = theme.tokens;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        borderRadius: `${radius.md}px ${radius.md}px 0 0`
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1}
      >
        <Box minWidth={0}>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography sx={{ ...typography.sectionTitle, color: "text.primary" }}>
              {title}
            </Typography>
            {statusChip}
          </Stack>

          {subtitle && (
            <Typography
              color="text.secondary"
              mt={0.25}
              sx={{ fontSize: typography.secondary.fontSize }}
            >
              {subtitle}
            </Typography>
          )}

          {meta.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={2} mt={0.75}>
              {meta.map((item) => (
                <Typography
                  key={item.label}
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: typography.caption.fontSize }}
                >
                  <Box component="span" fontWeight={600} color="text.primary">
                    {item.label}:
                  </Box>{" "}
                  {item.value}
                </Typography>
              ))}
            </Stack>
          )}
        </Box>

        {actions && (
          <Stack direction="row" gap={0.5} flexShrink={0}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default EntityHeader;
