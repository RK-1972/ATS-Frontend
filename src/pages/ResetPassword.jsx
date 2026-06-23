import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import API from "../api/axios";
import Header from "../components/Header";

function ResetPassword() {

  const { token } = useParams();

  const navigate = useNavigate();

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [passwordStrength, setPasswordStrength] =
    useState("Weak");

  // =========================================
  // Password Rules
  // =========================================

  const validations = {

    length:
      newPassword.length >= 8,

    uppercase:
      /[A-Z]/.test(newPassword),

    lowercase:
      /[a-z]/.test(newPassword),

    number:
      /\d/.test(newPassword),

    special:
      /[@$!%*?&]/.test(newPassword)

  };

  // =========================================
  // Password Strength
  // =========================================

  useEffect(() => {

    let score = 0;

    Object.values(validations).forEach(

      (item) => {

        if (item) score++;

      }

    );

    if (score <= 2) {

      setPasswordStrength("Weak");

    }

    else if (score <= 4) {

      setPasswordStrength("Medium");

    }

    else {

      setPasswordStrength("Strong");

    }

  }, [newPassword]);

  // =========================================
  // Reset Password
  // =========================================

  const handleResetPassword =
    async () => {

      setErrorMessage("");

      if (

        newPassword !==
        confirmPassword

      ) {

        setErrorMessage(

          "Passwords do not match"

        );

        return;

      }

      const allValid =

        Object.values(
          validations
        ).every(Boolean);

      if (!allValid) {

        setErrorMessage(

          "Password does not meet security requirements"

        );

        return;

      }

      try {

        setLoading(true);

        const response =
          await API.post(

            "/reset-password",

            {

              token,

              new_password:
                newPassword

            }

          );

        setSuccessMessage(

          response.data.message

        );

        setTimeout(() => {

          navigate("/login");

        }, 3000);

      }

      catch (error) {

        setErrorMessage(

          error.response?.data?.message ||

          "Password Reset Failed"

        );

      }

      finally {

        setLoading(false);

      }

    };

  // =========================================
  // Strength Bar
  // =========================================

  const strengthColor =

    passwordStrength === "Weak"

      ? "#dc2626"

      : passwordStrength === "Medium"

      ? "#d97706"

      : "#16a34a";

  const strengthWidth =

    passwordStrength === "Weak"

      ? "33%"

      : passwordStrength === "Medium"

      ? "66%"

      : "100%";

  // =========================================
// Success Screen
// =========================================

if (successMessage) {

  return (

    <div style={styles.page}>

      <Header />

      <div style={styles.content}>

        <div style={styles.successCard}>

          <FaCheckCircle
            size={70}
            color="#16a34a"
          />

          <div style={styles.successTitle}>

            Password Updated Successfully

          </div>

          <div style={styles.successText}>

            Redirecting to Login...

          </div>

        </div>

      </div>

    </div>

  );

}

// =========================================
// Main Screen
// =========================================

return (

  <div style={styles.page}>

    <Header />

    {/* CONTENT */}

    <div style={styles.content}>

      <div style={styles.content}>

        <div style={styles.card}>

          <div style={styles.title}>
            Reset Password
          </div>

          <div style={styles.subtitle}>

            Create a strong password
            for your OPTALYNX account

          </div>

          {/* PASSWORD */}

          <div style={styles.fieldContainer}>

            <input

              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="New Password"

              value={newPassword}

              onChange={(e) =>

                setNewPassword(
                  e.target.value
                )

              }

              style={styles.input}

            />

            <span

              style={styles.eyeIcon}

              onClick={() =>

                setShowPassword(
                  !showPassword
                )

              }

            >

              {

                showPassword

                  ?

                  <FaEyeSlash />

                  :

                  <FaEye />

              }

            </span>

          </div>

          {/* CONFIRM PASSWORD */}

          <div style={styles.fieldContainer}>

            <input

              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }

              placeholder="Confirm Password"

              value={confirmPassword}

              onChange={(e) =>

                setConfirmPassword(
                  e.target.value
                )

              }

              style={styles.input}

            />

            <span

              style={styles.eyeIcon}

              onClick={() =>

                setShowConfirmPassword(
                  !showConfirmPassword
                )

              }

            >

              {

                showConfirmPassword

                  ?

                  <FaEyeSlash />

                  :

                  <FaEye />

              }

            </span>

          </div>

          {/* RULES */}

          <div style={styles.rulesBox}>

            <div style={styles.rule}>
              {validations.length ? "✓" : "○"} Minimum 8 Characters
            </div>

            <div style={styles.rule}>
              {validations.uppercase ? "✓" : "○"} Uppercase Letter
            </div>

            <div style={styles.rule}>
              {validations.lowercase ? "✓" : "○"} Lowercase Letter
            </div>

            <div style={styles.rule}>
              {validations.number ? "✓" : "○"} Number
            </div>

            <div style={styles.rule}>
              {validations.special ? "✓" : "○"} Special Character
            </div>

          </div>

          {/* STRENGTH */}

          <div style={styles.strengthLabel}>

            Password Strength:
            {" "}
            <strong>
              {passwordStrength}
            </strong>

          </div>

          <div style={styles.strengthBar}>

            <div

              style={{

                ...styles.strengthFill,

                width:
                  strengthWidth,

                background:
                  strengthColor

              }}

            />

          </div>

          {

            errorMessage && (

              <div style={styles.error}>

                {errorMessage}

              </div>

            )

          }

          <button

            style={styles.button}

            onClick={
              handleResetPassword
            }

            disabled={loading}

          >

            {

              loading

                ?

                "Processing..."

                :

                "Reset Password"

            }

          </button>

        </div>

      </div>

    </div>
  
  </div>

  );

}

