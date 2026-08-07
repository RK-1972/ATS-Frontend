import { useState } from "react";

import {
  Box,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";

function PlaceholderCopyButton({ token }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <Tooltip title="Copy placeholder">
        <IconButton size="small" onClick={handleCopy} aria-label={`Copy ${token}`}>
          <ContentCopyOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message={`Copied ${token}`}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}

function DocumentPlaceholderGroups({ groups }) {
  if (!groups?.length) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No placeholders are configured.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {groups.map((group) => (
        <Box key={group.namespace}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            {group.namespace}
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Placeholder</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Description</TableCell>
                  {group.namespace === "TABLE" ? <TableCell>Status</TableCell> : null}
                  <TableCell align="right">Copy</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(group.placeholders || []).map((placeholder) => (
                  <TableRow key={placeholder.token}>
                    <TableCell>
                      <Typography
                        component="code"
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontWeight: 600 }}
                      >
                        {placeholder.token}
                      </Typography>
                    </TableCell>
                    <TableCell>{placeholder.label}</TableCell>
                    <TableCell>{placeholder.description || "—"}</TableCell>
                    {group.namespace === "TABLE" ? (
                      <TableCell>
                        <Chip
                          label={placeholder.status || "Active"}
                          size="small"
                          color={placeholder.status === "Future" ? "default" : "success"}
                          variant="outlined"
                          sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell align="right">
                      <PlaceholderCopyButton token={placeholder.token} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Stack>
  );
}

export default DocumentPlaceholderGroups;
