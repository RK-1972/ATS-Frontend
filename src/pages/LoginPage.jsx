import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({

    email_id: "",
    password: ""

  });

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


  return (

    <div style={styles.page}>

      <div style={styles.loginBox}>

        <div style={styles.title}>
          ATS Login
        </div>

        <input

          type="text"

          name="email_id"

          placeholder="Email"

          value={formData.email_id}

          onChange={handleChange}

          style={styles.input}

        />

        <input

          type="password"

          name="password"

          placeholder="Password"

          value={formData.password}

          onChange={handleChange}

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
  <a
    href="/forgot-password"
    style={{
      color: "#2563eb",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer"
    }}
  >
    Forgot Password?
  </a>
</div>
        <button

          style={styles.button}

          onClick={handleLogin}

        >

          Login

        </button>

      </div>

    </div>

  );

}


const styles = {

  page: {

    height: "100vh",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    background: "#f4f6f9",

    fontFamily: "Segoe UI"

  },

  loginBox: {

    width: "400px",

    background: "white",

    padding: "40px",

    borderRadius: "12px",

    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",

    display: "flex",

    flexDirection: "column",

    gap: "20px"

  },

  title: {

    fontSize: "30px",

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