const styles = {

  page: {

    minHeight: "100vh",

    background: "#f4f6f9",

    fontFamily:
      "Segoe UI, sans-serif"

  },

  header: {

    height: "80px",

    background: "#1f3b63",

    color: "white",

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    padding: "0 30px",

    boxShadow:
      "0 2px 8px rgba(0,0,0,0.15)"

  },

  logo: {

    fontSize: "28px",

    fontWeight: "bold"

  },

  tagline: {

    fontSize: "11px",

    color: "#f39c12"

  },

  headerTitle: {

    fontSize: "26px",

    fontWeight: "600",

    letterSpacing: "2px"

  },

  content: {

  display: "flex",

  justifyContent: "center",

  alignItems: "flex-start",

  paddingTop: "20px",

  minHeight:
    "calc(100vh - 80px)"

},

  card: {

  width: "480px",

  background: "white",

  borderRadius: "14px",

  padding: "20px",

  boxShadow:
    "0 4px 12px rgba(0,0,0,0.10)"

},

  title: {

  fontSize: "24px",

  fontWeight: "600",

  textAlign: "center",

  color: "#1f2937"

},

  subtitle: {

  textAlign: "center",

  color: "#6b7280",

  marginTop: "6px",

  marginBottom: "12px",

  fontSize: "15px"

},

  fieldContainer: {

  position: "relative",

  marginBottom: "12px"

},

  input: {

  width: "100%",

  padding: "10px 14px",

  borderRadius: "8px",

  border: "1px solid #d1d5db",

  fontSize: "15px",

  boxSizing: "border-box"

},

  eyeIcon: {

  position: "absolute",

  right: "15px",

  top: "12px",

  cursor: "pointer",

  color: "#6b7280"

},

  rulesBox: {

  background: "#f8fafc",

  borderRadius: "10px",

  padding: "8px 15px",

  marginBottom: "10px"

},

  rule: {

  marginBottom: "2px",

  fontSize: "13px",

  lineHeight: "18px"

},
  strengthLabel: {

  marginBottom: "6px",

  fontSize: "13px"

},

  strengthBar: {

  height: "8px",

  background: "#e5e7eb",

  borderRadius: "10px",

  overflow: "hidden",

  marginBottom: "15px"

},

  strengthFill: {

    height: "100%",

    transition: "0.3s"
  },

 button: {

  width: "100%",

  padding: "12px",

  border: "none",

  borderRadius: "8px",

  background: "#1f3b63",

  color: "white",

  fontSize: "15px",

  cursor: "pointer",

  fontWeight: "600"

},

  error: {

    color: "#dc2626",

    marginBottom: "15px",

    textAlign: "center"

  },

  successCard: {

  width: "450px",

  background: "white",

  padding: "35px",

  borderRadius: "14px",

  textAlign: "center",

  boxShadow:
    "0 4px 12px rgba(0,0,0,0.10)"

},

  successTitle: {

    marginTop: "20px",

    fontSize: "24px",

    fontWeight: "600"

  },

  successText: {

    marginTop: "10px",

    color: "#6b7280"
  }

};

export default ResetPassword;
