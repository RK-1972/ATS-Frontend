import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EnterpriseSurface from "./EnterpriseSurface";
import EnterpriseModuleIcon from "./EnterpriseModuleIcon";

/**
 * Optalynx Enterprise Module Card — Workspace Card visual standard.
 *
 * Built on EnterpriseSurface (motion + elevation) + EnterpriseModuleIcon.
 * Dense MD3 card for workspaces, modules, and landing tiles.
 * Equal-height friendly via height: 100% + flex column.
 */
function EnterpriseModuleCard({
  title,
  description = null,
  icon = null,
  module = "recruitment",
  actionLabel = "Open",
  onAction = null,
  children = null,
  sx = {}
}) {
  const theme = useTheme();
  const { layout, typography } = theme.tokens;

  return (
    <EnterpriseSurface
      elevation={0}
      padding={false}
      sx={{
        height: "100%",
        minHeight: layout.moduleCardMinHeight,
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        boxShadow: theme.tokens.shadows.low,
        ...sx
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          flex: 1,
          minWidth: 0
        }}
      >
        {icon ? (
          <EnterpriseModuleIcon icon={icon} module={module} density="md" />
        ) : null}

        <Box flex={1} minWidth={0}>
          <Typography
            fontWeight={700}
            sx={{
              fontSize: typography.sectionTitle.fontSize - 2,
              lineHeight: 1.3,
              color: "text.primary"
            }}
          >
            {title}
          </Typography>

          {description ? (
            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
                fontSize: typography.secondary.fontSize,
                lineHeight: 1.45
              }}
            >
              {description}
            </Typography>
          ) : null}

          {children}
        </Box>
      </Box>

      {onAction ? (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={onAction}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            {actionLabel}
          </Button>
        </Box>
      ) : null}
    </EnterpriseSurface>
  );
}

export default EnterpriseModuleCard;
