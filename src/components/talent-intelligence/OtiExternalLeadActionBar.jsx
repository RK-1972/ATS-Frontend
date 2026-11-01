import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Link, Stack, TextField } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

import recruitmentClient from "@/api/clients/recruitmentClient";

function OtiExternalLeadActionBar({ row, requisitionCode, runId, onActionRecorded }) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retrievalStatus, setRetrievalStatus] = useState(null);
  const [error, setError] = useState("");

  const loadRetrievalStatus = useCallback(async () => {
    try {
      const response = await recruitmentClient.getOtiExternalResumeRetrievalStatus(
        row.external_lead_id,
        {
          run_id: runId,
          requisition_code: requisitionCode
        }
      );
      setRetrievalStatus(response?.data || null);
    } catch {
      setRetrievalStatus(null);
    }
  }, [row.external_lead_id, runId, requisitionCode]);

  useEffect(() => {
    loadRetrievalStatus();
  }, [loadRetrievalStatus, row.resume_retrieval_status, row.resume_index_status]);

  const permitted = Boolean(
    retrievalStatus?.resume_retrieval_permitted ||
      row?.permissions?.resume_download_permitted
  );

  const retrievalLocked =
    row?.resume_retrieval_status === "in_progress" ||
    row?.resume_retrieval_status === "completed" ||
    retrievalStatus?.resume_retrieval_status === "in_progress" ||
    retrievalStatus?.resume_retrieval_status === "completed";

  const postAction = async (actionType) => {
    setIsSubmitting(true);
    setError("");

    try {
      await recruitmentClient.postOtiExternalLeadAction(row.external_lead_id, {
        action_type: actionType,
        note,
        run_id: runId,
        requisition_code: requisitionCode
      });
      if (onActionRecorded) {
        await onActionRecorded();
      }
      await loadRetrievalStatus();
    } catch (actionError) {
      setError(actionError.response?.data?.message || actionError.message || "Action failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={0.75} sx={{ width: "100%", maxWidth: 220 }}>
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {row.profile_url || row.sources?.[0]?.profile_url ? (
          <Button
            size="small"
            variant="text"
            component={Link}
            href={row.profile_url || row.sources?.[0]?.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: "none" }}
          >
            Source
          </Button>
        ) : null}
        <Button
          size="small"
          variant="outlined"
          disabled={isSubmitting}
          onClick={() => postAction("shortlist")}
          sx={{ textTransform: "none" }}
        >
          Shortlist
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={isSubmitting}
          onClick={() => postAction("dismiss")}
          sx={{ textTransform: "none" }}
        >
          Dismiss
        </Button>
        {permitted ? (
          <Button
            size="small"
            variant="text"
            disabled={isSubmitting || retrievalLocked}
            onClick={() => postAction("request_resume_retrieval")}
            sx={{ textTransform: "none" }}
          >
            Retrieve
          </Button>
        ) : null}
      </Stack>
      {error ? (
        <Alert severity="error" sx={{ py: 0 }}>
          {error}
        </Alert>
      ) : null}
      <TextField
        size="small"
        label="Note"
        placeholder="Optional"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        fullWidth
      />
    </Stack>
  );
}

export default OtiExternalLeadActionBar;
