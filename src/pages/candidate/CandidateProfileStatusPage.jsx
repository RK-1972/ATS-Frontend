import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLoader from "../../components/OptalynxLoader";
import candidatePortalClient from "../../api/clients/candidatePortalClient";
import {
  deriveCandidatePortalProfileStatus,
  getCandidatePortalStatusDescription
} from "../../utils/candidatePortalStatusUtils";

const FORM_SURFACE_SX = {
  width: "100%",
  p: { xs: 2, sm: 2.5 },
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  boxShadow: (theme) => theme.tokens.shadows.mid
};

function StatusField({ label, value }) {
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

function CandidateProfileStatusPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    let active = true;

    const loadStatus = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await candidatePortalClient.getWorkspace();

        if (active) {
          setWorkspace(response.data);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.data?.message || "Unable to load your profile status."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStatus();

    return () => {
      active = false;
    };
  }, []);

  const profileStatus =
    workspace?.profile_status ||
    deriveCandidatePortalProfileStatus({
      candidate_status: workspace?.candidate_status,
      portal_review_status: workspace?.portal_review_status,
      profile_completion: workspace?.profile_completion,
      has_resume: workspace?.has_resume
    });

  const statusDescription = getCandidatePortalStatusDescription({
    profile_status: profileStatus,
    candidate_status: workspace?.candidate_status,
    portal_review_status: workspace?.portal_review_status
  });

  const profileCompletion = Math.round(Number(workspace?.profile_completion || 0));

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
        <Stack spacing={2}>
          <Button
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate("/candidate/workspace")}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
          >
            Back to Workspace
          </Button>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Paper elevation={0} sx={FORM_SURFACE_SX}>
            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
              >
                <Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                    Profile Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track where your profile is in the recruitment process.
                  </Typography>
                </Box>
                <Chip label={profileStatus} size="small" color="primary" />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {statusDescription}
              </Typography>

              <Stack spacing={1.5}>
                <StatusField
                  label="Profile Completion"
                  value={`${profileCompletion}%`}
                />
                {workspace?.candidate_code ? (
                  <StatusField
                    label="Candidate Code"
                    value={workspace.candidate_code}
                  />
                ) : null}
                {workspace?.candidate_status ? (
                  <StatusField
                    label="Lifecycle Status"
                    value={workspace.candidate_status}
                  />
                ) : null}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

export default CandidateProfileStatusPage;
