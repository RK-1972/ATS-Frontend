import { Alert, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";

function OtiSourcingConfigPanel({
  availability,
  queryText,
  onQueryTextChange,
  includeExternal,
  onIncludeExternalChange,
  includeSemantic,
  onIncludeSemanticChange,
  includeAiAssist,
  onIncludeAiAssistChange
}) {
  return (
    <Stack spacing={1.25}>
      <Typography variant="subtitle2" fontWeight={700}>
        Sourcing configuration
      </Typography>

      <TextField
        label="Search focus (optional)"
        placeholder="Additional keywords to emphasize"
        value={queryText}
        onChange={(event) => onQueryTextChange(event.target.value)}
        fullWidth
        size="small"
      />

      <FormControlLabel
        control={
          <Switch checked={includeExternal} onChange={(event) => onIncludeExternalChange(event.target.checked)} />
        }
        label="External discovery (staged leads)"
      />

      <FormControlLabel
        control={
          <Switch checked={includeSemantic} onChange={(event) => onIncludeSemanticChange(event.target.checked)} />
        }
        label="Semantic search (embeddings)"
      />

      <FormControlLabel
        control={
          <Switch checked={includeAiAssist} onChange={(event) => onIncludeAiAssistChange(event.target.checked)} />
        }
        label="AI-assisted JD intelligence & query planning"
      />

      {includeExternal && availability?.configured_connector_count === 0 ? (
        <Alert severity="warning" variant="outlined">
          No external connectors are configured. Internal sourcing still runs; external staging stays empty.
        </Alert>
      ) : null}

      {includeSemantic && !availability?.semantic_search_enabled ? (
        <Alert severity="info" variant="outlined">
          Semantic retrieval requires a backend embedding provider.
        </Alert>
      ) : null}

      {includeAiAssist && !availability?.ai_assist_enabled ? (
        <Alert severity="info" variant="outlined">
          AI assist requires platform configuration and backend reasoning credentials.
        </Alert>
      ) : null}
    </Stack>
  );
}

export default OtiSourcingConfigPanel;
