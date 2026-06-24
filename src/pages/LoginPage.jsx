import OptalynxLoader
from "../components/OptalynxLoader";
import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function LoginPage() {

  const navigate = useNavigate();

 const [formData, setFormData] = useState({

  email_id: "",
  password: ""

});

useEffect(() => {

  setFormData({

    email_id: "",
    password: ""

  });

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


      const user =
  response.data.user;

if (

  user.role_name === "Recruiter"

  &&

  user.secondary_role === "Interviewer"

) {
  setIsLoading(false);
  navigate("/workspace");

}

else if (

  user.role_name === "Interviewer"

) {

  localStorage.setItem(
    "activeWorkspace",
    "Interviewer"
  );
  setIsLoading(false);
  navigate("/interviewer");

}

else {

      setIsLoading(false);
      navigate("/");

}}

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
<Header />
  
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
        type="text"
        name="email_id"
        placeholder="Email"
        value={formData.email_id}
        onChange={handleChange}
        autoComplete="username"
        style={styles.input}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        autoComplete="current-password"
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
      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "12px",
          color: "#9ca3af"
        }}
      >
        Powered by IGS Engineering Quality 
      </div>

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