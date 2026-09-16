import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLoader from "../../components/OptalynxLoader";
import candidatePortalClient from "../../api/clients/candidatePortalClient";
import { formatDateTime } from "../../utils/formatDateTime";

const CARD_SURFACE_SX = {
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  boxShadow: (theme) => theme.tokens.shadows.mid
};

function ApplicationCard({ application }) {
  return (
    <Card elevation={0} sx={CARD_SURFACE_SX}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {application.title || "Untitled Requisition"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {application.requisition_code}
              </Typography>
            </Box>
            {application.stage_name ? (
              <Chip
                label={application.stage_name}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ) : null}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {application.location || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Applied On
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatDateTime(application.applied_on, { includeYear: true })}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CandidateApplicationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await candidatePortalClient.listApplications();

        if (active) {
          setApplications(
            Array.isArray(response.data?.applications)
              ? response.data.applications
              : []
          );
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.data?.message ||
              "Unable to load your applications."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadApplications();

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
              My Applications
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Track the status of your job applications.
            </Typography>
          </Box>

          {errorMessage ? (
            <Alert severity="error">{errorMessage}</Alert>
          ) : null}

          {!errorMessage && applications.length === 0 ? (
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
                    <AssignmentOutlinedIcon />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    No applications yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    When you apply to a role, your application status will appear here.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {!errorMessage && applications.length > 0 ? (
            <Stack spacing={2}>
              {applications.map((application) => (
                <ApplicationCard
                  key={`${application.requisition_code}-${application.applied_on}`}
                  application={application}
                />
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}

export default CandidateApplicationsPage;
