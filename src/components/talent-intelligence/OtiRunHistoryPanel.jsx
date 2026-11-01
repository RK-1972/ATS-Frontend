import {
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";

function statusChipColor(status) {
  const value = String(status || "").toLowerCase();

  if (value === "completed") {
    return "success";
  }

  if (value === "failed") {
    return "error";
  }

  if (value === "processing") {
    return "warning";
  }

  return "default";
}

function OtiRunHistoryPanel({ runs = [], activeRunId, onSelectRun }) {
  if (!runs.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No previous sourcing runs for this requisition.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2" fontWeight={700}>
        Run history
      </Typography>
      <List dense disablePadding sx={{ maxHeight: 240, overflow: "auto" }}>
        {runs.map((run) => (
          <ListItemButton
            key={run.run_id}
            selected={run.run_id === activeRunId}
            onClick={() => onSelectRun(run)}
            sx={{ borderRadius: 1, mb: 0.5, border: 1, borderColor: "divider" }}
          >
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                    {run.run_id}
                  </Typography>
                  <Chip size="small" label={run.status} color={statusChipColor(run.status)} />
                </Stack>
              }
              secondary={`${run.results_count ?? 0} internal · ${run.created_on ? new Date(run.created_on).toLocaleString() : "—"}`}
            />
          </ListItemButton>
        ))}
      </List>
    </Stack>
  );
}

export default OtiRunHistoryPanel;
