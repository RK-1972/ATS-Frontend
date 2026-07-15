import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";

function EnterpriseCard({
  title = null,
  subtitle = null,
  actions = null,
  children = null
}) {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden"
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
