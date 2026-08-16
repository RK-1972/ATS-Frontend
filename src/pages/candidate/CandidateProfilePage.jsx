import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLoader from "../../components/OptalynxLoader";
import candidatePortalClient from "../../api/clients/candidatePortalClient";
import { buildEditableCandidate } from "../../utils/candidateProfileUtils";
import { deriveCandidatePortalProfileStatus } from "../../utils/candidatePortalStatusUtils";

const FORM_SURFACE_SX = {
  width: "100%",
  p: { xs: 2, sm: 2.5 },
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  boxShadow: (theme) => theme.tokens.shadows.mid
};

function ProfileField({ label, value }) {
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

function CandidateProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await candidatePortalClient.getProfile();

        if (active) {
          setProfileData(response.data);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.data?.message || "Unable to load your profile."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const profile = buildEditableCandidate(profileData?.profile || profileData?.candidate);
  const completion = Math.round(Number(profileData?.profile_completion || 0));
  const statusLabel = deriveCandidatePortalProfileStatus({
    candidate_status: profileData?.candidate?.candidate_status,
    portal_review_status: profileData?.intake?.review_status,
    profile_completion: profileData?.profile_completion,
    resume_path: profileData?.candidate?.resume_path
  });

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
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
              >
                <Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                    My Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View your saved professional profile.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip label={`${completion}% complete`} size="small" color="primary" variant="outlined" />
                  <Chip label={statusLabel} size="small" color="primary" />
                </Stack>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField label="First Name" value={profile.first_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField label="Last Name" value={profile.last_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField label="Email" value={profile.email} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField label="Mobile" value={profile.mobile} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField label="Current Company" value={profile.current_company} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField label="Designation" value={profile.designation} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField label="Experience" value={profile.experience} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ProfileField label="Skills" value={profile.skills} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ProfileField label="Education" value={profile.education} />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                onClick={() => navigate("/candidate/profile/complete")}
                sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
              >
                Update Profile
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

export default CandidateProfilePage;
