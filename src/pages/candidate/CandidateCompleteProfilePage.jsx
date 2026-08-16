import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLoader from "../../components/OptalynxLoader";
import candidatePortalClient from "../../api/clients/candidatePortalClient";
import {
  buildEditableCandidate,
  buildProfileSavePayload,
  validateProfileFields
} from "../../utils/candidateProfileUtils";

const COMPACT_FIELD_PROPS = {
  size: "small",
  margin: "none"
};

const FORM_SURFACE_SX = {
  width: "100%",
  maxWidth: 720,
  mx: "auto",
  p: { xs: 2, sm: 2.5 },
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  boxShadow: (theme) => theme.tokens.shadows.mid
};

function resolveProfileActionError(error, fallbackMessage) {
  const apiMessage = error.response?.data?.message;

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  if (error.response?.status === 404) {
    return "Unable to upload and parse the resume. The profile service is unavailable — please ensure the backend server is running with the latest code and try again.";
  }

  if (error.response?.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  return fallbackMessage;
}

function CandidateCompleteProfilePage() {
  const navigate = useNavigate();

  const [resumeFile, setResumeFile] = useState(null);
  const [intakeId, setIntakeId] = useState(null);
  const [editableCandidate, setEditableCandidate] = useState(
    buildEditableCandidate(null)
  );
  const [validationErrors, setValidationErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState("upload");
  const [isBusy, setIsBusy] = useState(false);

  const canUpload = useMemo(
    () => resumeFile && resumeFile.name.toLowerCase().endsWith(".pdf"),
    [resumeFile]
  );

  const handleFieldChange = (field, value) => {
    setEditableCandidate((current) => ({
      ...current,
      [field]: value
    }));
    setValidationErrors((current) => ({
      ...current,
      [field]: undefined
    }));
  };

  const handleUploadAndParse = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!canUpload) {
      setErrorMessage("Please select a PDF resume file.");
      return;
    }

    setIsBusy(true);
    setStep("parsing");

    try {
      const intakeResponse = await candidatePortalClient.createProfileIntake();
      const createdIntakeId = intakeResponse.data?.intake_id;

      if (!createdIntakeId) {
        throw new Error("Failed to start profile intake.");
      }

      setIntakeId(createdIntakeId);

      await candidatePortalClient.processProfileIntake(
        createdIntakeId,
        resumeFile
      );

      const parseResponse = await candidatePortalClient.parseProfileIntake(
        createdIntakeId
      );

      setEditableCandidate(
        buildEditableCandidate(parseResponse.data?.profile || parseResponse.data?.parsed_candidate)
      );
      setStep("review");
    } catch (error) {
      console.error("[candidate/profile/complete] upload and parse failed", {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      setStep("upload");
      setErrorMessage(
        resolveProfileActionError(
          error,
          "Unable to upload and parse the resume. Please try again."
        )
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveProfile = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const errors = validateProfileFields(editableCandidate);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsBusy(true);

    try {
      await candidatePortalClient.saveProfile(
        buildProfileSavePayload(editableCandidate)
      );

      setSuccessMessage(
        "Your profile has been saved and submitted for recruiter review."
      );
      setStep("success");
    } catch (error) {
      console.error("[candidate/profile/complete] save profile failed", {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      setErrorMessage(
        resolveProfileActionError(error, "Unable to save your profile. Please try again.")
      );
    } finally {
      setIsBusy(false);
    }
  };

  if (step === "success") {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <AppHeader showUserActions={false} />
        <Container maxWidth="md" sx={{ py: 3 }}>
          <Paper elevation={0} sx={FORM_SURFACE_SX}>
            <Stack spacing={1.5}>
              <CheckCircleOutlineOutlinedIcon color="success" sx={{ fontSize: 32 }} />
              <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                Profile saved successfully
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {successMessage}
              </Typography>
              <Stack direction="row" spacing={1.25}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/candidate/workspace")}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Back to Workspace
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/candidate/profile")}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  View Profile
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader showUserActions={false} />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Button
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate("/candidate/workspace")}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
          >
            Back to Workspace
          </Button>

          <Paper elevation={0} sx={FORM_SURFACE_SX}>
            <Stack spacing={1.5}>
              <Box>
                <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                  Complete My Profile
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Upload your resume, review the parsed information, and save your
                  profile for recruiter review.
                </Typography>
              </Box>

              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

              {step === "upload" || step === "parsing" ? (
                <Stack spacing={1.25}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadOutlinedIcon />}
                    disabled={isBusy}
                    sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
                  >
                    Select PDF Resume
                    <input
                      hidden
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(event) => {
                        setResumeFile(event.target.files?.[0] || null);
                        setErrorMessage("");
                      }}
                    />
                  </Button>

                  {resumeFile ? (
                    <Typography variant="body2" color="text.secondary">
                      Selected file: {resumeFile.name}
                    </Typography>
                  ) : null}

                  <Button
                    variant="contained"
                    disabled={!canUpload || isBusy}
                    onClick={handleUploadAndParse}
                    sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
                  >
                    {isBusy ? <OptalynxLoader size={22} /> : "Upload and Parse Resume"}
                  </Button>
                </Stack>
              ) : null}

              {step === "review" ? (
                <Stack spacing={1.25}>
                  <Alert severity="info">
                    We&apos;ve created your profile from your resume. Please review
                    the information before saving.
                  </Alert>

                  <TextField
                    label="First Name"
                    value={editableCandidate.first_name}
                    onChange={(event) =>
                      handleFieldChange("first_name", event.target.value)
                    }
                    error={Boolean(validationErrors.first_name)}
                    helperText={validationErrors.first_name}
                    {...COMPACT_FIELD_PROPS}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    value={editableCandidate.last_name}
                    onChange={(event) =>
                      handleFieldChange("last_name", event.target.value)
                    }
                    error={Boolean(validationErrors.last_name)}
                    helperText={validationErrors.last_name}
                    {...COMPACT_FIELD_PROPS}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    value={editableCandidate.email}
                    onChange={(event) =>
                      handleFieldChange("email", event.target.value)
                    }
                    error={Boolean(validationErrors.email)}
                    helperText={validationErrors.email}
                    {...COMPACT_FIELD_PROPS}
                    fullWidth
                  />
                  <TextField
                    label="Mobile"
                    value={editableCandidate.mobile}
                    onChange={(event) =>
                      handleFieldChange("mobile", event.target.value)
                    }
                    error={Boolean(validationErrors.mobile)}
                    helperText={validationErrors.mobile}
                    {...COMPACT_FIELD_PROPS}
                    fullWidth
                  />
                  <TextField
                    label="Current Company"
                    value={editableCandidate.current_company}
                    onChange={(event) =>
                      handleFieldChange("current_company", event.target.value)
                    }
                    {...COMPACT_FIELD_PROPS}
                    fullWidth
                  />
                  <TextField
                    label="Designation"
                    value={editableCandidate.designation}
                    onChange={(event) =>
                      handleFieldChange("designation", event.target.value)
                    }
                    {...COMPACT_FIELD_PROPS}
                    fullWidth
                  />
                  <TextField
                    label="Experience"
                    value={editableCandidate.experience}
                    onChange={(event) =>
                      handleFieldChange("experience", event.target.value)
                    }
                    {...COMPACT_FIELD_PROPS}
                    fullWidth
                  />
                  <TextField
                    label="Skills"
                    value={editableCandidate.skills}
                    onChange={(event) =>
                      handleFieldChange("skills", event.target.value)
                    }
                    multiline
                    minRows={2}
                    {...COMPACT_FIELD_PROPS}
                    fullWidth
                  />
                  <TextField
                    label="Education"
                    value={editableCandidate.education}
                    onChange={(event) =>
                      handleFieldChange("education", event.target.value)
                    }
                    multiline
                    minRows={2}
                    {...COMPACT_FIELD_PROPS}
                    fullWidth
                  />

                  {intakeId ? (
                    <Typography variant="caption" color="text.secondary">
                      Intake reference: INT-{String(intakeId).padStart(5, "0")}
                    </Typography>
                  ) : null}

                  <Button
                    variant="contained"
                    disabled={isBusy}
                    onClick={handleSaveProfile}
                    sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
                  >
                    {isBusy ? <OptalynxLoader size={22} /> : "Save Profile"}
                  </Button>
                </Stack>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

export default CandidateCompleteProfilePage;
