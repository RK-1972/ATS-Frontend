import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLoader from "../../components/OptalynxLoader";
import candidatePortalClient from "../../api/clients/candidatePortalClient";
import {
  clearCandidateAuthStorage,
  getStoredCandidateUser
} from "../../utils/candidateSessionAuth";
import { getCandidatePortalStatusDescription } from "../../utils/candidatePortalStatusUtils";

function WorkspaceCard({
  title,
  description,
  actionLabel,
  onAction,
  disabled = false,
  chipLabel,
  icon: Icon
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        boxShadow: (theme) => theme.tokens.shadows.mid
      }}
    >
      <CardContent sx={{ p: 3, height: "100%" }}>
        <Stack spacing={2} height="100%">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText"
              }}
            >
              <Icon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {title}
              </Typography>
              {chipLabel ? (
                <Chip
                  label={chipLabel}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              ) : null}
            </Box>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {description}
          </Typography>

          <Button
            variant="contained"
            disabled={disabled}
            onClick={onAction}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
          >
            {actionLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CandidatePortalWorkspacePage() {
  const navigate = useNavigate();
  const storedUser = getStoredCandidateUser();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    let active = true;

    const loadWorkspace = async () => {
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
            error.response?.data?.message ||
              "Unable to load your workspace."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadWorkspace();

    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = () => {
    clearCandidateAuthStorage();
    navigate("/candidate/login", { replace: true });
  };

  const profileCompletion = Math.round(
    Number(workspace?.profile_completion || 0)
  );

  const displayName =
    workspace?.full_name ||
    storedUser?.full_name ||
    "Candidate";

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default"
      }}
    >
      <AppHeader showUserActions={false} />

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                Welcome, {displayName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage your professional profile and track your application status.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<LogoutOutlinedIcon />}
              onClick={handleSignOut}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Sign Out
            </Button>
          </Stack>

          {errorMessage ? (
            <Typography color="error">{errorMessage}</Typography>
          ) : null}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <WorkspaceCard
                title="Complete My Profile"
                chipLabel={`${profileCompletion}% complete`}
                description="Upload your resume and review your profile information."
                actionLabel="Complete Profile"
                onAction={() => navigate("/candidate/profile/complete")}
                disabled={workspace?.candidate_status === "REGISTERED"}
                icon={UploadFileOutlinedIcon}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <WorkspaceCard
                title="My Profile"
                description="View and update your professional profile."
                actionLabel="View Profile"
                onAction={() => navigate("/candidate/profile")}
                icon={PersonOutlineOutlinedIcon}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <WorkspaceCard
                title="My Applications"
                description="No applications yet."
                actionLabel="View Applications"
                onAction={() => {}}
                disabled
                icon={AssignmentOutlinedIcon}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <WorkspaceCard
                title="Profile Status"
                chipLabel={workspace?.profile_status || "Profile Incomplete"}
                description={getCandidatePortalStatusDescription({
                  profile_status: workspace?.profile_status,
                  candidate_status: workspace?.candidate_status,
                  portal_review_status: workspace?.portal_review_status
                })}
                actionLabel="View Status"
                onAction={() => navigate("/candidate/profile/status")}
                icon={FactCheckOutlinedIcon}
              />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

export default CandidatePortalWorkspacePage;
