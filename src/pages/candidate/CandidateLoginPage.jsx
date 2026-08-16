import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLogo from "../../assets/OptalynxLogo";
import OptalynxLoader from "../../components/OptalynxLoader";
import candidatePortalClient from "../../api/clients/candidatePortalClient";
import {
  enforceCandidateSession,
  setCandidateSession
} from "../../utils/candidateSessionAuth";
import { normalizeEmail } from "../../utils/passwordPolicy";

const LOGIN_LOADER_VISIBLE_MS = 1000;

const waitForLoginLoaderVisibility = () =>
  new Promise((resolve) => setTimeout(resolve, LOGIN_LOADER_VISIBLE_MS));

function CandidateLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const prefilledEmail =
    typeof location.state?.email_id === "string"
      ? location.state.email_id
      : "";

  const [emailId, setEmailId] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const session = enforceCandidateSession();

    if (session.ok) {
      navigate("/candidate/workspace", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    setErrorMessage("");
  }, [emailId, password]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setErrorMessage("");

    const normalizedEmail = normalizeEmail(emailId);

    if (!normalizedEmail || !password) {
      setErrorMessage("Email and password are required");
      return;
    }

    setIsLoading(true);

    await waitForLoginLoaderVisibility();

    try {
      const response = await candidatePortalClient.login({
        email_id: normalizedEmail,
        password
      });

      const { token, account, candidate } = response.data;

      setCandidateSession(token, {
        ...account,
        candidate
      });

      navigate("/candidate/workspace", { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            boxShadow: (t) => t.tokens.shadows.mid
          }}
        >
          <Stack spacing={2.5}>
            <Stack spacing={1} alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <OptalynxLogo size={48} />
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="primary.main"
                    letterSpacing={1.5}
                  >
                    OPTALYNX
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Linking Talent with Opportunity
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                Candidate Sign In
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Access your candidate workspace
              </Typography>
            </Stack>

            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={emailId}
              onChange={(event) => setEmailId(event.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineOutlinedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                py: 1,
                "&.Mui-disabled": {
                  backgroundColor: (theme) => theme.palette.primary.main,
                  color: (theme) => theme.palette.primary.contrastText,
                  opacity: 1
                }
              }}
            >
              {isLoading ? <OptalynxLoader size={22} /> : "Sign In"}
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              New candidate?{" "}
              <Link
                component={RouterLink}
                to="/candidate/register"
                fontWeight={600}
              >
                Register
              </Link>
            </Typography>

            <Button
              variant="text"
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate("/login")}
              sx={{
                alignSelf: "flex-start",
                textTransform: "none",
                fontWeight: 600
              }}
            >
              Back to login
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default CandidateLoginPage;
