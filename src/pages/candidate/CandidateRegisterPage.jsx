import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLoader from "../../components/OptalynxLoader";
import candidatePortalClient from "../../api/clients/candidatePortalClient";
import {
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  isPasswordStrong,
  isValidMobile,
  normalizeEmail,
  normalizeMobile
} from "../../utils/passwordPolicy";

const COMPACT_FIELD_PROPS = {
  size: "small",
  margin: "none"
};

const compactFieldSx = {
  "& .MuiOutlinedInput-root": {
    transition:
      "box-shadow 180ms cubic-bezier(0.4, 0, 0.2, 1), border-color 180ms cubic-bezier(0.4, 0, 0.2, 1)"
  }
};

const FORM_SURFACE_SX = {
  width: "100%",
  maxWidth: 560,
  mx: "auto",
  p: { xs: 2, sm: 2.5 },
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  boxShadow: (theme) => theme.tokens.shadows.mid
};

const LOGIN_LOADER_VISIBLE_MS = 1000;

const waitForLoginLoaderVisibility = () =>
  new Promise((resolve) => setTimeout(resolve, LOGIN_LOADER_VISIBLE_MS));

function CandidateRegisterPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  const passwordStrength = useMemo(
    () => getPasswordStrengthLabel(password),
    [password]
  );

  useEffect(() => {
    setErrorMessage("");
  }, [fullName, mobileNumber, emailId, password, confirmPassword]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setErrorMessage("");

    const trimmedName = fullName.trim();
    const normalizedMobile = normalizeMobile(mobileNumber);
    const normalizedEmail = normalizeEmail(emailId);

    if (!trimmedName) {
      setErrorMessage("Full name is required");
      return;
    }

    if (!normalizedMobile) {
      setErrorMessage("Mobile number is required");
      return;
    }

    if (!isValidMobile(normalizedMobile)) {
      setErrorMessage("Enter a valid mobile number");
      return;
    }

    if (!normalizedEmail) {
      setErrorMessage("Email is required");
      return;
    }

    if (!isPasswordStrong(password)) {
      setErrorMessage("Password does not meet security requirements");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);

    await waitForLoginLoaderVisibility();

    try {
      const response = await candidatePortalClient.register({
        full_name: trimmedName,
        mobile_number: normalizedMobile,
        email_id: normalizedEmail,
        password,
        confirm_password: confirmPassword
      });

      setSuccessEmail(response.data?.email_id || normalizedEmail);
    } catch (error) {
      const apiMessage = error.response?.data?.message;

      if (typeof apiMessage === "string" && apiMessage.trim()) {
        setErrorMessage(apiMessage);
      } else if (error.response?.status === 404) {
        setErrorMessage(
          "Registration service is unavailable. Please ensure the backend server is running with the latest code and try again."
        );
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (successEmail) {
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

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            px: 2,
            py: { xs: 2, sm: 3 }
          }}
        >
          <Paper elevation={0} sx={FORM_SURFACE_SX}>
            <Stack spacing={1.5} alignItems="flex-start">
              <CheckCircleOutlineOutlinedIcon
                color="success"
                sx={{ fontSize: 32 }}
              />
              <Typography
                sx={{ fontSize: 22, fontWeight: 700, color: "primary.main" }}
              >
                Account created successfully
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A welcome email has been sent to:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {successEmail}
              </Typography>
              <Button
                variant="contained"
                size="medium"
                onClick={() =>
                  navigate("/candidate/login", {
                    state: { email_id: successEmail }
                  })
                }
                sx={{ textTransform: "none", fontWeight: 600, mt: 0.5 }}
              >
                Sign In
              </Button>
            </Stack>
          </Paper>
        </Box>
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

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          px: 2,
          py: { xs: 2, sm: 3 }
        }}
      >
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={FORM_SURFACE_SX}
        >
          <Stack spacing={1.25}>
            <Box>
              <Typography
                sx={{ fontSize: 22, fontWeight: 700, color: "text.primary" }}
              >
                Create your Candidate Account
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, lineHeight: 1.45, fontSize: 13.5 }}
              >
                Create your Optalynx candidate account to build and manage your
                professional profile.
              </Typography>
            </Box>

            {errorMessage ? (
              <Alert severity="error" sx={{ py: 0.25 }}>
                {errorMessage}
              </Alert>
            ) : null}

            <TextField
              fullWidth
              label="Full Name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              {...COMPACT_FIELD_PROPS}
              sx={compactFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                    </InputAdornment>
                  )
                }
              }}
            />

            <TextField
              fullWidth
              label="Mobile Number"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value)}
              required
              {...COMPACT_FIELD_PROPS}
              sx={compactFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                    </InputAdornment>
                  )
                }
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={emailId}
              onChange={(event) => setEmailId(event.target.value)}
              required
              {...COMPACT_FIELD_PROPS}
              sx={compactFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineOutlinedIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                    </InputAdornment>
                  )
                }
              }}
            />

            <Stack spacing={0.5}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                {...COMPACT_FIELD_PROPS}
                sx={compactFieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          size="small"
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
                  }
                }}
              />
              {password ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: getPasswordStrengthColor(passwordStrength, theme),
                    fontWeight: 600,
                    pl: 0.25
                  }}
                >
                  Password strength: {passwordStrength}
                </Typography>
              ) : null}
            </Stack>

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              {...COMPACT_FIELD_PROPS}
              sx={compactFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffOutlinedIcon fontSize="small" />
                        ) : (
                          <VisibilityOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="medium"
              disabled={isLoading}
              sx={{
                mt: 0.5,
                py: 0.875,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: (t) => t.tokens.shadows.mid,
                "&.Mui-disabled": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  opacity: 1
                }
              }}
            >
              {isLoading ? <OptalynxLoader size={22} /> : "Register"}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ fontSize: 13.5, pt: 0.25 }}
            >
              Already have an account?{" "}
              <Link component={RouterLink} to="/candidate/login" fontWeight={600}>
                Sign In
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default CandidateRegisterPage;
