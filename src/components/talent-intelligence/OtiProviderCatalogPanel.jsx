import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function statusColor(status) {
  const value = String(status || "").toLowerCase();

  if (value === "healthy") {
    return "success";
  }

  if (value === "degraded") {
    return "warning";
  }

  if (value === "not_configured") {
    return "default";
  }

  return "error";
}

function OtiProviderCatalogPanel({ availability }) {
  const connectors = availability?.connectors || [];

  if (!connectors.length) {
    return (
      <Alert severity="info" variant="outlined">
        No external connectors are registered for this environment.
      </Alert>
    );
  }

  return (
    <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={600}>
          External providers ({connectors.filter((row) => row.configuration?.configured).length}/
          {connectors.length} configured)
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.25}>
          {connectors.map((connector) => {
            const configured = Boolean(connector.configuration?.configured);
            const health = connector.health?.status || "unknown";
            const operational = configured && health === "healthy";
            const permissions = connector.permissions || {};

            return (
              <Stack
                key={connector.provider_key}
                spacing={0.5}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: operational ? "action.hover" : "background.paper",
                  border: 1,
                  borderColor: "divider"
                }}
              >
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  <Typography variant="body2" fontWeight={700}>
                    {connector.display_name || connector.provider_key}
                  </Typography>
                  <Chip
                    size="small"
                    label={configured ? "Configured" : "Not configured"}
                    color={configured ? "primary" : "default"}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={health}
                    color={statusColor(health)}
                    variant="outlined"
                  />
                  {!operational ? (
                    <Chip size="small" label="Not operational" color="warning" variant="outlined" />
                  ) : null}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Capabilities: {(connector.capabilities || []).join(", ") || "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Profile search: {permissions.profile_search ? "yes" : "no"} · Resume retrieval:{" "}
                  {permissions.resume_download ? "licensed" : "not permitted"}
                </Typography>
                {!configured ? (
                  <Typography variant="caption" color="text.secondary">
                    Credentials are managed on the backend; unavailable providers are never treated as
                    live search sources.
                  </Typography>
                ) : null}
              </Stack>
            );
          })}

          <Typography variant="caption" color="text.secondary">
            Semantic search:{" "}
            {availability?.semantic_search_enabled ? "available" : "unavailable (embedding provider)"}{" "}
            · AI assist:{" "}
            {availability?.ai_assist_enabled ? "available" : "unavailable (platform/provider)"}
          </Typography>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default OtiProviderCatalogPanel;
