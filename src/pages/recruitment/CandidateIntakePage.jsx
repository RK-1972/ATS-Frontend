import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { stepConnectorClasses } from "@mui/material/StepConnector";
import { alpha, styled } from "@mui/material/styles";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ZoomInOutlinedIcon from "@mui/icons-material/ZoomInOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

import EnterpriseWorkbench from "@/components/enterprise/framework/EnterpriseWorkbench";
import EnterpriseWorkspaceHeader from "@/components/enterprise/framework/EnterpriseWorkspaceHeader";
import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import EnterpriseFileUploadCard from "@/components/enterprise/EnterpriseFileUploadCard";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import useCandidateIntake from "@/hooks/useCandidateIntake";
import useCandidateSources from "@/hooks/useCandidateSources";
import API from "@/api/axios";

const RegistrationStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 18
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    backgroundColor: theme.palette.success.main
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    backgroundColor: theme.palette.success.main
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    borderRadius: 1,
    backgroundColor: theme.palette.divider
  }
}));

function RegistrationStepIconRoot({ completed, children }) {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: completed ? "success.main" : "transparent",
        border: completed ? "none" : "1.5px solid",
        borderColor: completed ? "transparent" : "divider",
        color: completed ? "common.white" : "text.disabled",
        flexShrink: 0
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Presentation-only horizontal progress.
 * Renders the existing intakeSteps workflow flags — does not own or drive parsing.
 */
function CandidateRegistrationProgressStepper({
  intakeSteps = [],
  intakeId = null
}) {
  const firstPendingIndex = intakeSteps.findIndex((step) => !step.completed);
  const activeStep =
    firstPendingIndex === -1 ? intakeSteps.length : firstPendingIndex;

  return (
    <Box sx={{ width: "100%", pt: 0.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={0.75}
        sx={{ mb: 1.5 }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          Candidate Registration Progress
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Intake ID:{" "}
          {intakeId
            ? `INT-${String(intakeId).padStart(5, "0")}`
            : "Not Created"}
        </Typography>
      </Stack>

      <Box
        sx={{
          width: "100%",
          overflowX: { xs: "auto", md: "visible" },
          pb: { xs: 0.5, md: 0 }
        }}
      >
        <Stepper
          alternativeLabel
          nonLinear
          activeStep={activeStep}
          connector={<RegistrationStepConnector />}
          sx={{
            width: "100%",
            minWidth: { xs: 720, md: "100%" },
            "& .MuiStepLabel-label": {
              mt: 1
            }
          }}
        >
          {intakeSteps.map((step) => {
            const StepIcon = step.icon;
            const statusText = step.completed ? "Completed" : "Pending";

            return (
              <Step key={step.label} completed={step.completed}>
                <StepLabel
                  StepIconComponent={(iconProps) => (
                    <RegistrationStepIconRoot completed={iconProps.completed}>
                      <StepIcon sx={{ fontSize: 18 }} />
                    </RegistrationStepIconRoot>
                  )}
                  optional={
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{
                        color: step.completed
                          ? "success.main"
                          : "text.disabled",
                        display: "block",
                        mt: 0.25
                      }}
                    >
                      {statusText}
                    </Typography>
                  }
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ display: "block", lineHeight: 1.3 }}
                  >
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </Box>
  );
}

function CandidateIntakeWorkflowPanel({
  selectedSource = "",
  onSourceChange,
  resumeFile = null,
  onFileSelect,
  onCreateIntake,
  onProcessResume,
  onParseResume,
  intakeStatus = "NEW"
}) {
  const { candidateSources, loading } = useCandidateSources();
  const [resumeParseCompleted, setResumeParseCompleted] = useState(false);

  const canCreateIntake =
    Boolean(selectedSource) &&
    Boolean(resumeFile) &&
    intakeStatus === "NEW";

  const createIntakeLabel =
    intakeStatus !== "NEW" ? "Intake Created" : "Create Intake";

  const isResumeParsed =
    intakeStatus === "COMPLETED" || resumeParseCompleted;

  const canParseResume =
    intakeStatus === "RESUME_UPLOADED" && !isResumeParsed;

  const parseResumeLabel =
    isResumeParsed ? "Resume Parsed" : "Parse Resume";

  const handleParseResume = async () => {
    try {
      await onParseResume();
      setResumeParseCompleted(true);
    } catch {
      // Keep the button enabled when parsing fails.
    }
  };

  return (
    <Stack spacing={1.5} sx={{ p: 1.5, minHeight: 0 }}>
      <EnterpriseCard title="Candidate Source">
        <FormControl fullWidth size="small" disabled={loading}>
          <InputLabel id="candidate-intake-source-label">
            Source
          </InputLabel>
          <Select
            labelId="candidate-intake-source-label"
            label="Source"
            value={selectedSource}
            onChange={(event) => onSourceChange(event.target.value)}
          >
            {candidateSources.map((source) => (
              <MenuItem
                key={source.source_id}
                value={source.source_id}
              >
                {source.source_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </EnterpriseCard>

      <EnterpriseFileUploadCard
        title="Resume Upload"
        subtitle="Upload candidate resume"
        file={resumeFile}
        accept=".pdf,.doc,.docx"
        maxFileSizeMB={5}
        helperText="PDF, DOC, DOCX"
        disabled={!selectedSource}
        onFileSelect={onFileSelect}
      />

      <Button
        variant="contained"
        fullWidth
        disabled={!canCreateIntake}
        onClick={onCreateIntake}
      >
        {createIntakeLabel}
      </Button>

      <Button
        variant="contained"
        fullWidth
        disabled={intakeStatus !== "INTAKE_CREATED"}
        onClick={onProcessResume}
      >
        Process Resume
      </Button>

      <Button
        variant="contained"
        fullWidth
        disabled={!canParseResume}
        onClick={handleParseResume}
      >
        {parseResumeLabel}
      </Button>
    </Stack>
  );
}

const DASHBOARD_KPI_FIELDS = [
  {
    label: "Total Registrations",
    key: "total_intakes",
    Icon: Inventory2OutlinedIcon
  },
  {
    label: "Resume Uploaded",
    key: "uploaded",
    Icon: UploadFileOutlinedIcon
  },
  {
    label: "Resume Parsed",
    key: "parsed",
    Icon: DescriptionOutlinedIcon
  },
  {
    label: "Ready for Review",
    key: "pending_review",
    Icon: FactCheckOutlinedIcon
  },
  {
    label: "Candidate Created",
    key: "candidate_created",
    Icon: PersonAddAltOutlinedIcon
  }
];

const EMPTY_DASHBOARD = {
  total_intakes: 0,
  uploaded: 0,
  parsed: 0,
  pending_review: 0,
  candidate_created: 0
};

const EDITABLE_CANDIDATE_FIELDS = [
  {
    label: "First Name",
    key: "first_name",
    Icon: PersonOutlineOutlinedIcon,
    grid: { xs: 12, sm: 6, md: 4 }
  },
  {
    label: "Last Name",
    key: "last_name",
    Icon: PersonOutlineOutlinedIcon,
    grid: { xs: 12, sm: 6, md: 4 }
  },
  {
    label: "Email",
    key: "email",
    Icon: MailOutlineOutlinedIcon,
    grid: { xs: 12, sm: 6, md: 4 }
  },
  {
    label: "Mobile",
    key: "mobile",
    Icon: PhoneOutlinedIcon,
    grid: { xs: 12, sm: 6, md: 4 }
  },
  {
    label: "Current Company",
    key: "current_company",
    Icon: WorkOutlineOutlinedIcon,
    grid: { xs: 12, sm: 6, md: 4 }
  },
  {
    label: "Designation",
    key: "designation",
    Icon: WorkOutlineOutlinedIcon,
    grid: { xs: 12, sm: 6, md: 4 }
  },
  {
    label: "Experience",
    key: "experience",
    Icon: WorkOutlineOutlinedIcon,
    grid: { xs: 12, sm: 6, md: 4 }
  },
  {
    label: "Skills",
    key: "skills",
    Icon: StarOutlineOutlinedIcon,
    grid: { xs: 12, sm: 12, md: 8 }
  }
];

function buildEditableCandidate(parsedCandidate) {
  if (!parsedCandidate) {
    return {
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      current_company: "",
      designation: "",
      experience: "",
      skills: ""
    };
  }

  const candidateName = String(
    parsedCandidate.candidate_name || parsedCandidate.name || ""
  ).trim();

  const fallbackNameParts = candidateName ? candidateName.split(/\s+/) : [];
  const fallbackFirstName = fallbackNameParts[0] || "";
  const fallbackLastName =
    fallbackNameParts.length > 1 ? fallbackNameParts.slice(1).join(" ") : "";

  const rawSkills = parsedCandidate.skills;
  const skills =
    Array.isArray(rawSkills)
      ? rawSkills.join(", ")
      : String(rawSkills || "");

  return {
    first_name: String(parsedCandidate.first_name || fallbackFirstName || ""),
    last_name: String(parsedCandidate.last_name || fallbackLastName || ""),
    email: String(parsedCandidate.email || parsedCandidate.email_id || ""),
    mobile: String(parsedCandidate.mobile || parsedCandidate.mobile_number || ""),
    current_company: String(
      parsedCandidate.current_company || parsedCandidate.company || ""
    ),
    designation: String(parsedCandidate.designation || parsedCandidate.role || ""),
    experience: String(parsedCandidate.experience || ""),
    skills: String(skills || "")
  };
}

function normalizeNumericExperience(value) {
  if (value === null || value === undefined || value === "") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const match = String(value).trim().match(/(\d+(?:\.\d+)?)/);

  if (!match) {
    return value;
  }

  const parsed = Number(match[1]);

  return Number.isFinite(parsed) ? parsed : value;
}

function buildDraftUpdatePayload(editableCandidate = {}, candidateContainer = "PIPELINE") {
  return {
    first_name: editableCandidate.first_name,
    last_name: editableCandidate.last_name,
    email_id: editableCandidate.email,
    mobile_number: editableCandidate.mobile,
    current_company: editableCandidate.current_company,
    current_designation: editableCandidate.designation,
    total_experience: normalizeNumericExperience(editableCandidate.experience),
    primary_skill: editableCandidate.skills,
    candidate_container: candidateContainer || "PIPELINE"
  };
}

function validateCreateIntake(selectedSource, resumeFile) {
  const errors = {};

  if (!selectedSource) {
    errors.source = "Candidate Source is required.";
  }

  if (!resumeFile) {
    errors.resume = "Resume upload is required.";
  }

  return errors;
}

function validateRegisterCandidate(editableCandidate) {
  const errors = {};

  if (!String(editableCandidate?.first_name || "").trim()) {
    errors.first_name = "First name is required.";
  }

  if (!String(editableCandidate?.last_name || "").trim()) {
    errors.last_name = "Last name is required.";
  }

  const email = String(editableCandidate?.email || "").trim();
  const mobile = String(editableCandidate?.mobile || "").trim();

  if (!email && !mobile) {
    const contactMessage = "Enter email or mobile.";
    errors.email = contactMessage;
    errors.mobile = contactMessage;
  }

  return errors;
}

function CandidateIntakeKPIBar({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: `repeat(${Math.min(items.length, 3)}, minmax(0, 1fr))`,
          md: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
          lg: `repeat(${Math.min(items.length, 6)}, minmax(0, 1fr))`
        },
        gap: 1.5,
        alignItems: "stretch"
      }}
    >
      {items.map((item, index) => {
        const Icon = item.Icon;

        return (
          <Box
            key={`${item.label}-${index}`}
            sx={{
              minWidth: 0,
              height: "100%",
              display: "flex",
              "& > .MuiPaper-root": {
                flex: 1,
                width: "100%",
                display: "flex",
                flexDirection: "column"
              },
              "& > .MuiPaper-root > .MuiBox-root": {
                py: 1,
                flex: 1
              }
            }}
          >
            <EnterpriseCard>
              <Stack spacing={0.5} alignItems="flex-start">
                <Icon fontSize="medium" color="primary" />
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color="text.primary"
                  sx={{
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums"
                  }}
                >
                  {item.value ?? "--"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </Stack>
            </EnterpriseCard>
          </Box>
        );
      })}
    </Box>
  );
}

function CandidateDetailsCard({
  editableCandidate,
  onChange,
  validationErrors = {},
  canShowRegisterCandidate = false,
  onRegisterCandidate,
  registerCandidateMessage = ""
}) {
  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: "20px",
        bgcolor: "background.paper",
        overflow: "hidden",
        height: "100%",
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2, py: 1.5 }}
      >
        <AssignmentIndOutlinedIcon color="primary" fontSize="small" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Candidate Profile
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Enterprise property grid
          </Typography>
        </Box>
        <Chip size="small" label="Editable" color="primary" variant="tonal" />
      </Stack>
      <Divider />
      <Box sx={{ px: 2, py: 1.5, width: "100%", flex: 1, minWidth: 0 }}>
        <Grid container spacing={1.25} sx={{ width: "100%" }}>
          {EDITABLE_CANDIDATE_FIELDS.map(({ label, key, Icon, grid }) => {
            const value = editableCandidate?.[key] || "";
            const fieldError = validationErrors[key];

            return (
              <Grid
                item
                xs={grid?.xs ?? 12}
                sm={grid?.sm ?? 6}
                md={grid?.md ?? 4}
                key={key}
              >
                <Stack spacing={0.35}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Icon sx={{ fontSize: 14, color: "primary.main" }} />
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        fontWeight: 700,
                        color: "text.secondary",
                        fontSize: 10
                      }}
                    >
                      {label}
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={value}
                    onChange={(event) => onChange?.(key, event.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    multiline={key === "skills"}
                    minRows={key === "skills" ? 2 : undefined}
                    required={
                      key === "first_name" ||
                      key === "last_name" ||
                      key === "email" ||
                      key === "mobile"
                    }
                    error={Boolean(fieldError)}
                    helperText={fieldError || undefined}
                    FormHelperTextProps={{
                      sx: { m: 0, minHeight: fieldError ? undefined : 0 }
                    }}
                    InputProps={{
                      sx: {
                        borderRadius: "12px",
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.03),
                        "& .MuiInputBase-input": {
                          py: 0.875
                        }
                      }
                    }}
                  />
                </Stack>
              </Grid>
            );
          })}
        </Grid>

        <Stack spacing={1} sx={{ mt: 1.25 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<HowToRegOutlinedIcon />}
            disabled={!canShowRegisterCandidate}
            onClick={onRegisterCandidate}
            sx={{ alignSelf: "flex-start", borderRadius: "14px" }}
          >
            Register Candidate
          </Button>
          {registerCandidateMessage ? (
            <Alert severity="info" sx={{ borderRadius: "14px" }}>
              {registerCandidateMessage}
            </Alert>
          ) : null}
        </Stack>
      </Box>
    </Card>
  );
}

function CandidateIntakeMainWorkspace({
  editableCandidate,
  onEditableCandidateChange,
  validationErrors = {},
  intakeStatus,
  resumeFile,
  canShowRegisterCandidate = false,
  onRegisterCandidate,
  registerCandidateMessage = ""
}) {
  const registrationErrors = [
    validationErrors.source,
    validationErrors.resume
  ].filter(Boolean);

  const uniqueRegistrationErrors = [...new Set(registrationErrors)];
  const [resumeUrl, setResumeUrl] = useState("");

  const shouldShowResumePreview =
    Boolean(resumeFile) &&
    (intakeStatus === "RESUME_UPLOADED" || intakeStatus === "COMPLETED");

  useEffect(() => {
    if (!shouldShowResumePreview) {
      setResumeUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(resumeFile);

    setResumeUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [resumeFile, shouldShowResumePreview]);

  const handleOpenResume = () => {
    if (!resumeUrl) {
      return;
    }

    window.open(resumeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Stack spacing={1.5} sx={{ flex: 1 }}>
      {uniqueRegistrationErrors.length > 0 ? (
        <Alert
          severity="error"
          icon={<ErrorOutlineRoundedIcon />}
          sx={{ borderRadius: "16px" }}
        >
          <Stack spacing={0.5}>
            {uniqueRegistrationErrors.map((message) => (
              <Typography key={message} variant="body2">
                {message}
              </Typography>
            ))}
          </Stack>
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
          gap: 1.5,
          width: "100%",
          minWidth: 0
        }}
      >
        <Box
          sx={{
            flex: { xs: "1 1 auto", md: "0 0 29%" },
            width: { xs: "100%", md: "29%" },
            maxWidth: { md: 380 },
            minWidth: { md: 280 },
            minHeight: 0
          }}
        >
          <Card
            elevation={2}
            sx={{
              borderRadius: "20px",
              overflow: "hidden",
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ px: 2, py: 1.5 }}
            >
              <PictureAsPdfOutlinedIcon color="primary" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Resume Preview
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {resumeFile?.name || "Candidate Resume"}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Zoom In">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!shouldShowResumePreview}
                      onClick={handleOpenResume}
                    >
                      <ZoomInOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Open full-screen preview">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!shouldShowResumePreview}
                      onClick={handleOpenResume}
                    >
                      <OpenInNewOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
            <Divider />
            <Box
              sx={{
                minHeight: 360,
                height: 360,
                display: "flex",
                alignItems:
                  shouldShowResumePreview && resumeUrl ? "stretch" : "center",
                justifyContent:
                  shouldShowResumePreview && resumeUrl ? "stretch" : "center",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03)
              }}
            >
              {shouldShowResumePreview && resumeUrl ? (
                <iframe
                  src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  title="Resume Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block"
                  }}
                />
              ) : (
                <Stack
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  sx={{ px: 2 }}
                >
                  <DescriptionOutlinedIcon
                    sx={{ fontSize: 48, color: "text.disabled" }}
                  />
                  <Typography variant="subtitle1" fontWeight={700}>
                    No Resume Loaded
                  </Typography>
                  <Chip
                    size="small"
                    icon={<UploadFileOutlinedIcon />}
                    label="Upload from Intake Panel"
                    variant="outlined"
                  />
                </Stack>
              )}
            </Box>
          </Card>
        </Box>

        <Box
          sx={{
            flex: "1 1 0%",
            minWidth: 0,
            width: { xs: "100%", md: "auto" },
            display: "flex"
          }}
        >
          <CandidateDetailsCard
            editableCandidate={editableCandidate}
            onChange={onEditableCandidateChange}
            validationErrors={validationErrors}
            canShowRegisterCandidate={canShowRegisterCandidate}
            onRegisterCandidate={onRegisterCandidate}
            registerCandidateMessage={registerCandidateMessage}
          />
        </Box>
      </Box>
    </Stack>
  );
}

function buildValidationChecklist(editableCandidate = {}) {
  const hasName =
    Boolean(String(editableCandidate.first_name || "").trim()) &&
    Boolean(String(editableCandidate.last_name || "").trim());
  const hasEmail = Boolean(String(editableCandidate.email || "").trim());
  const hasMobile = Boolean(String(editableCandidate.mobile || "").trim());
  const hasCompany = Boolean(
    String(editableCandidate.current_company || "").trim()
  );

  return [
    {
      key: "name",
      label: "Name",
      ok: hasName,
      Icon: PersonOutlineOutlinedIcon
    },
    {
      key: "email",
      label: "Email",
      ok: hasEmail,
      Icon: MailOutlineOutlinedIcon
    },
    {
      key: "mobile",
      label: "Mobile",
      ok: hasMobile,
      Icon: PhoneOutlinedIcon
    },
    {
      key: "linkedin",
      label: "LinkedIn Missing",
      ok: false,
      warning: true,
      Icon: LinkedInIcon
    },
    {
      key: "company",
      label: hasCompany ? "Current Company" : "Current Company Missing",
      ok: hasCompany,
      warning: !hasCompany,
      Icon: WorkOutlineOutlinedIcon
    }
  ];
}

function CandidateIntakeIntelligencePanel({ editableCandidate = null }) {
  const checklist = buildValidationChecklist(editableCandidate || {});
  const skillCount = String(editableCandidate?.skills || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
  const experienceValue = String(editableCandidate?.experience || "").trim();

  return (
    <Stack spacing={1.5} sx={{ p: 1.5, minHeight: 0 }}>
      <Card elevation={1} sx={{ borderRadius: "20px", overflow: "hidden" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ px: 2, py: 1.25 }}
        >
          <FactCheckOutlinedIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
            Validation
          </Typography>
          <Chip
            size="small"
            color="info"
            variant="tonal"
            label={`${checklist.filter((item) => item.ok).length}/${checklist.length}`}
          />
        </Stack>
        <Divider />
        <Stack spacing={1} sx={{ px: 1.5, py: 1.5 }}>
          {checklist.map((item) => {
            const ItemIcon = item.Icon;
            const tone = item.ok ? "success" : "warning";

            return (
              <Stack
                key={item.key}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1.25,
                  py: 1,
                  borderRadius: "14px",
                  bgcolor: (theme) =>
                    alpha(
                      item.ok
                        ? theme.palette.success.main
                        : theme.palette.warning.main,
                      0.1
                    )
                }}
              >
                {item.ok ? (
                  <CheckRoundedIcon color="success" sx={{ fontSize: 18 }} />
                ) : (
                  <WarningAmberRoundedIcon
                    color="warning"
                    sx={{ fontSize: 18 }}
                  />
                )}
                <ItemIcon sx={{ fontSize: 16, color: `${tone}.main` }} />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ flex: 1, fontSize: 13 }}
                >
                  {item.ok && !item.warning ? `✓ ${item.label}` : `⚠ ${item.label}`}
                </Typography>
                <Chip
                  size="small"
                  color={tone}
                  variant="filled"
                  label={item.ok ? "OK" : "Gap"}
                  sx={{ height: 22, fontSize: 11 }}
                />
              </Stack>
            );
          })}
        </Stack>
      </Card>

      <Card elevation={1} sx={{ borderRadius: "20px", overflow: "hidden" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ px: 2, py: 1.25 }}
        >
          <EnterpriseModuleIcon
            icon={AutoAwesomeOutlinedIcon}
            module="team"
            density="sm"
            size={28}
            iconSize={16}
          />
          <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
            AI Insights
          </Typography>
          <Chip
            size="small"
            icon={<InsightsOutlinedIcon />}
            label="Live"
            color="primary"
            variant="tonal"
          />
        </Stack>
        <Divider />
        <Stack spacing={1} sx={{ px: 1.5, py: 1.5 }}>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip
              size="small"
              color="info"
              variant="tonal"
              icon={<BadgeOutlinedIcon />}
              label={
                String(editableCandidate?.first_name || "").trim()
                  ? "Profile Parsed"
                  : "Awaiting Parse"
              }
            />
            <Chip
              size="small"
              color={skillCount > 0 ? "success" : "warning"}
              variant="tonal"
              icon={<StarOutlineOutlinedIcon />}
              label={skillCount > 0 ? `${skillCount} Skills` : "Skills Gap"}
            />
            <Chip
              size="small"
              color={experienceValue ? "success" : "default"}
              variant="tonal"
              icon={<WorkOutlineOutlinedIcon />}
              label={experienceValue || "Experience N/A"}
            />
          </Stack>
          <Box
            sx={{
              px: 1.25,
              py: 1.25,
              borderRadius: "14px",
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.08)
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Insight Signal
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
              {skillCount >= 3
                ? "Strong skill coverage detected for screening."
                : hasEmailOrMobile(editableCandidate)
                  ? "Contact ready — enrich skills before assignment."
                  : "Complete parse to unlock screening insights."}
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}

function hasEmailOrMobile(editableCandidate = {}) {
  return (
    Boolean(String(editableCandidate.email || "").trim()) ||
    Boolean(String(editableCandidate.mobile || "").trim())
  );
}

function CandidateRegistrationWorkflowStatusCard({
  duplicateCandidate,
  editableCandidate = null,
  isRegistered = false
}) {
  const isDuplicate = Boolean(duplicateCandidate) && !isRegistered;

  const candidateName = isDuplicate
    ? [duplicateCandidate.first_name, duplicateCandidate.last_name]
        .filter(Boolean)
        .join(" ")
        .trim()
    : [editableCandidate?.first_name, editableCandidate?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

  const candidateStatus = isRegistered
    ? "REGISTERED"
    : isDuplicate
      ? duplicateCandidate.candidate_status || "EXISTING"
      : "DRAFT";

  const statusChip = isRegistered
    ? { label: "Registered", color: "success", Icon: CheckCircleRoundedIcon }
    : isDuplicate
      ? {
          label: "Duplicate Found",
          color: "warning",
          Icon: WarningAmberRoundedIcon
        }
      : { label: "READY", color: "success", Icon: CheckCircleRoundedIcon };

  const shortMessage = isRegistered
    ? "Candidate registration completed."
    : isDuplicate
      ? "Matching candidate already exists."
      : "Ready for registration.";

  const StatusIcon = statusChip.Icon;

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: "16px",
        maxHeight: 90,
        height: 90,
        px: 2,
        display: "flex",
        alignItems: "center",
        bgcolor: (theme) =>
          alpha(
            isDuplicate
              ? theme.palette.warning.main
              : theme.palette.success.main,
            0.08
          )
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ width: "100%", minWidth: 0 }}
      >
        <StatusIcon
          color={statusChip.color}
          sx={{ fontSize: 28, flexShrink: 0 }}
        />
        <Chip
          size="small"
          color={statusChip.color}
          variant="filled"
          label={statusChip.label}
          sx={{ fontWeight: 700, flexShrink: 0 }}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {candidateName || "Candidate"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {candidateStatus} · {shortMessage}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

function RegisterCandidateDestinationDialog({
  open = false,
  onClose,
  selectedContainer = "PIPELINE",
  onSelectContainer,
  onConfirm
}) {
  let ownerLabel = "Logged-in recruiter";

  try {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
    const name = [loggedInUser?.first_name, loggedInUser?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    ownerLabel =
      name ||
      loggedInUser?.full_name ||
      loggedInUser?.employee_code ||
      "Logged-in recruiter";
  } catch {
    ownerLabel = "Logged-in recruiter";
  }

  const options = [
    {
      value: "PIPELINE",
      title: "My Pipeline",
      Icon: PersonIcon,
      module: "recruitment",
      description:
        "Candidate becomes part of your active recruitment pipeline.",
      owner: ownerLabel
    },
    {
      value: "TALENT_POOL",
      title: "Enterprise Talent Pool",
      Icon: PublicIcon,
      module: "candidates",
      description: "Candidate is available to all recruiters.",
      owner: "None"
    }
  ];

  const hasSelection = Boolean(selectedContainer);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "20px" }
      }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography variant="h6" fontWeight={700} component="span">
          Register Candidate
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          Choose where this candidate should be registered.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={1.25} sx={{ pt: 0.5 }}>
          {options.map((option) => {
            const OptionIcon = option.Icon;
            const selected = selectedContainer === option.value;

            return (
              <Card
                key={option.value}
                elevation={selected ? 2 : 0}
                sx={{
                  borderRadius: "16px",
                  border: 1,
                  borderColor: selected ? "primary.main" : "divider",
                  bgcolor: (theme) =>
                    selected
                      ? alpha(theme.palette.primary.main, 0.06)
                      : "background.paper"
                }}
              >
                <CardActionArea
                  onClick={() => onSelectContainer?.(option.value)}
                  sx={{ borderRadius: "16px" }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{ p: 1.5 }}
                  >
                    <EnterpriseModuleIcon
                      icon={OptionIcon}
                      module={option.module}
                      density="sm"
                      size={40}
                      iconSize={20}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          {option.title}
                        </Typography>
                        {selected ? (
                          <Chip
                            size="small"
                            color="primary"
                            label="Selected"
                            sx={{ height: 22 }}
                          />
                        ) : null}
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: 13 }}
                      >
                        {option.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.75, display: "block", fontWeight: 600 }}
                      >
                        Owner: {option.owner}
                      </Typography>
                    </Box>
                  </Stack>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, pt: 1, gap: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: "12px" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!hasSelection}
          onClick={onConfirm}
          sx={{ borderRadius: "12px" }}
        >
          Register Candidate
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CandidateIntakePage() {
  const [selectedSource, setSelectedSource] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [intakeId, setIntakeId] = useState(null);
  const [intakeStatus, setIntakeStatus] = useState("NEW");
  const [parsingStatus, setParsingStatus] = useState("PENDING");
  const [extractedText, setExtractedText] = useState("");
  const [parsedCandidate, setParsedCandidate] = useState(null);
  const [editableCandidate, setEditableCandidate] = useState(
    buildEditableCandidate(null)
  );
  const [intakeSessionKey, setIntakeSessionKey] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [createValidationErrors, setCreateValidationErrors] = useState({});
  const [registerCandidateMessage, setRegisterCandidateMessage] = useState("");
  const [registerSuccessOpen, setRegisterSuccessOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [candidateContainer, setCandidateContainer] = useState("PIPELINE");
  const [registeredCandidateSummary, setRegisteredCandidateSummary] = useState(
    null
  );
  // Used by Register Candidate to update the existing DRAFT via PUT /candidate/:id.
  const [draftCandidateId, setDraftCandidateId] = useState(null);
  const [duplicateCandidate, setDuplicateCandidate] = useState(null);
  const { createCandidateIntake, processResume, parseResume } = useCandidateIntake();

  const loadDashboard = async () => {
    setDashboardLoading(true);

    try {
      const response = await API.get("/candidate-intake/dashboard");
      const dashboardData = response?.data?.dashboard;

      if (response?.data?.success === false || !dashboardData) {
        setDashboard(EMPTY_DASHBOARD);
        return;
      }

      setDashboard({
        total_intakes: dashboardData.total_intakes ?? 0,
        uploaded: dashboardData.uploaded ?? 0,
        parsed: dashboardData.parsed ?? 0,
        pending_review: dashboardData.pending_review ?? 0,
        candidate_created: dashboardData.candidate_created ?? 0
      });
    } catch {
      setDashboard(EMPTY_DASHBOARD);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    setEditableCandidate(buildEditableCandidate(parsedCandidate));
  }, [parsedCandidate]);

  const kpiItems = DASHBOARD_KPI_FIELDS.map(({ label, key, Icon }) => ({
    label,
    Icon,
    value: dashboardLoading ? "--" : dashboard[key]
  }));

  // Exact completion flags from the original vertical Intake Progress component.
  // Resume Parsed also reflects existing parse outcomes set by handleParseResume
  // (parsingStatus / draftCandidateId) so the presentation stays in sync.
  const workflowStatuses = [
    "NEW",
    "INTAKE_CREATED",
    "RESUME_UPLOADED",
    "RESUME_PARSED",
    "CANDIDATE_CREATED"
  ];

  const isStatusAtLeast = (targetStatus) => {
    const currentIndex = workflowStatuses.indexOf(intakeStatus);
    const targetIndex = workflowStatuses.indexOf(targetStatus);

    return currentIndex >= targetIndex && targetIndex !== -1;
  };

  const intakeSteps = [
    {
      label: "Source Selected",
      icon: SourceOutlinedIcon,
      completed: Boolean(selectedSource)
    },
    {
      label: "Resume Selected",
      icon: DescriptionOutlinedIcon,
      completed: Boolean(resumeFile)
    },
    {
      label: "Intake Created",
      icon: PlaylistAddCheckOutlinedIcon,
      completed: isStatusAtLeast("INTAKE_CREATED")
    },
    {
      label: "Resume Uploaded",
      icon: CloudUploadOutlinedIcon,
      completed: isStatusAtLeast("RESUME_UPLOADED")
    },
    {
      label: "Resume Parsed",
      icon: AutoFixHighOutlinedIcon,
      completed:
        isStatusAtLeast("RESUME_PARSED") ||
        parsingStatus === "COMPLETED" ||
        Boolean(draftCandidateId)
    },
    {
      label: "Candidate Created",
      icon: PersonAddOutlinedIcon,
      completed: isStatusAtLeast("CANDIDATE_CREATED")
    }
  ];

  const resetIntakeSession = () => {
    setIntakeId(null);
    setIntakeStatus("NEW");
    setParsingStatus("PENDING");
    setExtractedText("");
    setParsedCandidate(null);
    setDraftCandidateId(null);
    setDuplicateCandidate(null);
    setRegisterCandidateMessage("");
    setRegisterDialogOpen(false);
    setCandidateContainer("PIPELINE");
    setIntakeSessionKey((currentKey) => currentKey + 1);
  };

  const handleResumeFileSelect = (file) => {
    setResumeFile(file);
    resetIntakeSession();
    setCreateValidationErrors((prev) => ({
      ...prev,
      resume: undefined
    }));
  };

  const handleSourceChange = (value) => {
    setSelectedSource(value);
    setCreateValidationErrors((prev) => ({
      ...prev,
      source: undefined
    }));
  };

  const handleEditableCandidateChange = (field, value) => {
    const nextCandidate = {
      ...editableCandidate,
      [field]: value
    };

    setEditableCandidate(nextCandidate);

    setCreateValidationErrors((prev) => {
      const next = { ...prev, [field]: undefined };
      const email = String(nextCandidate.email || "").trim();
      const mobile = String(nextCandidate.mobile || "").trim();

      if (email || mobile) {
        next.email = undefined;
        next.mobile = undefined;
      }

      return next;
    });
  };

  const handleCreateIntake = async () => {
    const errors = validateCreateIntake(selectedSource, resumeFile);

    if (Object.keys(errors).length > 0) {
      setCreateValidationErrors(errors);
      return;
    }

    setCreateValidationErrors({});

    const response = await createCandidateIntake({
      source_id: selectedSource,
      original_file_name: resumeFile.name
    });

    setIntakeId(response.intake_id);
    setIntakeStatus("INTAKE_CREATED");
    setRegisterCandidateMessage("");
    loadDashboard();
  };

  const handleRegisterCandidate = async () => {
    const profileErrors = validateRegisterCandidate(editableCandidate);

    if (Object.keys(profileErrors).length > 0) {
      setCreateValidationErrors((prev) => ({
        ...prev,
        ...profileErrors
      }));
      setRegisterDialogOpen(false);
      return;
    }

    if (!draftCandidateId) {
      setRegisterCandidateMessage(
        "Draft candidate is not available. Parse the resume before registering."
      );
      setRegisterDialogOpen(false);
      return;
    }

    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

      const payload = buildDraftUpdatePayload(
        editableCandidate,
        candidateContainer || "PIPELINE"
      );

      // Build FormData here so candidate_container is included (repository FORM_FIELDS
      // does not yet list it; same PUT /candidate/:id contract otherwise).
      const formData = new FormData();
      Object.entries(payload).forEach(([field, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(field, value);
        }
      });
      if (loggedInUser?.employee_code) {
        formData.append("created_by", loggedInUser.employee_code);
      }

      const response = await API.put(
        `/candidate/${draftCandidateId}`,
        formData
      ).then((res) => res.data);

      if (response?.success === false) {
        throw new Error(
          response.message || "Failed to update candidate"
        );
      }

      const updatedCandidate = response?.data || response;

      const candidateName = [
        updatedCandidate?.first_name || editableCandidate.first_name,
        updatedCandidate?.last_name || editableCandidate.last_name
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      setRegisteredCandidateSummary({
        candidate_code: updatedCandidate?.candidate_code || "--",
        candidate_name: candidateName || "--",
        candidate_status: "REGISTERED"
      });
      setCreateValidationErrors((prev) => ({
        ...prev,
        first_name: undefined,
        last_name: undefined,
        email: undefined,
        mobile: undefined
      }));
      setRegisterCandidateMessage("");
      setRegisterDialogOpen(false);
      setRegisterSuccessOpen(true);
    } catch (error) {
      setRegisterDialogOpen(false);
      setRegisterCandidateMessage(
        error?.message || "Failed to register candidate."
      );
    }
  };

  const handleProcessResume = async () => {
    const response = await processResume(intakeId, resumeFile);

    setIntakeStatus(response.intake_status);
    loadDashboard();
  };

  const handleParseResume = async () => {
    const response = await parseResume(intakeId);

    setParsedCandidate(response.parsed_candidate);

    if (response.outcome === "DUPLICATE") {
      setParsingStatus("COMPLETED");
      setDraftCandidateId(null);
      setDuplicateCandidate(response.duplicate_candidate || null);
      loadDashboard();
      return;
    }

    setParsingStatus(response.parsing_status);
    setExtractedText(response.extracted_text);
    setDraftCandidateId(response.draft_candidate_id ?? null);
    setDuplicateCandidate(null);
    loadDashboard();
  };

  console.log({
    intakeId,
    intakeStatus,
    draftCandidateId
  });

  return (
    <>
      <EnterpriseWorkbench
        header={
          <EnterpriseWorkspaceHeader
            title="Enterprise Candidate Registration"
            subtitle="Create and process candidate registrations from all channels."
            breadcrumbs={[
              { label: "Dashboard" },
              { label: "Recruitment" },
              { label: "Candidate Registration" }
            ]}
          />
        }
        kpis={
          <Stack spacing={1.5} sx={{ width: "100%" }}>
            <CandidateIntakeKPIBar items={kpiItems} />
            <CandidateRegistrationProgressStepper
              intakeSteps={intakeSteps}
              intakeId={intakeId}
            />
            {parsingStatus === "COMPLETED" ||
            Boolean(draftCandidateId) ||
            Boolean(duplicateCandidate) ||
            Boolean(registeredCandidateSummary) ? (
              <CandidateRegistrationWorkflowStatusCard
                duplicateCandidate={duplicateCandidate}
                editableCandidate={editableCandidate}
                isRegistered={Boolean(registeredCandidateSummary)}
              />
            ) : null}
          </Stack>
        }
        leftRail={
          <CandidateIntakeWorkflowPanel
            key={intakeSessionKey}
            selectedSource={selectedSource}
            onSourceChange={handleSourceChange}
            resumeFile={resumeFile}
            onFileSelect={handleResumeFileSelect}
            onCreateIntake={handleCreateIntake}
            intakeStatus={intakeStatus}
            onProcessResume={handleProcessResume}
            onParseResume={handleParseResume}
          />
        }
        rightPanel={
          <CandidateIntakeIntelligencePanel
            key={intakeSessionKey}
            editableCandidate={editableCandidate}
          />
        }
        main={
          <CandidateIntakeMainWorkspace
            key={intakeSessionKey}
            editableCandidate={editableCandidate}
            onEditableCandidateChange={handleEditableCandidateChange}
            validationErrors={createValidationErrors}
            intakeStatus={intakeStatus}
            resumeFile={resumeFile}
            canShowRegisterCandidate={Boolean(draftCandidateId)}
            onRegisterCandidate={() => {
              setCandidateContainer("PIPELINE");
              setRegisterDialogOpen(true);
            }}
            registerCandidateMessage={registerCandidateMessage}
          />
        }
      />
      <RegisterCandidateDestinationDialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        selectedContainer={candidateContainer}
        onSelectContainer={setCandidateContainer}
        onConfirm={handleRegisterCandidate}
      />
      <Dialog
        open={registerSuccessOpen}
        onClose={() => setRegisterSuccessOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Candidate Registered Successfully</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 0.5 }}>
            <Typography variant="body2">
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                Candidate Code:{" "}
              </Typography>
              {registeredCandidateSummary?.candidate_code || "--"}
            </Typography>
            <Typography variant="body2">
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                Candidate Name:{" "}
              </Typography>
              {registeredCandidateSummary?.candidate_name || "--"}
            </Typography>
            <Typography variant="body2">
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                Status:{" "}
              </Typography>
              {registeredCandidateSummary?.candidate_status || "REGISTERED"}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setRegisterSuccessOpen(false)}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CandidateIntakePage;
