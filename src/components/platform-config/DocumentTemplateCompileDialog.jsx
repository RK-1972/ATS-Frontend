import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

function ValidationStatusChip({ status }) {
  const normalized = String(status || "Not Compiled");
  const color =
    normalized === "Valid"
      ? "success"
      : normalized === "Invalid"
        ? "error"
        : "default";

  return (
    <Chip
      label={normalized}
      color={color}
      variant="outlined"
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}

function PlaceholderTable({ title, rows, emptyMessage }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Placeholder</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Valid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows || []).length ? (
              rows.map((row) => (
                <TableRow key={row.placeholderToken || row.token}>
                  <TableCell>
                    <Typography
                      component="code"
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    >
                      {row.placeholderToken || row.token}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.placeholderType || row.type || "—"}</TableCell>
                  <TableCell>
                    {row.isValid === undefined ? "—" : row.isValid ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1.5 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function DocumentTemplateCompileDialog({ open, onClose, result }) {
  if (!result) {
    return null;
  }

  const detected = result.detectedPlaceholders || result.placeholders?.filter(
    (item) => item.placeholderType !== "unknown"
  ) || [];
  const unknown = result.unknownPlaceholders || [];
  const missing = result.missingRegistryEntries || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>
        Template Compilation — {result.templateName} v{result.version}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <ValidationStatusChip status={result.validationStatus} />
            <Chip label={`Total ${result.totalPlaceholders || 0}`} size="small" />
            <Chip label={`Valid ${result.valid || 0}`} size="small" color="success" variant="outlined" />
            <Chip label={`Invalid ${result.invalid || 0}`} size="small" color="error" variant="outlined" />
          </Stack>

          {(result.validationMessages || []).length ? (
            <Alert severity={result.validationStatus === "Valid" ? "success" : "warning"}>
              <Stack spacing={0.5}>
                {result.validationMessages.map((message) => (
                  <Typography key={message} variant="body2">
                    {message}
                  </Typography>
                ))}
              </Stack>
            </Alert>
          ) : (
            <Alert severity="success">All detected placeholders are valid.</Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <PlaceholderTable
                title="Detected Placeholders"
                rows={detected}
                emptyMessage="No namespace placeholders detected."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <PlaceholderTable
                title="Unknown Placeholders"
                rows={unknown.map((item) => ({
                  placeholderToken: item.token,
                  placeholderType: "unknown",
                  isValid: false
                }))}
                emptyMessage="No unknown placeholder formats found."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <PlaceholderTable
                title="Missing Registry Entries"
                rows={missing.map((item) => ({
                  placeholderToken: item.token,
                  placeholderType: item.namespace ? "scalar/table" : "unknown",
                  isValid: false
                }))}
                emptyMessage="No missing registry entries."
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentTemplateCompileDialog;
