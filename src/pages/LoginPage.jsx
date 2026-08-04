import OptalynxLoader
from "../components/OptalynxLoader";
import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";

function LoginPage() {

  const navigate = useNavigate();
  const location = useLocation();
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

  const focusTarget = prefilledEmail
    ? passwordRef
    : emailRef;

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
  

  const [errorMessage, setErrorMessage] =
    useState("");
  
  const [isLoading, setIsLoading] =
  useState(false);


  // =========================================
  // Handle Change
  // =========================================

  const handleChange = (e) => {

    setFormData({

      ...formData,
      [e.target.name]: e.target.value

    });

  };


 // =========================================
// Login
// =========================================

const handleLogin = async () => {

   setIsLoading(true);

  await new Promise(
    resolve => setTimeout(resolve, 1000)
  );

  try {

    const response = await API.post(

      "/login",

      {

        email_id: formData.email_id,
        password: formData.password

      }

    );

    // =====================================
    // Store Token
    // =====================================

      localStorage.setItem(

        "token",
        response.data.token

      );

      localStorage.setItem(

        "user",
        JSON.stringify(response.data.user)

      );

      localStorage.setItem(
        "work_assignments",
        JSON.stringify(response.data.work_assignments || [])
      );

      localStorage.setItem(
        "work_assignment_status",
        response.data.work_assignment_status || ""
      );

      localStorage.setItem(
        "workspace",
        JSON.stringify(response.data.workspace || {})
      );


      const user =
  response.data.user;

      const workspaceFlags = response.data.workspace || {};

      const availableWorkspaces = [
        {
          enabled: Boolean(workspaceFlags.showRecruitmentWorkspace),
          path: "/recruiter"
        },
        {
          enabled: Boolean(workspaceFlags.showInterviewWorkspace),
          path: "/interviewer"
        },
        {
          enabled: Boolean(workspaceFlags.showApprovalWorkspace),
          path: "/my-approvals"
        },
        {
          enabled: Boolean(workspaceFlags.showRequestWorkspace),
          path: "/workforce-planning/catalogue"
        },
        {
          enabled: Boolean(workspaceFlags.showOfferWorkspace),
          path: "/offers"
        }
      ].filter((item) => item.enabled);

      setIsLoading(false);

      // STEP 1 — original Recruiter + Interviewer behaviour (unchanged)
      if (
        user.role_name === "Recruiter" &&
        user.secondary_role === "Interviewer"
      ) {
        navigate("/workspace");
      } else if (availableWorkspaces.length > 1) {
        // STEP 2 — multiple enterprise workspaces → picker
        navigate("/workspace");
      } else if (availableWorkspaces.length === 1) {
        // STEP 2 — single enterprise workspace → direct landing
        const destination = availableWorkspaces[0].path;

        if (destination === "/interviewer") {
          localStorage.setItem("activeWorkspace", "Interviewer");
        }

        navigate(destination);
      } else if (user.role_name === "Interviewer") {
        // STEP 3 — no enterprise flags: original Interviewer fallback
        localStorage.setItem("activeWorkspace", "Interviewer");
        navigate("/interviewer");
      } else if (user.role_name === "Recruiter") {
        // STEP 3 — original Recruiter-only fallback
        navigate("/recruiter");
      } else {
        // STEP 3 — original Admin / default fallback
        navigate("/");
      }

    }

    catch (error) {
      setIsLoading(false);
      console.log(error);

      setErrorMessage(

        error.response?.data?.message ||

        "Login Failed"

      );

    }

  };
// =========================================
// Forgot Password
// =========================================

const handleForgotPassword =
  async () => {

    if (!formData.email_id) {

      alert(
        "Please enter your email address first."
      );

      return;

    }

    const confirmed =
      window.confirm(

        "A password reset link will be sent to your registered email.\n\nDo you want to proceed?"

      );

    if (!confirmed) {

      return;

    }

    try {

      const response =
        await API.post(

          "/forgot-password",

          {

            email_id:
              formData.email_id

          }

        );

      alert(
        response.data.message
      );

    }

    catch (error) {

      alert(

        error?.response?.data?.message ||

        "Unable to process request."

      );

    }

  };

return (

<div
  style={{
    minHeight: "100vh",
    background: "#f4f6f9",
    fontFamily: "Segoe UI"
  }}
>
<AppHeader showUserActions={false} />

  {/* BODY */}

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "70px",
      padding: "15px 60px"
    }}
  >

    {/* LEFT PANEL */}

