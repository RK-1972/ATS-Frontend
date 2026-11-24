import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import legalEntityProfileClient from "@/api/clients/legalEntityProfileClient";

function LegalEntityImagePreview({ recordId, assetPath, objectKey, label }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!recordId || !objectKey) {
      return undefined;
    }

    let active = true;
    let objectUrl = null;

    legalEntityProfileClient
      .fetchAssetBlob(recordId, assetPath)
      .then((blob) => {
        if (!active) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        setError("");
      })
      .catch(() => {
        if (active) {
          setError(`Unable to load ${label.toLowerCase()} preview.`);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [recordId, objectKey, assetPath, label]);

  if (!objectKey) {
    return null;
  }

  if (error) {
    return (
      <Typography variant="caption" color="error.main">
        {error}
      </Typography>
    );
  }

  if (!previewUrl) {
    return null;
  }

  return (
    <Box
      component="img"
      src={previewUrl}
      alt={`${label} preview`}
      sx={{
        maxWidth: 220,
        maxHeight: 120,
        objectFit: "contain",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 1,
        bgcolor: "background.paper"
      }}
    />
  );
}

export default LegalEntityImagePreview;