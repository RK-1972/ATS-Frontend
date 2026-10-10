import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import API from "../api/axios";

import Header from "../components/Header";
import RecruiterNavRail from "../components/layout/RecruiterNavRail";

function FeedbackViewShell({ loggedInUser, isMobileLayout, children }) {
  const mainPadding = isMobileLayout ? "12px" : "40px";
  const contentPadding = isMobileLayout ? "16px" : "30px";
  const shellContext = { contentPadding, isMobileLayout };

  return (
    <div>
      <Header
        userName={localStorage.getItem("full_name")}
        roleName={localStorage.getItem("role_name")}
      />

      <div style={{ display: "flex", minWidth: 0 }}>
        <Box sx={{ display: { xs: "none", md: "flex" }, flexShrink: 0 }}>
          <RecruiterNavRail loggedInUser={loggedInUser} />
        </Box>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: "100%",
            padding: mainPadding,
            boxSizing: "border-box",
            overflowX: "hidden"
          }}
        >
          <div
            style={{
              ...(isMobileLayout ? styles.mobileScrollContent : null)
            }}
          >
            {typeof children === "function" ? children(shellContext) : children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewFeedback() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobileLayout = useMediaQuery(theme.breakpoints.down("md"));

  const { scheduleId } = useParams();

  const [header, setHeader] = useState(null);

  const [details, setDetails] = useState([]);

  const [loading, setLoading] = useState(true);

  const [statusMessage, setStatusMessage] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    setStatusMessage("");

    try {
      const response = await API.get(`/feedback/${scheduleId}`);

      if (response.data.feedbackExists) {
        setHeader(response.data.header);

        setDetails(response.data.details || []);
      } else {
        setHeader(null);
        setDetails([]);
        setStatusMessage("No feedback found for this interview.");
      }
    } catch (error) {
      console.log(error);

      setHeader(null);
      setDetails([]);
      setStatusMessage(
        error?.response?.data?.message || "Unable to load feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const starSize = isMobileLayout ? "24px" : "28px";

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              fontSize: starSize,
              color: star <= rating ? "#f59e0b" : "#d1d5db"
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderSkillAssessment = () => {
    if (isMobileLayout) {
      return (
        <div style={styles.mobileSkillList}>
          {details.map((row) => (
            <div key={row.detail_id} style={styles.mobileSkillCard}>
              <div style={styles.label}>Skill</div>
              <div style={styles.mobileSkillValue}>{row.skill_name}</div>
              <div style={{ ...styles.label, marginTop: "12px" }}>Rating</div>
              {renderStars(row.rating)}
              <div style={{ ...styles.label, marginTop: "12px" }}>Comments</div>
              <div style={styles.mobileCommentText}>{row.comments || "—"}</div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr
            style={{
              background: "#f8fafc"
            }}
          >
            <th
              style={{
                textAlign: "left",
                padding: "12px",
                width: "20%"
              }}
            >
              Skill
            </th>

            <th
              style={{
                textAlign: "left",
                padding: "12px",
                width: "25%"
              }}
            >
              Rating
            </th>

            <th
              style={{
                textAlign: "left",
                padding: "12px",
                width: "55%"
              }}
            >
              Comments
            </th>
          </tr>
        </thead>

        <tbody>
          {details.map((row) => (
            <tr key={row.detail_id}>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb"
                }}
              >
                {row.skill_name}
              </td>

              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb"
                }}
              >
                {renderStars(row.rating)}
              </td>

              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb"
                }}
              >
                {row.comments}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <FeedbackViewShell loggedInUser={loggedInUser} isMobileLayout={isMobileLayout}>
        Loading...
      </FeedbackViewShell>
    );
  }

  if (!header) {
    return (
      <FeedbackViewShell loggedInUser={loggedInUser} isMobileLayout={isMobileLayout}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...styles.backButton,
            ...(isMobileLayout ? styles.backButtonMobile : null)
          }}
        >
          ← Back
        </button>
        <div style={{ color: "#64748b", fontWeight: 600 }}>
          {statusMessage || "No feedback found for this interview."}
        </div>
      </FeedbackViewShell>
    );
  }

  return (
    <FeedbackViewShell loggedInUser={loggedInUser} isMobileLayout={isMobileLayout}>
      {({ contentPadding, isMobileLayout: mobile }) => (
        <div
          style={{
            background: mobile ? "transparent" : "#f3f4f6",
            minHeight: mobile ? "auto" : "100vh",
            boxSizing: "border-box",
            maxWidth: "100%"
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              ...styles.backButton,
              ...(mobile ? styles.backButtonMobile : null)
            }}
          >
            ← Back
          </button>

          <div
            style={{
              background: "#fff",
              padding: contentPadding,
              borderRadius: mobile ? "12px" : "15px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              boxSizing: "border-box",
              maxWidth: "100%",
              overflowX: "hidden"
            }}
          >
            <h1
              style={{
                marginBottom: mobile ? "20px" : "30px",
                color: "#0f172a",
                fontSize: mobile ? "24px" : "32px",
                fontWeight: "700",
                letterSpacing: "-0.5px",
                lineHeight: 1.25
              }}
            >
              Interview Assessment Report
            </h1>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: mobile
                  ? "1fr"
                  : "repeat(auto-fit,minmax(250px,1fr))",
                gap: "20px",
                marginBottom: "35px"
              }}
            >
              <div style={styles.card}>
                <div style={styles.label}>Candidate Code</div>
                <div style={styles.value}>{header.candidate_code}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Candidate Name</div>
                <div style={styles.value}>{header.candidate_name}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Req Code</div>
                <div style={styles.value}>{header.req_code}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Position</div>
                <div style={styles.value}>{header.job_title}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Interviewer</div>
                <div style={styles.value}>{header.interviewer_name}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Interview Round</div>
                <div style={styles.value}>{header.round_type}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Interview Date</div>
                <div style={styles.value}>{header.interview_date}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Interview Time</div>
                <div style={styles.value}>{header.interview_time}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: mobile
                  ? "1fr"
                  : "repeat(auto-fit,minmax(250px,1fr))",
                gap: "15px",
                marginBottom: "25px"
              }}
            >
              <div style={styles.card}>
                <div style={styles.label}>Interview Level</div>
                <div style={styles.value}>{header.interview_level}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Area Of Interview</div>
                <div style={styles.value}>{header.area_of_interview}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Overall Rating</div>
                <div style={styles.value}>{header.overall_rating}</div>
              </div>

              <div style={styles.card}>
                <div style={styles.label}>Final Outcome</div>

                <div style={{ marginTop: "5px" }}>
                  <span
                    style={{
                      background:
                        header.final_outcome === "Selected" ? "#dcfce7" : "#fee2e2",
                      color:
                        header.final_outcome === "Selected" ? "#166534" : "#991b1b",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    {header.final_outcome}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.sectionCard}>
              <h2 style={{ marginBottom: "20px" }}>Skill Assessment</h2>
              {renderSkillAssessment()}
            </div>

            <div style={styles.sectionCard}>
              <h2>Strengths</h2>
              <p style={styles.bodyText}>{header.strengths}</p>
            </div>

            <div style={styles.sectionCard}>
              <h2>Improvement Areas</h2>
              <p style={styles.bodyText}>{header.improvement_areas}</p>
            </div>

            <div style={styles.sectionCard}>
              <h2>Overall Comments</h2>
              <p style={styles.bodyText}>{header.overall_comments}</p>
            </div>
          </div>
        </div>
      )}
    </FeedbackViewShell>
  );
}

const styles = {
  mobileScrollContent: {
    maxWidth: "100%",
    overflowX: "hidden",
    overflowY: "visible",
    boxSizing: "border-box"
  },

  backButton: {
    background: "#1e3a8a",
    color: "#fff",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "25px",
    fontWeight: "600"
  },

  backButtonMobile: {
    width: "100%",
    maxWidth: "100%",
    minHeight: "44px",
    boxSizing: "border-box"
  },

  sectionCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxSizing: "border-box",
    maxWidth: "100%",
    overflowX: "hidden"
  },

  mobileSkillList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  mobileSkillCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px",
    background: "#f8fafc",
    boxSizing: "border-box",
    maxWidth: "100%"
  },

  mobileSkillValue: {
    color: "#111827",
    fontSize: "15px",
    fontWeight: "600",
    lineHeight: 1.45,
    wordBreak: "break-word",
    overflowWrap: "anywhere"
  },

  mobileCommentText: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere"
  },

  bodyText: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    margin: "8px 0 0"
  },

  card: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "12px",
    minHeight: "40px",
    boxSizing: "border-box",
    minWidth: 0
  },

  label: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px"
  },

  value: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: "1.4",
    wordBreak: "break-word",
    overflowWrap: "anywhere"
  }
};
