import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import offerClient from "@/api/clients/offerClient";
import recruitmentClient from "@/api/clients/recruitmentClient";
import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import { WorkspaceHeader, LoadingState } from "@/components/enterprise";
import useEnterpriseStore from "@/store/enterpriseStore";

function candidateOptionLabel(row) {
  const code = row.candidate_code || row.candidateCode || "—";
  const name = row.candidate_name || row.candidateName || "Candidate";
  const req = row.requisition_code || row.requisitionCode || "—";
  return `${code} — ${name} · ${req}`;
}

function mappingKey(row) {
  return String(row.mapping_id ?? row.mappingId ?? row.map_id ?? "");
}

function buildCandidateOptions(dashboard) {
  const buckets = [
    ...(dashboard.offerCandidates || []),
    ...(dashboard.activePipeline || []),
    ...(dashboard.pipeline || [])
  ];

  const byMapping = new Map();
  buckets.forEach((row) => {
    const key = mappingKey(row);
    if (!key || byMapping.has(key)) {
      return;
    }
    byMapping.set(key, row);
  });

  return Array.from(byMapping.values()).sort((a, b) =>
    candidateOptionLabel(a).localeCompare(candidateOptionLabel(b))
  );
}

function validateForm(form) {
  const errors = {
    candidate: "",
    offered_ctc: ""
  };
  let isValid = true;

  if (!form.candidate) {
    errors.candidate = "Select a candidate mapping.";
    isValid = false;
  }

  const ctc = Number(form.offered_ctc);
  if (!String(form.offered_ctc ?? "").trim()) {
    errors.offered_ctc = "Offered CTC is required.";
    isValid = false;
  } else if (!Number.isFinite(ctc) || ctc <= 0) {
    errors.offered_ctc = "Offered CTC must be greater than 0.";
    isValid = false;
  }

  return { isValid, errors };
}

function toCreatePayload(form) {
  const candidate = form.candidate || {};
  return {
    mapping_id: candidate.mapping_id ?? candidate.mappingId ?? candidate.map_id,
    candidate_id: candidate.candidate_id ?? candidate.candidateId,
    candidate_name: candidate.candidate_name || candidate.candidateName || "",
    requisition_code: candidate.requisition_code || candidate.requisitionCode || "",
    offered_ctc: Number(form.offered_ctc),
    comment: String(form.comment || "").trim()
  };
}

/**
 * Raise Offer Request — Enterprise transaction.
 * Create Draft → Submit → Pending Approval (existing offer APIs).
 */
