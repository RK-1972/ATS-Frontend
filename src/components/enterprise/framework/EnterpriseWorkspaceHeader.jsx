import {
  Box,
  Breadcrumbs,
  Stack,
  Typography
} from "@mui/material";

function EnterpriseWorkspaceHeader({
  title,
  subtitle = null,
  breadcrumbs = null,
  actions = null
}) {
  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 1.5
      }}
    >
      {breadcrumbs?.length ? (
        <Breadcrumbs
          aria-label="Workspace breadcrumbs"
          sx={{ mb: 0.75 }}
        >
          {breadcrumbs.map((item, index) => (
            <Typography
              key={`${item.label}-${index}`}
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {item.label}
            </Typography>
          ))}
        </Breadcrumbs>
      ) : null}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Box minWidth={0}>
          <Typography
            variant="h5"
            fontWeight={700}
            lineHeight={1.2}
            color="text.primary"
          >
            {title}
          </Typography>

          {subtitle ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, maxWidth: 720 }}
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
    </Box>
  );
}

export default EnterpriseWorkspaceHeader;
