import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useTheme, keyframes } from "@mui/material/styles";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

import { getAvailableWorkspaces } from "@/enterprise/workspaceAvailability";
import sessionTakeoverClient from "@/api/clients/sessionTakeoverClient";
import { clearEmployeeIdleSync } from "@/utils/employeeIdleSync";
import API from "../api/axios";
import AppHeader from "../components/layout/AppHeader";
import OptalynxLoader from "../components/OptalynxLoader";

function persistLoginPayload(payload) {
  clearEmployeeIdleSync();
  localStorage.setItem("token", payload.token);
  localStorage.setItem("user", JSON.stringify(payload.user));
  localStorage.setItem(
    "work_assignments",
    JSON.stringify(payload.work_assignments || [])
  );
  localStorage.setItem(
    "work_assignment_status",
    payload.work_assignment_status || ""
  );
  localStorage.setItem(
    "workspace",
    JSON.stringify(payload.workspace || {})
  );
}

function routeAfterLogin(navigate, user, workspaceFlags) {
  const availableWorkspaces = getAvailableWorkspaces({
    user,
    workspaceFlags
  });

  if (
    user.role_name === "Recruiter"
    && user.secondary_role === "Interviewer"
  ) {
    navigate("/workspace");
  } else if (availableWorkspaces.length > 1) {
    navigate("/workspace");
  } else if (availableWorkspaces.length === 1) {
    const destination = availableWorkspaces[0].path;

    if (destination === "/interviewer") {
      localStorage.setItem("activeWorkspace", "Interviewer");
    }

    navigate(destination);
  } else if (user.role_name === "Interviewer") {
    localStorage.setItem("activeWorkspace", "Interviewer");
    navigate("/interviewer");
  } else if (user.role_name === "Recruiter") {
    navigate("/recruiter");
  } else if (
    user.role_name === "TA Lead"
    || user.role_name === "TA Leader"
    || workspaceFlags.showTaLeadWorkspace
  ) {
    navigate("/ta-lead");
  } else {
    navigate("/");
  }
}

const loginCardEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const loginWelcomeEnter = keyframes`
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const LOGIN_EASE_OUT = "cubic-bezier(0, 0, 0.2, 1)";
const LOGIN_MICRO_TRANSITION = "180ms cubic-bezier(0.4, 0, 0.2, 1)";

const loginReducedMotionSx = {
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 1,
    transform: "none"
  }
};

const loginEmployeeEnterSx = {
  animation: `${loginCardEnter} 350ms ${LOGIN_EASE_OUT} both`,
  willChange: "opacity, transform",
  ...loginReducedMotionSx
};

const loginCandidateEnterSx = {
  animation: `${loginCardEnter} 350ms ${LOGIN_EASE_OUT} 100ms both`,
  willChange: "opacity, transform",
  ...loginReducedMotionSx
};

const loginWelcomeEnterSx = {
  animation: `${loginWelcomeEnter} 450ms ${LOGIN_EASE_OUT} both`,
  transformOrigin: "left center",
  willChange: "opacity, transform",
  ...loginReducedMotionSx
};

const LOGIN_LOADER_VISIBLE_MS = 1000;

const waitForLoginLoaderVisibility = () =>
  new Promise((resolve) => setTimeout(resolve, LOGIN_LOADER_VISIBLE_MS));

const loginFieldSx = {
  "& .MuiOutlinedInput-root": {
    transition: `box-shadow ${LOGIN_MICRO_TRANSITION}, border-color ${LOGIN_MICRO_TRANSITION}`
  }
};

const loginPrimaryButtonSx = (theme) => ({
  transition: `background-color ${LOGIN_MICRO_TRANSITION}, box-shadow ${LOGIN_MICRO_TRANSITION}`,
  "&:hover": {
    boxShadow: theme.tokens.shadows.mid
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    opacity: 1
  }
});

const loginCandidateButtonSx = (theme) => ({
  transition: `background-color ${LOGIN_MICRO_TRANSITION}, border-color ${LOGIN_MICRO_TRANSITION}, box-shadow ${LOGIN_MICRO_TRANSITION}`,
  "&:hover": {
    boxShadow: theme.tokens.shadows.mid
  }
});

const loginCandidateOutlinedButtonSx = (theme) => ({
  ...loginCandidateButtonSx(theme),
  "&.Mui-disabled": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.main,
    opacity: 1
  }
});

const loginCandidateContainedButtonSx = (theme) => ({
  ...loginCandidateButtonSx(theme),
  "&.Mui-disabled": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    opacity: 1
  }
});

const COMPACT_CARD_CONTENT_SX = {
  p: 2,
  "&:last-child": { pb: 2 }
};

const COMPACT_FIELD_PROPS = {
  size: "small",
  margin: "none"
};

function LoginLeftPanel() {
  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: "100%", lg: 520 },
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: "flex-start", lg: "center" },
        minHeight: { xs: 220, lg: 420 },
        py: { xs: 1, lg: 0 }
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: { xs: "8% 0 0", lg: "0  -8%" },
          backgroundImage: "url('/images/world-map.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "contain",
          opacity: 0.14,
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          textAlign: { xs: "left", lg: "left" },
          ...loginWelcomeEnterSx
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: 28, md: 32 },
            fontWeight: 700,
            color: "primary.main",
            mb: 1.25,
            lineHeight: 1.2
          }}
        >
          Welcome to OPTALYNX
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 400,
            color: "text.primary",
            mb: 1
          }}
        >
          Enterprise Talent Acquisition Platform
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "primary.main",
            fontWeight: 600
          }}
        >
          🌐 Empowering Global Talent Acquisition Excellence
        </Typography>
      </Box>
    </Box>
  );
}

function LoginFooter() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        px: { xs: 2, md: 4 },
        py: 1.25
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="caption" color="text.secondary">
          © 2026 OPTALYNX. All rights reserved.
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Link
            href="#"
            underline="hover"
            variant="caption"
            color="primary"
            sx={{ fontWeight: 600 }}
            onClick={(event) => event.preventDefault()}
          >
            Privacy Policy
          </Link>
          <Typography variant="caption" color="text.disabled">
            |
          </Typography>
          <Link
            href="#"
            underline="hover"
            variant="caption"
            color="primary"
            sx={{ fontWeight: 600 }}
            onClick={(event) => event.preventDefault()}
          >
            Terms of Service
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}

function CandidatePortalCard({
  onSignIn,
  onRegister,
  signInLoading = false,
  registerLoading = false
}) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        boxShadow: theme.tokens.shadows.mid,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: theme.tokens.shadows.high
        },
        ...loginCandidateEnterSx
      }}
    >
      <CardContent sx={COMPACT_CARD_CONTENT_SX}>
        <Stack spacing={1.5}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Candidate Portal
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              Access your candidate workspace
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size="medium"
              startIcon={
                signInLoading ? undefined : (
                  <LoginOutlinedIcon fontSize="small" />
                )
              }
              onClick={onSignIn}
              disabled={signInLoading}
              sx={{
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                ...loginCandidateOutlinedButtonSx(theme)
              }}
            >
              {signInLoading ? <OptalynxLoader size={22} /> : "Sign In"}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="medium"
              startIcon={
                registerLoading ? undefined : (
                  <PersonAddOutlinedIcon fontSize="small" />
                )
              }
              onClick={onRegister}
              disabled={registerLoading}
              sx={{
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                ...loginCandidateContainedButtonSx(theme)
              }}
            >
              {registerLoading ? <OptalynxLoader size={22} /> : "Register"}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const prefilledEmail =
    typeof location.state?.email_id === "string"
      ? location.state.email_id
      : "";

  const [suppressPasswordAutofill] = useState(
    () => location.state?.fromPasswordReset === true
  );

  const [formData, setFormData] = useState({
    email_id: prefilledEmail,
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [takeoverPollToken, setTakeoverPollToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCandidateSignInLoading, setIsCandidateSignInLoading] = useState(false);
  const [isCandidateRegisterLoading, setIsCandidateRegisterLoading] = useState(false);
  const takeoverPollRef = useRef(null);
  const takeoverDeadlineRef = useRef(null);
  const takeoverCredentialsRef = useRef({ email_id: "", password: "" });

  const stopTakeoverPolling = (terminalMessage, asError = true) => {
    if (takeoverPollRef.current) {
      window.clearInterval(takeoverPollRef.current);
      takeoverPollRef.current = null;
    }
    setTakeoverPollToken(null);
    setIsLoading(false);
    setInfoMessage("");
    if (terminalMessage) {
      if (asError) {
        setErrorMessage(terminalMessage);
      } else {
        setInfoMessage(terminalMessage);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionEnded = params.get("session") === "ended";
    const queryMessage = params.get("message");
    const stateMessage = location.state?.sessionMessage;

    if (sessionEnded || stateMessage) {
      setInfoMessage(
        stateMessage
        || queryMessage
        || "Your session is no longer active. Sign in again."
      );
    }
  }, [location.state?.sessionMessage]);

  useEffect(() => {
    return () => {
      if (takeoverPollRef.current) {
        window.clearInterval(takeoverPollRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!takeoverPollToken) {
      return undefined;
    }

    const pollOnce = async () => {
      if (
        takeoverDeadlineRef.current
        && Date.now() > takeoverDeadlineRef.current
      ) {
        stopTakeoverPolling(
          "The approval request timed out. Try signing in again later."
        );
        return;
      }

      try {
        const pollResponse = await sessionTakeoverClient.pollStatus(takeoverPollToken);
        const status = pollResponse?.data?.status;

        if (status === "APPROVED" && pollResponse?.data?.can_complete) {
          const completed = await sessionTakeoverClient.completeLogin({
            pollToken: takeoverPollToken,
            email_id: takeoverCredentialsRef.current.email_id,
            password: takeoverCredentialsRef.current.password
          });
          stopTakeoverPolling(null);
          persistLoginPayload(completed);
          routeAfterLogin(
            navigate,
            completed.user,
            completed.workspace || {}
          );
          return;
        }

        if (status === "DENIED") {
          stopTakeoverPolling(
            pollResponse?.data?.message
            || "Sign-in was denied. Your existing session remains active."
          );
        } else if (status === "EXPIRED" || status === "CANCELLED") {
          stopTakeoverPolling(
            pollResponse?.data?.message
            || "The approval request expired. Try again later."
          );
        }
      } catch (pollError) {
        stopTakeoverPolling(
          pollError.response?.data?.message || "Unable to complete sign-in approval."
        );
      }
    };

    pollOnce();
    takeoverPollRef.current = window.setInterval(pollOnce, 2500);

    const pollWhenActive = () => {
      if (document.visibilityState === "visible") {
        pollOnce();
      }
    };

    document.addEventListener("visibilitychange", pollWhenActive);
    window.addEventListener("online", pollOnce);
    window.addEventListener("pageshow", pollWhenActive);

    return () => {
      if (takeoverPollRef.current) {
        window.clearInterval(takeoverPollRef.current);
      }
      document.removeEventListener("visibilitychange", pollWhenActive);
      window.removeEventListener("online", pollOnce);
      window.removeEventListener("pageshow", pollWhenActive);
    };
  }, [takeoverPollToken, navigate]);

  useEffect(() => {
    setFormData({
      email_id: prefilledEmail,
      password: ""
    });

    if (passwordRef.current) {
      passwordRef.current.value = "";
    }

    if (location.state?.fromPasswordReset) {
      navigate("/login", {
        replace: true,
        state: prefilledEmail
          ? { email_id: prefilledEmail }
          : undefined
      });
    }

    const focusTarget = prefilledEmail ? passwordRef : emailRef;
    focusTarget.current?.focus();

    if (!suppressPasswordAutofill) {
      return;
    }

    const timers = [0, 50, 150].map((delay) =>
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          password: ""
        }));

        if (passwordRef.current) {
          passwordRef.current.value = "";
        }
      }, delay)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    await waitForLoginLoaderVisibility();

    try {
      const response = await API.post("/login", {
        email_id: formData.email_id,
        password: formData.password
      });

      if (
        response.status === 202
        || response.data?.code === "SESSION_TAKEOVER_PENDING"
      ) {
        const pollToken = response.data?.data?.poll_token;
        if (!pollToken) {
          throw new Error("Missing takeover poll token");
        }
        takeoverCredentialsRef.current = {
          email_id: formData.email_id,
          password: formData.password
        };
        const expiresAt = response.data?.data?.expires_at;
        takeoverDeadlineRef.current = expiresAt
          ? new Date(expiresAt).getTime() + 5000
          : Date.now() + 125000;
        setTakeoverPollToken(pollToken);
        setInfoMessage(
          response.data?.message
          || "Waiting for approval on your active session…"
        );
        return;
      }

      if (response.data?.code === "SESSION_TAKEOVER_COMPLETE_REQUIRED") {
        setIsLoading(false);
        setErrorMessage(
          response.data?.message
          || "Complete the approved sign-in on the requesting device, or wait and try again."
        );
        return;
      }

      if (!response.data?.token) {
        setIsLoading(false);
        setErrorMessage("Login did not return a session. Try again.");
        return;
      }

      persistLoginPayload(response.data);
      setIsLoading(false);
      routeAfterLogin(
        navigate,
        response.data.user,
        response.data.workspace || {}
      );
    } catch (error) {
      setIsLoading(false);
      console.log(error);

      if (error.response?.data?.code === "SESSION_TAKEOVER_COMPLETE_REQUIRED") {
        setErrorMessage(
          error.response?.data?.message
          || "Complete the approved sign-in on the requesting device, or wait and try again."
        );
        return;
      }

      setErrorMessage(
        error.response?.data?.message || "Login Failed"
      );
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email_id) {
      alert("Please enter your email address first.");
      return;
    }

    const confirmed = window.confirm(
      "A password reset link will be sent to your registered email.\n\nDo you want to proceed?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await API.post("/forgot-password", {
        email_id: formData.email_id
      });

      alert(response.data.message);
    } catch (error) {
      alert(
        error?.response?.data?.message || "Unable to process request."
      );
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isLoading) {
      handleLogin();
    }
  };

  const handleCandidateSignIn = async () => {
    if (isCandidateSignInLoading) {
      return;
    }

    setIsCandidateSignInLoading(true);
    await waitForLoginLoaderVisibility();
    navigate("/candidate/login");
  };

  const handleCandidateRegister = async () => {
    if (isCandidateRegisterLoading) {
      return;
    }

    setIsCandidateRegisterLoading(true);
    await waitForLoginLoaderVisibility();
    navigate("/candidate/register");
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        fontFamily: theme.typography.fontFamily,
        overflow: "hidden"
      }}
    >
      <AppHeader showUserActions={false} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 2, lg: 2.5 },
          pb: { xs: 2, lg: 2 },
          overflow: { xs: "auto", lg: "hidden" }
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "center",
            gap: { xs: 3, lg: 6 },
            width: "100%",
            maxWidth: 1180,
            my: "auto"
          }}
        >
          <LoginLeftPanel />

          <Stack
            spacing={1.5}
            sx={{
              width: { xs: "100%", lg: 440 },
              maxWidth: 460,
              flexShrink: 0
            }}
          >
            <Card
              component="form"
              onSubmit={handleSubmit}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
                borderTop: 4,
                borderTopColor: "secondary.main",
                boxShadow: theme.tokens.shadows.high,
                transition: "box-shadow 0.2s ease",
                ...loginEmployeeEnterSx
              }}
            >
              <CardContent sx={COMPACT_CARD_CONTENT_SX}>
                <Stack spacing={1.25}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      Employee Login
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.25 }}
                    >
                      Sign in to access your workspace
                    </Typography>
                  </Box>

                  <TextField
                    inputRef={emailRef}
                    fullWidth
                    name="email_id"
                    label="Email"
                    placeholder="Email"
                    value={formData.email_id}
                    onChange={handleChange}
                    autoComplete="username"
                    {...COMPACT_FIELD_PROPS}
                    sx={loginFieldSx}
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

                  <TextField
                    inputRef={passwordRef}
                    fullWidth
                    key={
                      suppressPasswordAutofill
                        ? "post-reset-login"
                        : "login-password"
                    }
                    name="password"
                    label="Password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={
                      suppressPasswordAutofill
                        ? "new-password"
                        : "current-password"
                    }
                    {...COMPACT_FIELD_PROPS}
                    sx={loginFieldSx}
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
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              edge="end"
                              size="small"
                              onClick={() => setShowPassword((prev) => !prev)}
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

                  {infoMessage ? (
                    <Alert severity="info" sx={{ mb: 1 }}>
                      {infoMessage}
                    </Alert>
                  ) : null}
                  {errorMessage ? (
                    <Typography
                      variant="caption"
                      color="error.main"
                      textAlign="center"
                      sx={{ lineHeight: 1.3 }}
                    >
                      {errorMessage}
                    </Typography>
                  ) : null}

                  <Box sx={{ textAlign: "right", mt: -0.25 }}>
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      variant="caption"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="medium"
                    disabled={isLoading}
                    sx={{
                      py: 0.875,
                      mt: 0.25,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      ...loginPrimaryButtonSx(theme)
                    }}
                  >
                    {isLoading ? <OptalynxLoader size={22} /> : "Login"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <CandidatePortalCard
              signInLoading={isCandidateSignInLoading}
              registerLoading={isCandidateRegisterLoading}
              onSignIn={handleCandidateSignIn}
              onRegister={handleCandidateRegister}
            />
          </Stack>
        </Box>
      </Box>

      <LoginFooter />
    </Box>
  );
}

export default LoginPage;
