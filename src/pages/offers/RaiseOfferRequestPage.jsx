import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import offerClient from "@/api/clients/offerClient";
import recruitmentClient from "@/api/clients/recruitmentClient";
import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import { WorkspaceHeader, LoadingState } from "@/components/enterprise";
import useEnterpriseStore from "@/store/enterpriseStore";
import {
  PAY_FREQUENCY_OPTIONS,
  todayIsoDate,
  validateCommercialOfferFields
} from "@/utils/offerCommercialUtils";

const frequencyToggleSx = {
  flexWrap: "wrap",
  gap: 0.75,
  "& .MuiToggleButtonGroup-grouped": {
    border: 1,
    borderColor: "divider",
    borderRadius: "8px !important",
    margin: 0,
    "&:not(:first-of-type)": {
      marginLeft: 0,
      borderLeft: 1
    }
  },
  "& .MuiToggleButton-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: 12,
    px: 1.25,
    py: 0.625,
    lineHeight: 1.4
  }
};

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

function FormSection({ title, children }) {
  return (
    <Box>
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ fontSize: 14, mb: 1.5, color: "text.primary" }}
      >
        {title}
      </Typography>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );
}

function PayoutFrequencyField({ label, value, onChange, error, errorText }) {
  return (
    <FormControl fullWidth error={error}>
      <FormLabel
        sx={{
          fontSize: 12,
          fontWeight: 600,
          mb: 0.75,
          color: "text.secondary"
        }}
      >
        {label}
      </FormLabel>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={value || ""}
        onChange={(_event, nextValue) => {
          if (nextValue) {
            onChange(nextValue);
          }
        }}
        sx={frequencyToggleSx}
      >
        {PAY_FREQUENCY_OPTIONS.map((option) => (
          <ToggleButton key={option} value={option} aria-label={option}>
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {errorText ? <FormHelperText>{errorText}</FormHelperText> : null}
    </FormControl>
  );
}

function RevealPayoutFrequency({ show, children }) {
  return (
    <Grid
      size={{ xs: 12 }}
      sx={(theme) => ({
        py: 0,
        minHeight: 0,
        overflow: "hidden",
        transition: theme.transitions.create("margin", {
          duration: theme.transitions.duration.shortest
        }),
        ...(show
          ? { mt: 0 }
          : {
              mt: `-${theme.spacing(2)} !important`,
              height: 0,
              minHeight: 0
            })
      })}
    >
      <Collapse in={show} timeout="auto" unmountOnExit>
        <Box sx={{ pt: 0.5, pb: 0.5 }}>{children}</Box>
      </Collapse>
    </Grid>
  );
}

function validateForm(form) {
  const errors = {
    candidate: "",
    offered_ctc: "",
    expected_joining_date: "",
    variable_pay: "",
    variable_pay_frequency: "",
    joining_bonus: "",
    joining_bonus_frequency: ""
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

  const commercialValidation = validateCommercialOfferFields(form);
  Object.assign(errors, commercialValidation.errors);
  if (!commercialValidation.isValid) {
    isValid = false;
  }

  return { isValid, errors };
}

function toCreatePayload(form) {
  const candidate = form.candidate || {};
  const variablePay = Number(form.variable_pay || 0);
  const joiningBonus = Number(form.joining_bonus || 0);

  return {
    mapping_id: candidate.mapping_id ?? candidate.mappingId ?? candidate.map_id,
    candidate_id: candidate.candidate_id ?? candidate.candidateId,
    candidate_name: candidate.candidate_name || candidate.candidateName || "",
    requisition_code: candidate.requisition_code || candidate.requisitionCode || "",
    offered_ctc: Number(form.offered_ctc),
    expected_joining_date: form.expected_joining_date,
    variable_pay: variablePay,
    variable_pay_frequency: variablePay > 0 ? form.variable_pay_frequency : null,
    joining_bonus: joiningBonus,
    joining_bonus_frequency: joiningBonus > 0 ? form.joining_bonus_frequency : null,
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
    expected_joining_date: "",
    variable_pay: "0",
    variable_pay_frequency: "",
    joining_bonus: "0",
    joining_bonus_frequency: "",
    comment: ""
  });
  const [errors, setErrors] = useState({
    candidate: "",
    offered_ctc: "",
    expected_joining_date: "",
    variable_pay: "",
    variable_pay_frequency: "",
    joining_bonus: "",
    joining_bonus_frequency: ""
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
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "variable_pay" && Number(value || 0) <= 0) {
        next.variable_pay_frequency = "";
      }

      if (field === "joining_bonus" && Number(value || 0) <= 0) {
        next.joining_bonus_frequency = "";
      }

      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setFormError("");
  };

  const variablePayEnabled = Number(form.variable_pay || 0) > 0;
  const joiningBonusEnabled = Number(form.joining_bonus || 0) > 0;
  const minJoiningDate = todayIsoDate();

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

      setForm({
        candidate: null,
        offered_ctc: "",
        expected_joining_date: "",
        variable_pay: "0",
        variable_pay_frequency: "",
        joining_bonus: "0",
        joining_bonus_frequency: "",
        comment: ""
      });

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

            <Stack spacing={3} divider={<Divider flexItem />}>
              <FormSection title="Candidate Information">
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
                        fullWidth
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
                    slotProps={{ input: { readOnly: true } }}
                    helperText="Inherited from candidate mapping"
                  />
                </Grid>
              </FormSection>

              <FormSection title="Commercial Offer Details">
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Annual CTC (INR)"
                    value={form.offered_ctc}
                    onChange={(event) =>
                      handleFieldChange("offered_ctc", event.target.value)
                    }
                    required
                    fullWidth
                    type="number"
                    slotProps={{ htmlInput: { min: 1, step: 1 } }}
                    error={Boolean(errors.offered_ctc)}
                    helperText={errors.offered_ctc || "Annual offered CTC."}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Expected Date of Joining"
                    type="date"
                    value={form.expected_joining_date}
                    onChange={(event) =>
                      handleFieldChange("expected_joining_date", event.target.value)
                    }
                    required
                    fullWidth
                    error={Boolean(errors.expected_joining_date)}
                    helperText={
                      errors.expected_joining_date ||
                      "Must be today or a future date."
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { min: minJoiningDate }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Annual Variable Pay (INR)"
                    value={form.variable_pay}
                    onChange={(event) =>
                      handleFieldChange("variable_pay", event.target.value)
                    }
                    fullWidth
                    type="number"
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    error={Boolean(errors.variable_pay)}
                    helperText={
                      errors.variable_pay ||
                      (variablePayEnabled
                        ? " "
                        : "Set a value greater than 0 to configure payout frequency.")
                    }
                  />
                </Grid>

                <RevealPayoutFrequency show={variablePayEnabled}>
                  <PayoutFrequencyField
                    label="Variable Pay Payout Frequency"
                    value={form.variable_pay_frequency}
                    onChange={(value) =>
                      handleFieldChange("variable_pay_frequency", value)
                    }
                    error={Boolean(errors.variable_pay_frequency)}
                    errorText={errors.variable_pay_frequency || ""}
                  />
                </RevealPayoutFrequency>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Joining Bonus (INR)"
                    value={form.joining_bonus}
                    onChange={(event) =>
                      handleFieldChange("joining_bonus", event.target.value)
                    }
                    fullWidth
                    type="number"
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    error={Boolean(errors.joining_bonus)}
                    helperText={
                      errors.joining_bonus ||
                      (joiningBonusEnabled
                        ? " "
                        : "Set a value greater than 0 to configure payout frequency.")
                    }
                  />
                </Grid>

                <RevealPayoutFrequency show={joiningBonusEnabled}>
                  <PayoutFrequencyField
                    label="Joining Bonus Payout Frequency"
                    value={form.joining_bonus_frequency}
                    onChange={(value) =>
                      handleFieldChange("joining_bonus_frequency", value)
                    }
                    error={Boolean(errors.joining_bonus_frequency)}
                    errorText={errors.joining_bonus_frequency || ""}
                  />
                </RevealPayoutFrequency>
              </FormSection>

              <FormSection title="Recruiter Comments">
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Comment"
                    value={form.comment}
                    onChange={(event) =>
                      handleFieldChange("comment", event.target.value)
                    }
                    fullWidth
                    multiline
                    minRows={2}
                    helperText="Optional note for approvers"
                  />
                </Grid>
              </FormSection>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={1.5}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/offers")}
                    disabled={submitting}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendOutlinedIcon />}
                    onClick={handleSubmitClick}
                    disabled={submitting || loadingOptions}
                    sx={{ textTransform: "none", fontWeight: 600 }}
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
            </Stack>
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