<div
  style={{
    width: "520px",
    position: "relative",
    minHeight: "500px"
  }}
>

  {/* WORLD MAP WATERMARK */}

  <div
    style={{
      position: "absolute",
      top: "-20px",
      left: "-30px",
      right: "-30px",
      bottom: "0",

      backgroundImage:
        "url('/images/world-map.png')",

      backgroundRepeat:
        "no-repeat",

      backgroundPosition:
        "center 120px",

      backgroundSize:
        "100%",

      opacity: 0.10,

      pointerEvents: "none",

      zIndex: 0
    }}
  />

  {/* CONTENT */}

  <div
    style={{
      position: "relative",
      zIndex: 1
    }}
  >

    <div
      style={{
        fontSize: "32px",
        fontWeight: "700",
        color: "#1f3b63",
        marginBottom: "15px"
      }}
    >
      Welcome to OPTALYNX
    </div>

    <div
      style={{
        fontSize: "18px",
        color: "#374151",
        marginBottom: "10px"
      }}
    >
      Enterprise Talent Acquisition Platform
    </div>

    <div
      style={{
        color: "#1f3b63",
        fontSize: "15px",
        fontWeight: "600",
        marginBottom: "30px"
      }}
    >
      🌐 Empowering Global Talent Acquisition Excellence
    </div>

    <div
      style={{
        fontSize: "16px",
        color: "#5b6473",
        lineHeight: "38px",
        fontWeight: "500"
      }}
    >

      👤 Candidate Management <br />

      🎯 Interview Panel Management <br />

      📅 Interview Schedule Management <br />

      📝 Feedback & Assessment <br />

      👥 User Management <br />

      🔐 Role Based Access Control <br />

      ☁️ Cloud Ready Architecture

    </div>

    

  </div>

</div>

    {/* LOGIN CARD */}

    <div style={styles.loginBox}>

      <div style={styles.title}>
        Access Your Workspace
      </div>

      <div
        style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px",
          marginTop: "-10px",
          marginBottom: "15px"
        }}
      >
        Sign in to continue to OPTALYNX
      </div>

      <input
        ref={emailRef}
        type="text"
        name="email_id"
        placeholder="Email"
        value={formData.email_id}
        onChange={handleChange}
        autoComplete="username"
        style={styles.input}
      />

      <input
        ref={passwordRef}
        key={suppressPasswordAutofill ? "post-reset-login" : "login-password"}
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        autoComplete={
          suppressPasswordAutofill
            ? "new-password"
            : "current-password"
        }
        style={styles.input}
      />

      {

        errorMessage && (

          <div style={styles.error}>
            {errorMessage}
          </div>

        )

      }

      <div
        style={{
          textAlign: "right",
          marginTop: "10px",
          marginBottom: "15px"
        }}
      >

        <span

          onClick={
            handleForgotPassword
          }

          style={{

            color: "#2563eb",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer"

          }}

        >

          Forgot Password?

        </span>

      </div>

      <button

  style={styles.button}

  onClick={handleLogin}

  disabled={isLoading}

>

  {

    isLoading

      ? <OptalynxLoader size={29} />

      : "Login"

  }

</button>

    </div>

  </div>

</div>

);

}


const styles = {

  loginBox: {

    width: "450px",

    background: "#ffffff",

    padding: "25px",

    borderRadius: "20px",

    borderTop: "5px solid #f59e0b",

    boxShadow:
      "0 8px 25px rgba(0,0,0,0.08)",

    display: "flex",

    flexDirection: "column",

    gap: "12px"

  },

  title: {

    fontSize: "24px",

    fontWeight: "600",

    textAlign: "center",

    color: "#1f2937"

  },

  input: {

    padding: "10px",

    borderRadius: "8px",

    border: "1px solid #d1d5db",

    fontSize: "15px"

  },

  button: {

    padding: "10px",

    borderRadius: "8px",

    border: "none",

    background: "#1f3b63",

    color: "#ffffff",

    fontSize: "16px",

    fontWeight: "600",

    cursor: "pointer"

  },

  error: {

    color: "#dc2626",

    textAlign: "center",

    fontSize: "14px"

  }

};

export default LoginPage;