function RaiseOfferRequestPage() {
  const navigate = useNavigate();
  const setStore = useEnterpriseStore.setState;

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    candidate: null,
    offered_ctc: "",
    comment: ""
  });
  const [errors, setErrors] = useState({
    candidate: "",
    offered_ctc: ""
  });

  let workspace = {};
  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  const canRaise = Boolean(workspace.showOfferWorkspace);

  useEffect(() => {
    let cancelled = false;

    async function loadCandidates() {
      setLoadingOptions(true);
      try {
        const dashboard = await recruitmentClient.getMyDashboard();
        if (!cancelled) {
          setCandidates(buildCandidateOptions(dashboard || {}));
        }
      } catch (_error) {
        if (!cancelled) {
          setCandidates([]);
          setFormError("Unable to load candidates for offer request.");
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    loadCandidates();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedReq = useMemo(() => {
    const candidate = form.candidate;
    if (!candidate) {
      return "";
    }
    return candidate.requisition_code || candidate.requisitionCode || "";
  }, [form.candidate]);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setFormError("");
  };

  const handleSubmitClick = () => {
    const validation = validateForm(form);
    setErrors(validation.errors);
    if (!validation.isValid) {
      setFormError("Complete the mandatory fields before submitting.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    setFormError("");

    const payload = toCreatePayload(form);
    const submitComment = payload.comment;
    delete payload.comment;

    try {
      // Reuse existing offer APIs: Draft → Submit (Pending Approval).
      const createResult = await offerClient.createOffer(payload);
      const offerId =
        createResult?.offer?.offerId ||
        createResult?.offer?.offer_id ||
        createResult?.data?.offerId ||
        createResult?.data?.offer_id;

      if (!offerId) {
        throw new Error("Offer was created but no offer id was returned.");
      }

      const submitResult = await offerClient.submitOffer(offerId, submitComment);
      const bundle = await offerClient.getAll();

      setStore({
        offers: bundle?.offers ? bundle : useEnterpriseStore.getState().offers,
        workforceUi: {
          ...useEnterpriseStore.getState().workforceUi,
          toastMessage:
            submitResult?.toastMessage || "Offer submitted for approval."
        }
      });

      setToast({
        open: true,
        message:
          submitResult?.toastMessage ||
          `Offer ${offerId} submitted. Status: Pending Approval.`,
        severity: "success"
      });

      setForm({ candidate: null, offered_ctc: "", comment: "" });

      setTimeout(() => {
        navigate("/offers/pending-approvals");
      }, 900);
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to raise offer request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!canRaise) {
    return (
      <>
        <WorkspaceHeader
          title="Raise Offer Request"
          subtitle="Create a new offer request for a candidate."
        />
        <Alert severity="warning">
          Offer Workspace is not enabled for your Employee Work Assignment.
        </Alert>
      </>
    );
  }

  return (
    <>
      <WorkspaceHeader
        title="Raise Offer Request"
        subtitle="Validate candidate context, enter offered CTC, and submit for enterprise approval."
      />

      {loadingOptions ? (
        <LoadingState message="Loading candidates…" />
      ) : (
        <EnterpriseCard
          title="Offer Request"
          subtitle="Status after submit: Pending Approval"
        >
          <Box sx={{ px: 1.5, pb: 1.5 }}>
            {formError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            ) : null}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Autocomplete
                  options={candidates}
                  value={form.candidate}
                  onChange={(_event, value) => handleFieldChange("candidate", value)}
                  getOptionLabel={(option) => candidateOptionLabel(option)}
                  isOptionEqualToValue={(option, value) =>
                    mappingKey(option) === mappingKey(value)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Candidate"
                      required
                      error={Boolean(errors.candidate)}
                      helperText={
                        errors.candidate ||
                        "Select a mapped candidate from your assigned requisitions."
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Requisition"
                  value={selectedReq}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  helperText="Inherited from candidate mapping"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Offered CTC (INR)"
                  value={form.offered_ctc}
                  onChange={(event) =>
                    handleFieldChange("offered_ctc", event.target.value)
                  }
                  required
                  fullWidth
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  error={Boolean(errors.offered_ctc)}
                  helperText={
                    errors.offered_ctc ||
                    "Absolute annual CTC amount (for example 2100000)."
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  label="Submit comment (optional)"
                  value={form.comment}
                  onChange={(event) =>
                    handleFieldChange("comment", event.target.value)
                  }
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              sx={{ mt: 2.5 }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate("/offers")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SendOutlinedIcon />}
                onClick={handleSubmitClick}
                disabled={submitting || loadingOptions}
              >
                {submitting ? "Submitting…" : "Submit for Approval"}
              </Button>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 1.5 }}
            >
              Submit creates an Offer draft and immediately initiates the existing
              Enterprise approval flow. Approval actions are not part of this phase.
            </Typography>
          </Box>
        </EnterpriseCard>
      )}

      <EnterpriseConfirmationDialog
        open={confirmOpen}
        title="Submit Offer Request?"
        message="The offer will be created and submitted for approval. Status will become Pending Approval."
        confirmLabel="Submit"
        loading={submitting}
        onConfirm={handleConfirmSubmit}
        onClose={() => setConfirmOpen(false)}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default RaiseOfferRequestPage;
