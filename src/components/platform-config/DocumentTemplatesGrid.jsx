import {
  Chip,
  IconButton,
  Paper,
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
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

import { formatTemplateDate } from "@/utils/documentTemplateUtils";

function StatusChip({ status }) {
  const normalized = String(status || "Draft");
  const color =
    normalized === "Active"
      ? "success"
      : normalized === "Inactive"
        ? "default"
        : "warning";

  return (
    <Chip
      label={normalized}
      size="small"
      color={color}
      variant="outlined"
      sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
    />
  );
}

function DocumentTemplatesGrid({
  templates,
  onCreate,
  onUpload,
  onUploadNewVersion,
  onDownload,
  onActivate,
  onCompile
}) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="flex-end">
        <Tooltip title="Create Template">
          <IconButton color="primary" onClick={onCreate} aria-label="Create template">
            <AddCircleOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Template</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Default</TableCell>
              <TableCell>Effective From</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(templates || []).length ? (
              templates.map((template) => (
                <TableRow key={template.templateId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {template.templateName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.templateCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{template.documentCategory}</TableCell>
                  <TableCell>{template.version}</TableCell>
                  <TableCell>
                    <StatusChip status={template.status} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.isDefault ? "Yes" : "No"}
                      size="small"
                      color={template.isDefault ? "primary" : "default"}
                      variant="outlined"
                      sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell>{formatTemplateDate(template.effectiveFrom)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <Tooltip title="Upload New Version">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onUploadNewVersion?.(template)}
                            aria-label="Upload new version"
                          >
                            <AddCircleOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Upload DOCX">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onUpload?.(template)}
                            aria-label="Upload document"
                          >
                            <CloudUploadOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Download">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onDownload?.(template)}
                            disabled={!template.documentPath}
                            aria-label="Download document"
                          >
                            <DownloadOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Compile Template">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onCompile?.(template)}
                            disabled={!template.documentPath}
                            aria-label="Compile template"
                          >
                            <FactCheckOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Activate">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onActivate?.(template)}
                            disabled={
                              template.status === "Active" || !template.documentPath
                            }
                            aria-label="Activate template"
                          >
                            <PlayCircleOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No document templates configured.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

export default DocumentTemplatesGrid;
