import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert
} from "@mui/material";

function ImportExportDialog({

  open,
  onClose,
  entityLabel,
  importPreview,
  onPreview,
  onCommit,
  onExport

}) {

  const [tab, setTab] = useState(0);
  const [format, setFormat] = useState("CSV");
  const [pasteContent, setPasteContent] = useState("");
  const [reason, setReason] = useState("");

  const validCount = importPreview?.filter((row) => row.status === "Valid").length || 0;
  const duplicateCount = importPreview?.filter((row) => row.status === "Duplicate").length || 0;

  const handlePreview = () => {
    onPreview(pasteContent);
  };

  const handleClose = () => {
    setPasteContent("");
    setReason("");
    setTab(0);
    onClose();
  };

  return (

    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >

      <DialogTitle sx={{ fontWeight: 700 }}>
        Import / Export — {entityLabel}
      </DialogTitle>

      <DialogContent dividers>

        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ mb: 2, minHeight: 36 }}
        >
          <Tab label="Import" sx={{ minHeight: 36, py: 0.5 }} />
          <Tab label="Export" sx={{ minHeight: 36, py: 0.5 }} />
        </Tabs>

        {tab === 0 ? (

          <Stack spacing={2}>

            <Alert severity="info" sx={{ py: 0.5 }}>
              Mock import workflow — paste CSV data or upload a file. Validation preview
              detects duplicates before commit.
            </Alert>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>

              <TextField
                select
                size="small"
                label="Format"
                value={format}
                onChange={(event) => setFormat(event.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="CSV">CSV</MenuItem>
                <MenuItem value="Excel">Excel (.xlsx mock)</MenuItem>
              </TextField>

              <Button
                variant="outlined"
                component="label"
                size="small"
                sx={{ alignSelf: "center", fontWeight: 600 }}
              >
                Choose file
                <input
                  type="file"
                  hidden
                  accept=".csv,.txt,.xlsx"
                  onChange={(event) => {

                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    const reader = new FileReader();

                    reader.onload = (loadEvent) => {
                      setPasteContent(String(loadEvent.target?.result || ""));
                    };

                    reader.readAsText(file);

                  }}
                />
              </Button>

            </Stack>

            <TextField
              multiline
              minRows={5}
              size="small"
              label="Paste CSV content"
              placeholder={"Code,Name,Description\nNEW-001,New Record,Optional description"}
              value={pasteContent}
              onChange={(event) => setPasteContent(event.target.value)}
              fullWidth
            />

            <Button
              variant="outlined"
              onClick={handlePreview}
              disabled={!pasteContent.trim()}
              sx={{ alignSelf: "flex-start", fontWeight: 600 }}
            >
              Run validation preview
            </Button>

            {importPreview && (
              <Box>

                <Stack direction="row" spacing={1} mb={1}>
                  <Chip label={`${validCount} valid`} color="success" size="small" />
                  <Chip label={`${duplicateCount} duplicates`} color="warning" size="small" />
                </Stack>

                <Table size="small">

                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Row</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>

                    {importPreview.map((row) => (

                      <TableRow key={row.row}>

                        <TableCell sx={{ fontSize: 12 }}>{row.row}</TableCell>
                        <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>{row.code}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{row.name}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>
                          <Chip
                            label={row.status}
                            size="small"
                            color={row.status === "Valid" ? "success" : "warning"}
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        </TableCell>

                      </TableRow>

                    ))}

                  </TableBody>

                </Table>

              </Box>
            )}

            <TextField
              size="small"
              label="Import reason (audit)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              fullWidth
            />

          </Stack>

        ) : (

          <Stack spacing={2}>

            <Typography variant="body2" color="text.secondary">
              Export all records for the selected entity type as CSV or Excel-compatible format.
            </Typography>

            <TextField
              select
              size="small"
              label="Export format"
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              sx={{ maxWidth: 200 }}
            >
              <MenuItem value="CSV">CSV</MenuItem>
              <MenuItem value="Excel">Excel (.xlsx mock)</MenuItem>
            </TextField>

          </Stack>

        )}

      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>

        <Button onClick={handleClose}>Cancel</Button>

        {tab === 0 ? (
          <Button
            variant="contained"
            disabled={!importPreview || validCount === 0}
            onClick={() => {
              onCommit(pasteContent, reason);
              handleClose();
            }}
            sx={{ fontWeight: 600 }}
          >
            Commit import ({validCount})
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => {
              onExport(format);
              handleClose();
            }}
            sx={{ fontWeight: 600 }}
          >
            Download export
          </Button>
        )}

      </DialogActions>

    </Dialog>

  );

}

export default ImportExportDialog;
