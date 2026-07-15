import { useRef } from "react";

import {
  Box,
  Button,
  Stack,
  Typography
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";

function formatFileSize(bytes) {
  if (bytes == null) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function EnterpriseFileUploadCard({
  title,
  subtitle,
  file = null,
  accept,
  maxFileSizeMB,
  helperText,
  disabled = false,
  onFileSelect
}) {
  const inputRef = useRef(null);

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      onFileSelect?.(selectedFile);
    }

    event.target.value = "";
  };

  return (
    <EnterpriseCard title={title} subtitle={subtitle}>
      <Stack spacing={1.5}>
        <Box
          sx={{
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 2,
            px: 1.5,
            py: 2,
            textAlign: "center",
            bgcolor: "background.default"
          }}
        >
          <UploadFileOutlinedIcon
            color="action"
            sx={{ fontSize: 32, mb: 0.5 }}
          />

          <Typography variant="body2" fontWeight={600}>
            Drop files here
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ my: 0.75 }}
          >
            or
          </Typography>

          <Button
            variant="contained"
            size="small"
            disabled={disabled}
            onClick={handleBrowseClick}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Browse Files
          </Button>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            hidden
            onChange={handleFileChange}
          />
        </Box>

        {file ? (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(file.size)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No file selected
          </Typography>
        )}

        {helperText ? (
          <Typography variant="caption" color="text.secondary" display="block">
            Supported: {helperText}
          </Typography>
        ) : null}

        {maxFileSizeMB != null ? (
          <Typography variant="caption" color="text.secondary" display="block">
            Maximum Size: {maxFileSizeMB} MB
          </Typography>
        ) : null}
      </Stack>
    </EnterpriseCard>
  );
}

export default EnterpriseFileUploadCard;
