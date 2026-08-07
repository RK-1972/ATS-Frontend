import { useRef, useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

function UploadDocumentTemplateDialog({
  open,
  onClose,
  template,
  onSubmit,
  loading
}) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleClose = () => {
    if (loading) {
      return;
    }

    setSelectedFile(null);
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      return;
    }

    await onSubmit?.(selectedFile);
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Upload Template Document</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {template
              ? `${template.templateName} · v${template.version}`
              : "Select a template version"}
          </Typography>

          <Alert severity="info">
            Upload a DOCX file. The file is stored unchanged in Cloudflare R2.
          </Alert>

          <input
            ref={inputRef}
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hidden
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />

          <Button
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={() => inputRef.current?.click()}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
          >
            Choose DOCX
          </Button>

          {selectedFile ? (
            <Typography variant="body2" fontWeight={600}>
              {selectedFile.name}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedFile}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UploadDocumentTemplateDialog;
