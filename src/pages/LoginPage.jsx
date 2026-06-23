import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

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

  navigate("/workspace");

}

else if (

  user.role_name === "Interviewer"

) {

  localStorage.setItem(
    "activeWorkspace",
    "Interviewer"
  );

  navigate("/interviewer");

}

else {

      navigate("/");

}}

    catch (error) {

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

    {/* Header */}

    <div
      style={{
        background: "#1f3b63",
        height: "110px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 50px",
        color: "white"
      }}
    >

      <div>

        <div
          style={{
            fontSize: "48px",
            fontWeight: "700",
            lineHeight: "45px"
          }}
        >
          IGS
        </div>

        <div
          style={{
            color: "#f59e0b",
            fontSize: "14px"
          }}
        >
          ENGINEERING QUALITY
        </div>

      </div>

      <div
  style={{
    textAlign: "right"
  }}
>

  <div
    style={{
      fontSize: "34px",
      fontWeight: "700",
      letterSpacing: "2px"
    }}
  >
    OPTALYNX
  </div>

  <div
    style={{
      fontSize: "13px",
      marginTop: "5px",
      color: "#dbeafe"
    }}
  >
   Linking Talent with Opportunity
  </div>

</div>
    </div>

    {/* Login Card */}

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: "80px"
      }}
    >

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
    marginBottom: "10px"
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
        autoComplete="off"
        style={styles.input}
      />

              <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        autoComplete="new-password"
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

            onClick={handleForgotPassword}

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

        >

          Login

        </button>

      </div>

    </div>

  </div>

);

}


const styles = {

  page: {

  minHeight: "calc(100vh - 120px)",

  display: "flex",

  justifyContent: "center",

  alignItems: "flex-start",

  paddingTop: "60px",

  background: "#f4f6f9",

  fontFamily: "Segoe UI"

},

  loginBox: {

  width: "520px",

  background: "#ffffff",

  padding: "40px",

  borderRadius: "20px",

  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",

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

    padding: "14px",

    borderRadius: "8px",

    border: "1px solid #ccc",

    fontSize: "15px"

  },

  button: {

    padding: "14px",

    borderRadius: "8px",

    border: "none",

    background: "#1f3b63",

    color: "white",

    fontSize: "16px",

    cursor: "pointer"

  },

  error: {

    color: "red",

    fontSize: "14px",

    textAlign: "center"

  }

};

export default LoginPage;