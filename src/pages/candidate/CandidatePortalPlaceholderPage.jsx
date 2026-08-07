import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import AppHeader from "../../components/layout/AppHeader";

const portalCopy = {
  login: {
    title: "Candidate Sign In",
    subtitle: "Access your candidate workspace"
  },
  activate: {
    title: "Activate Account",
    subtitle: "Set up your candidate workspace"
  }
};

function CandidatePortalPlaceholderPage({ mode = "login" }) {
  const navigate = useNavigate();
  const copy = portalCopy[mode] || portalCopy.login;

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

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          py: 4
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            boxShadow: (theme) => theme.tokens.shadows.mid
          }}
        >
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {copy.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {copy.subtitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The candidate portal is coming soon. Please check back later or
              contact your recruiter for assistance.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate("/login")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Back to login
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default CandidatePortalPlaceholderPage;
