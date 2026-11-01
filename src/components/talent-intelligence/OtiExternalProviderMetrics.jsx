import { Box, Chip, Stack, Typography } from "@mui/material";

function MetricCell({ label, value }) {
  return (
    <Box sx={{ minWidth: 88 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value ?? 0}
      </Typography>
    </Box>
  );
}

function OtiExternalProviderMetrics({ externalSummary }) {
  const providerMetrics = externalSummary?.provider_metrics;
  const consolidatedTotals = externalSummary?.consolidated_totals;

  if (!providerMetrics || !Object.keys(providerMetrics).length) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        bgcolor: "background.paper"
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        External sourcing by provider
      </Typography>

      {consolidatedTotals ? (
        <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 1.5 }}>
          <MetricCell label="Providers run" value={consolidatedTotals.providers_executed} />
          <MetricCell label="Resume candidates" value={consolidatedTotals.resume_candidates} />
          <MetricCell label="Retrieved" value={consolidatedTotals.resume_retrieved} />
          <MetricCell label="Qualified (≥50%)" value={consolidatedTotals.parsed_qualified} />
          <MetricCell label="Unique leads" value={consolidatedTotals.unique_staged_leads} />
        </Stack>
      ) : null}

      <Stack spacing={1.25}>
        {Object.entries(providerMetrics).map(([providerKey, row]) => (
          <Box
            key={providerKey}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1.5,
              p: 1.25
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {row.display_name || providerKey}
              </Typography>
              {row.connector_outcome !== "ok" ? (
                <Chip size="small" color="warning" variant="outlined" label={row.connector_outcome} />
              ) : (
                <Chip size="small" color="success" variant="outlined" label="ok" />
              )}
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={2}>
              <MetricCell label="Discovered" value={row.discovered} />
              <MetricCell label="Resume hits" value={row.resume_candidates} />
              <MetricCell label="Profiles only" value={row.profile_references} />
              <MetricCell label="Retrieved" value={row.resume_retrieved} />
              <MetricCell label="Ingest failed" value={row.ingest_failed} />
              <MetricCell label="Reuse skip" value={row.reuse_qualification_skipped} />
              <MetricCell label="Qualified" value={row.parsed_qualified} />
            </Stack>
            {row.connector_message ? (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
                {row.connector_message}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default OtiExternalProviderMetrics;
