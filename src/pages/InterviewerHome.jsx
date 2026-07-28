import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import API from "../api/axios";
import AppHeader from "../components/layout/AppHeader";
import ResumePreviewDialog from "../components/ResumePreviewDialog";
import EnterpriseConfirmationDialog from "../components/enterprise/EnterpriseConfirmationDialog";
import { resolveResumeViewerUrl } from "../utils/resolveResumeViewerUrl";
import {
  EmptyState,
  EnterpriseDataGrid,
  StatusChip,
  WorkspaceHeader
} from "../components/enterprise";

function InterviewerHome() {
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = loggedInUser?.role_name || loggedInUser?.secondary_role || "Interviewer";
  const [interviews, setInterviews] = useState([]);
  const [resumePreview, setResumePreview] = useState({ open: false, url: "", title: "" });
  const [resumeUnavailable, setResumeUnavailable] = useState({ open: false, title: "" });
  const navigate = useNavigate();

  const fetchMyInterviews = async () => {
    try {
      const response = await API.get("/my-interviews");
      setInterviews(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMyInterviews();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Live dashboard counts from /my-interviews (same rules as before).
  const scheduledCount = interviews.filter((x) => !x.feedback_submitted).length;
  const completedCount = interviews.filter((x) => x.feedback_submitted).length;
  const selectedCount = interviews.filter((x) => x.final_outcome === "Selected").length;
  const rejectedCount = interviews.filter((x) => x.final_outcome === "Rejected").length;

  const kpiCards = [
    {
      key: "scheduled",
      label: "Scheduled",
      value: scheduledCount,
      icon: <EventAvailableOutlinedIcon fontSize="small" />,
      color: "primary.main"
    },
    {
      key: "completed",
      label: "Completed",
      value: completedCount,
      icon: <TaskAltOutlinedIcon fontSize="small" />,
      color: "info.main"
    },
    {
      key: "selected",
      label: "Selected",
      value: selectedCount,
      icon: <CheckCircleOutlineOutlinedIcon fontSize="small" />,
      color: "success.main"
    },
    {
      key: "rejected",
      label: "Rejected",
      value: rejectedCount,
      icon: <CancelOutlinedIcon fontSize="small" />,
      color: "error.main"
    }
  ];

  const openResumePreview = async (row) => {
    const title = row.candidate_name || "Candidate Resume";
    const url = resolveResumeViewerUrl({
      candidateId: row.candidate_id,
      resumePath: row.resume_path
    });

    // Intercept the "resume unavailable" case before opening the preview so
    // the dialog never renders the backend's not-available JSON. Availability
    // is confirmed via a lightweight authenticated pre-check against the
    // existing streaming endpoint (no change to endpoint / URL / auth).
    if (!url) {
      setResumeUnavailable({ open: true, title });
      return;
    }

    try {
      await API.head(`/candidate-resume/${row.candidate_id}`);
      setResumePreview({ open: true, url, title });
    } catch {
      setResumeUnavailable({ open: true, title });
    }
  };

  const closeResumePreview = () => {
    setResumePreview((prev) => ({ ...prev, open: false }));
  };

  const closeResumeUnavailable = () => {
    setResumeUnavailable((prev) => ({ ...prev, open: false }));
  };

  const openJdAlert = (row) => {
    alert(
      `Client : ${row.client_name}\n\nPosition : ${row.job_title}\n\nPrimary Skill : ${row.primary_skill}\n\nSecondary Skill : ${row.secondary_skill}\n\nExperience : ${row.experience_min} - ${row.experience_max} Years`
    );
  };

  const columns = [
    {
      field: "interview_date",
      headerName: "Date",
      minWidth: 110,
      width: 120,
      valueGetter: (_value, row) => {
        if (!row.interview_date) {
          return "";
        }
        return new Date(row.interview_date).toLocaleDateString();
      }
    },
    {
      field: "interview_time",
      headerName: "Time",
      minWidth: 90,
      width: 100
    },
    {
      field: "candidate_name",
      headerName: "Candidate",
      minWidth: 140,
      flex: 1
    },
    {
      field: "job_title",
      headerName: "Position",
      minWidth: 140,
      flex: 1
    },
    {
      field: "round_type",
      headerName: "Round",
      minWidth: 120,
      flex: 0.8
    },
    {
      field: "resume_path",
      headerName: "Resume",
      minWidth: 110,
      width: 120,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => openResumePreview(params.row)}
            sx={{ textTransform: "none", minWidth: 0, px: 1, py: 0.25 }}
          >
            Resume
          </Button>
        ) : (
          <Typography variant="body2" color="text.disabled">
            N/A
          </Typography>
        )
    },
    {
      field: "jd",
      headerName: "JD",
      minWidth: 90,
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => openJdAlert(params.row)}
          sx={{ textTransform: "none", minWidth: 0, px: 1, py: 0.25 }}
        >
          JD
        </Button>
      )
    },
    {
      field: "teams",
      headerName: "Teams",
      minWidth: 130,
      width: 140,
      sortable: false,
      renderCell: (params) =>
        params.row.feedback_submitted ? (
          <Button
            size="small"
            disabled
            sx={{ textTransform: "none", minWidth: 0, px: 1, py: 0.25 }}
          >
            Completed
          </Button>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => window.open(params.row.meeting_link, "_blank")}
            sx={{ textTransform: "none", minWidth: 0, px: 1, py: 0.25 }}
          >
            Join Teams
          </Button>
        )
    },
    {
      field: "feedback_submitted",
      headerName: "Feedback",
      minWidth: 120,
      width: 130,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Button
            size="small"
            disabled
            sx={{
              textTransform: "none",
              minWidth: 0,
              px: 1,
              py: 0.25,
              bgcolor: "success.50",
              color: "success.dark"
            }}
          >
            Submitted
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            startIcon={<RateReviewOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate(`/feedback/${params.row.schedule_id}`)}
            sx={{ textTransform: "none", minWidth: 0, px: 1.25, py: 0.25 }}
          >
            Submit
          </Button>
        )
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 110,
      width: 120,
      sortable: false,
      valueGetter: (_value, row) => (row.feedback_submitted ? "Completed" : "Scheduled"),
      renderCell: (params) => (
        <StatusChip status={params.value} variant="soft" size="small" />
      )
    }
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader
        loggedInUser={loggedInUser}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
        <Stack spacing={2}>
          <WorkspaceHeader
            title="Interviewer Workspace"
            subtitle="Review assigned interviews, join Teams meetings, and submit feedback."
          />

          <Grid container spacing={1.5}>
            {kpiCards.map((kpi) => (
              <Grid key={kpi.key} size={{ xs: 6, md: 3 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 28,
                          borderRadius: 1,
                          bgcolor: "action.hover",
                          color: kpi.color
                        }}
                      >
                        {kpi.icon}
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ letterSpacing: 0.2 }}
                      >
                        {kpi.label}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="text.primary"
                      sx={{ fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}
                    >
                      {kpi.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              My Interview Schedule
            </Typography>

            {interviews.length === 0 ? (
              <EmptyState
                title="No interviews assigned"
                description="Assigned interviews will appear here when a recruiter schedules you on the panel."
              />
            ) : (
              <EnterpriseDataGrid
                rows={interviews}
                columns={columns}
                getRowId={(row) =>
                  row.schedule_id ??
                  `${row.candidate_code ?? ""}-${row.interview_date ?? ""}-${row.interview_time ?? ""}`
                }
                height={440}
              />
            )}
          </Box>
        </Stack>
      </Container>

      <ResumePreviewDialog
        open={resumePreview.open}
        onClose={closeResumePreview}
        resumeUrl={resumePreview.url}
        title={resumePreview.title}
      />

      <EnterpriseConfirmationDialog
        open={resumeUnavailable.open}
        title="Resume Not Available"
        message={
          resumeUnavailable.title
            ? `No resume is available for ${resumeUnavailable.title}.`
            : "No resume is available for this candidate."
        }
        confirmLabel="OK"
        onConfirm={closeResumeUnavailable}
        onClose={closeResumeUnavailable}
      />
    </Box>
  );
}

export default InterviewerHome;
