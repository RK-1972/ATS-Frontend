import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Link,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLoader from "../../components/OptalynxLoader";
import candidatePortalClient from "../../api/clients/candidatePortalClient";

const CARD_SURFACE_SX = {
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  boxShadow: (theme) => theme.tokens.shadows.mid
};

function DetailField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function isDuplicateApplyError(error) {
  const status = error.response?.status;
  const message = String(error.response?.data?.message || "").toLowerCase();

  return (
    status === 400 ||
    status === 409
  ) && (
    message.includes("already") ||
    message.includes("assigned") ||
    message.includes("mapped")
  );
}

function CandidateJobDetailPage() {
  const navigate = useNavigate();
  const { requisitionCode: requisitionCodeParam } = useParams();
  const requisitionCode = decodeURIComponent(requisitionCodeParam || "");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [job, setJob] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationReady, setApplicationReady] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    let active = true;

    const loadJobContext = async () => {
      setLoading(true);
      setErrorMessage("");
      setApplyError("");
      setApplySuccess(false);

      try {
        const [jobsResponse, applicationsResponse, workspaceResponse] =
          await Promise.all([
            candidatePortalClient.listOpenRequisitions(),
            candidatePortalClient.listApplications(),
            candidatePortalClient.getWorkspace()
          ]);

        if (!active) {
          return;
        }

        const jobs = Array.isArray(jobsResponse.data?.requisitions)
          ? jobsResponse.data.requisitions
          : [];
        const applications = Array.isArray(applicationsResponse.data?.applications)
          ? applicationsResponse.data.applications
          : [];
        const workspace = workspaceResponse.data || {};
        const isReady =
          Boolean(workspace.has_resume) &&
          String(workspace.portal_review_status || "").trim().toUpperCase() ===
            "SUBMITTED";

        const matchedJob = jobs.find(
          (row) => row.requisition_code === requisitionCode
        );

        if (!matchedJob) {
          setJob(null);
          setErrorMessage("This job is no longer available for applications.");
        } else {
          setJob(matchedJob);
          setAlreadyApplied(
            applications.some(
              (application) => application.requisition_code === requisitionCode
            )
          );
          setApplicationReady(isReady);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.data?.message || "Unable to load job details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadJobContext();

    return () => {
      active = false;
    };
  }, [requisitionCode]);

  const handleApply = async () => {
    if (!job?.requisition_code || applying || alreadyApplied || applySuccess) {
      return;
    }

    setApplying(true);
    setApplyError("");

    try {
      await candidatePortalClient.applyToRequisition(job.requisition_code);
      setApplySuccess(true);
      setAlreadyApplied(true);
    } catch (error) {
      if (isDuplicateApplyError(error)) {
        setAlreadyApplied(true);
        setApplyError(
          "You have already applied to this role. View your application status in My Applications."
        );
      } else {
        setApplyError(
          error.response?.data?.message ||
            "Unable to submit your application. Please try again."
        );
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default"
        }}
      >
        <OptalynxLoader size={36} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader showUserActions={false} />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <Button
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate("/candidate/jobs")}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
          >
            Back to Jobs
          </Button>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          {job ? (
            <Card elevation={0} sx={CARD_SURFACE_SX}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {job.title || "Untitled Requisition"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {job.requisition_code}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {job.employment_type ? (
                      <Chip label={job.employment_type} size="small" variant="outlined" />
                    ) : null}
                    {job.openings_count ? (
                      <Chip
                        label={`${job.openings_count} opening${job.openings_count === 1 ? "" : "s"}`}
                        size="small"
                        variant="outlined"
                      />
                    ) : null}
                  </Stack>

                  <Stack spacing={2}>
                    <DetailField label="Location" value={job.location} />
                    <DetailField label="Department" value={job.department} />
                    <DetailField label="Primary Skill" value={job.primary_skill} />
                    <DetailField label="Secondary Skill" value={job.secondary_skill} />
                    <DetailField
                      label="Experience"
                      value={
                        job.experience_min != null || job.experience_max != null
                          ? `${job.experience_min ?? "—"} - ${job.experience_max ?? "—"} years`
                          : null
                      }
                    />
                  </Stack>

                  {job.job_description ? (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Job Description
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}
                      >
                        {job.job_description}
                      </Typography>
                    </Box>
                  ) : null}

                  {applySuccess ? (
                    <Alert
                      severity="success"
                      icon={<CheckCircleOutlineOutlinedIcon fontSize="inherit" />}
                    >
                      Your application has been submitted successfully.
                    </Alert>
                  ) : null}

                  {applyError ? (
                    <Alert severity={alreadyApplied ? "info" : "error"}>
                      {applyError}
                    </Alert>
                  ) : null}

                  {!applySuccess && !alreadyApplied && !applicationReady ? (
                    <Alert severity="warning">
                      Complete your profile and upload your resume before applying.
                      {" "}
                      <Link
                        component="button"
                        type="button"
                        underline="hover"
                        onClick={() => navigate("/candidate/profile/complete")}
                        sx={{ fontWeight: 600 }}
                      >
                        Complete My Profile
                      </Link>
                    </Alert>
                  ) : null}

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    {!applySuccess && !alreadyApplied ? (
                      <Button
                        variant="contained"
                        onClick={handleApply}
                        disabled={applying || !applicationReady}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        {applying ? "Submitting..." : "Apply"}
                      </Button>
                    ) : null}

                    {alreadyApplied || applySuccess ? (
                      <Button
                        variant="contained"
                        onClick={() => navigate("/candidate/applications")}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        View My Applications
                      </Button>
                    ) : null}

                    <Button
                      variant="outlined"
                      onClick={() => navigate("/candidate/jobs")}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Browse More Jobs
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}

export default CandidateJobDetailPage;
