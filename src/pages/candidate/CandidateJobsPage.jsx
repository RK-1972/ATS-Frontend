import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLoader from "../../components/OptalynxLoader";
import candidatePortalClient from "../../api/clients/candidatePortalClient";

const CARD_SURFACE_SX = {
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  boxShadow: (theme) => theme.tokens.shadows.mid
};

function JobCard({ job, onOpen }) {
  return (
    <Card elevation={0} sx={CARD_SURFACE_SX}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {job.title || "Untitled Requisition"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.requisition_code}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {job.location || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {job.department || "—"}
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            onClick={onOpen}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
          >
            View Job
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CandidateJobsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await candidatePortalClient.listOpenRequisitions();

        if (active) {
          setJobs(
            Array.isArray(response.data?.requisitions)
              ? response.data.requisitions
              : []
          );
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.data?.message || "Unable to load available jobs."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

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
            onClick={() => navigate("/candidate/workspace")}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
          >
            Back to Workspace
          </Button>

          <Box>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              Browse Jobs
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Explore open opportunities and apply to roles that match your profile.
            </Typography>
          </Box>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          {!errorMessage && jobs.length === 0 ? (
            <Card elevation={0} sx={CARD_SURFACE_SX}>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack spacing={1.5} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "primary.main",
                      color: "primary.contrastText"
                    }}
                  >
                    <WorkOutlineOutlinedIcon />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    No jobs available right now
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check back later for new openings.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {!errorMessage && jobs.length > 0 ? (
            <Stack spacing={2}>
              {jobs.map((job) => (
                <JobCard
                  key={job.requisition_code}
                  job={job}
                  onOpen={() =>
                    navigate(`/candidate/jobs/${encodeURIComponent(job.requisition_code)}`)
                  }
                />
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}

export default CandidateJobsPage;
