import { Chip, Stack, Typography } from "@mui/material";

function statusChip(status) {
  const value = String(status || "not_requested");

  const colorMap = {
    not_requested: "default",
    not_licensed: "default",
    requested: "info",
    in_progress: "warning",
    completed: "success",
    failed: "error",
    indexed: "success",
    unsupported: "warning"
  };

  const labelMap = {
    not_requested: "Not requested",
    not_licensed: "Not licensed",
    requested: "Requested",
    in_progress: "In progress",
    completed: "Retrieved",
    failed: "Retrieval failed",
    indexed: "Resume indexed",
    unsupported: "Index unsupported",
    not_indexed: "Not indexed"
  };

  return (
    <Chip
      size="small"
      variant="outlined"
      color={colorMap[value] || "default"}
      label={labelMap[value] || value}
    />
  );
}

function availabilityChip(availability) {
  const value = String(availability || "retrieval_unavailable");
  const labelMap = {
    resume_available: "Resume URL (public)",
    profile_only: "Public profile only",
    retrieval_unavailable: "Resume retrieval unavailable"
  };

  return (
    <Chip size="small" variant="outlined" color="default" label={labelMap[value] || value} />
  );
}

function OtiExternalResumeRetrievalStatus({ row }) {
  const resumeAvailability = row?.match_explanation?.resume_availability || null;
  const permitted = Boolean(
    row?.resume_retrieval_permitted ||
      row?.permissions?.resume_download_permitted ||
      row?.sources?.[0]?.resume_retrieval_permitted
  );

  const retrievalStatus =
    row?.resume_retrieval_status || (permitted ? "not_requested" : "not_licensed");
  const indexStatus = row?.resume_index_status || "not_indexed";

  return (
    <Stack spacing={0.5}>
      {resumeAvailability ? (
        <>
          <Typography variant="caption" color="text.secondary">
            Source
          </Typography>
          {availabilityChip(resumeAvailability)}
        </>
      ) : null}
      <Typography variant="caption" color="text.secondary">
        Retrieval
      </Typography>
      {statusChip(retrievalStatus)}
      <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
        Index
      </Typography>
      {statusChip(indexStatus === "indexed" ? "indexed" : indexStatus)}
    </Stack>
  );
}

export default OtiExternalResumeRetrievalStatus;
