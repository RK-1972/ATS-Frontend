import { Alert, Stack, Typography } from "@mui/material";

function OtiRunStatusBanner({ runMeta, runFailed, internalCount, externalCount }) {
  if (!runMeta?.run_id) {
    return null;
  }

  const status = String(runMeta.status || "").toLowerCase();
  const failed = runFailed || status === "failed";
  const processing = status === "processing";

  if (failed) {
    return (
      <Alert severity="error">
        Run {runMeta.run_id} failed. {runMeta.error_message || "Review limitation notes and retry."}
      </Alert>
    );
  }

  if (processing) {
    return <Alert severity="warning">Run {runMeta.run_id} is still processing.</Alert>;
  }

  return (
    <Alert severity="success" variant="outlined">
      <Stack spacing={0.25}>
        <Typography variant="body2" fontWeight={600}>
          Run {runMeta.run_id} completed
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Internal results: {internalCount ?? runMeta.internal_results_count ?? runMeta.results_count ?? 0} ·
          External leads: {externalCount ?? runMeta.external_leads_count ?? 0}
          {runMeta.completed_on ? ` · ${new Date(runMeta.completed_on).toLocaleString()}` : ""}
        </Typography>
      </Stack>
    </Alert>
  );
}

export default OtiRunStatusBanner;
