import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

function InterviewFeedbackPage() {

  const navigate = useNavigate();

  const { scheduleId } = useParams();

  const [loading, setLoading] =
    useState(true);

  const [candidate, setCandidate] =
    useState({});

  const [areaOfInterview, setAreaOfInterview] =
    useState("");

  const [overallRating, setOverallRating] =
    useState("");

  const [strengths, setStrengths] =
    useState("");

  const [improvementAreas, setImprovementAreas] =
    useState("");

  const [overallComments, setOverallComments] =
    useState("");

  const [finalOutcome, setFinalOutcome] =
    useState("");

  const [skills, setSkills] =
    useState([
      {
        skill_name: "",
        rating: "",
        comments: ""
      }
    ]);

  // =====================================
  // Load Candidate Details
  // =====================================

  const loadFeedbackDetails =
    async () => {

      try {

        const response =
          await API.get(
            `/feedback-details/${scheduleId}`
          );

        setCandidate(
          response.data.data
        );

      }

      catch (error) {

        console.log(error);

        alert(
          "Error loading interview details"
        );

      }

      finally {

        setLoading(false);

      }

    };

  useEffect(() => {

    loadFeedbackDetails();

  }, []);

  // =====================================
  // Skill Functions
  // =====================================

  const addSkillRow = () => {

    setSkills([

      ...skills,

      {
        skill_name: "",
        rating: "",
        comments: ""
      }

    ]);

  };

  const removeSkillRow = index => {

    const updated =
      [...skills];

    updated.splice(index, 1);

    setSkills(updated);

  };

  const updateSkill = (
    index,
    field,
    value
  ) => {

    const updated =
      [...skills];

    updated[index][field] =
      value;

    setSkills(updated);

  };

  // =====================================
  // Submit Feedback
  // =====================================

  const handleSubmit =
    async () => {

      try {

        if (
          !areaOfInterview ||
          !overallRating ||
          !finalOutcome
        ) {

          alert(
            "Please complete all mandatory fields"
          );

          return;

        }

        const payload = {

          schedule_id:
            candidate.schedule_id,

          interview_level:
            candidate.interview_level,

          area_of_interview:
            areaOfInterview,

          overall_rating:
            overallRating,

          strengths,

          improvement_areas:
            improvementAreas,

          overall_comments:
            overallComments,

          final_outcome:
            finalOutcome,

          skills

        };

                const confirmed = window.confirm(
          "Are you sure you want to submit this interview feedback?\n\nOnce submitted it cannot be modified."
        );

        if (!confirmed) {
          return;
        }
        await API.post(
          "/submit-feedback",
          payload
        );

        alert(
          "Interview Feedback Submitted Successfully"
        );

        navigate(
          "/interviewer"
        );

      }

      catch (error) {

        console.log(error);

        alert(

          error?.response?.data?.message ||

          "Error submitting feedback"

        );

      }

    };

  if (loading) {

    return <div>Loading...</div>;

  }

  return (

    <div style={styles.app}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <div style={styles.logo}>
            IGS
          </div>

          <div style={styles.tagline}>
            ENGINEERING QUALITY
          </div>

        </div>

        <div style={styles.title}>
          ATS PLATFORM
        </div>

        <div />

      </div>

      {/* CONTENT */}

      <div style={styles.container}>

        <button
          style={styles.backButton}
          onClick={() =>
            navigate("/interviewer")
          }
        >
          ← Back To My Interviews
        </button>

        <h1 style={styles.pageTitle}>
          Interview Feedback
        </h1>

        {/* Candidate Information */}

        <div style={styles.panel}>

          <div style={styles.panelHeader}>
            Candidate Information
          </div>

          <div style={styles.cardGrid}>

            <InfoCard
              title="Candidate Code"
              value={candidate.candidate_code}
            />

            <InfoCard
              title="Candidate Name"
              value={candidate.candidate_name}
            />

            <InfoCard
              title="REQ Code"
              value={candidate.req_code}
            />

            <InfoCard
              title="Client"
              value={candidate.client_name}
            />

            <InfoCard
              title="Position"
              value={candidate.job_title}
            />

            <InfoCard
              title="Interviewer"
              value={candidate.interviewer_name}
            />

            <InfoCard
              title="Interview Level"
              value={candidate.interview_level}
            />

            <InfoCard
              title="Schedule ID"
              value={candidate.schedule_id}
            />

          </div>

        </div>

        {/* Assessment */}

        <div style={styles.panel}>

          <div style={styles.formRow}>

            <div>

              <label
                  style={{
                    marginRight: "15px",
                    fontWeight: "500"
                  }}
                >
                  Area Of Interview
                </label>
              
              <select
                style={styles.select}
                value={areaOfInterview}
                onChange={(e) =>
                  setAreaOfInterview(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select
                </option>

                <option>
                  Technical
                </option>

                <option>
                  Functional
                </option>

                <option>
                  Managerial
                </option>

                <option>
                  HR
                </option>

              </select>

            </div>

            <div>

              <label
                style={{
                  marginRight: "15px",
                  fontWeight: "500"
                }}
              >
                Overall Rating
              </label>

              <select
                style={styles.select}
                value={overallRating}
                onChange={(e) =>
                  setOverallRating(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select
                </option>

                <option>
                  Excellent
                </option>

                <option>
                  Good
                </option>

                <option>
                  Average
                </option>

                <option>
                  Poor
                </option>

              </select>

            </div>

          </div>

          {/* Skills */}

          <h3>
            Skill Assessment
          </h3>

<div>

  {skills.map((row, index) => (

    <div
      key={index}
      style={{
        display: "grid",
        gridTemplateColumns:
          "2fr 1fr 2fr 60px",
        gap: "15px",
        marginBottom: "15px",
        alignItems: "center"
      }}
    >

      <input
        style={styles.input}
        placeholder="Skill"
        value={row.skill_name}
        onChange={(e) =>
          updateSkill(
            index,
            "skill_name",
            e.target.value
          )
        }
      />

      <div
  style={{
    display: "flex",
    gap: "5px",
    fontSize: "28px",
    cursor: "pointer"
  }}
>

  {[1, 2, 3, 4, 5].map((star) => (

    <span
      key={star}
      onClick={() =>
        updateSkill(
          index,
          "rating",
          star
        )
      }
      style={{
        color:
          row.rating >= star
            ? "#f59e0b"
            : "#d1d5db",
        transition: "0.2s"
      }}
    >
      ★
    </span>

  ))}

</div>
      <input
        style={styles.input}
        placeholder="Comments"
        value={row.comments}
        onChange={(e) =>
          updateSkill(
            index,
            "comments",
            e.target.value
          )
        }
      />

      <button
        style={{
          background: "#fee2e2",
          color: "#dc2626",
          border: "none",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "700"
        }}
        onClick={() =>
          removeSkillRow(index)
        }
      >
        -
      </button>

    </div>

  ))}

</div>

          <button
            style={styles.addButton}
            onClick={
              addSkillRow
            }
          >
            + Add Skill
          </button>

          <textarea
            style={styles.textArea}
            placeholder="Strengths"
            value={strengths}
            onChange={(e) =>
              setStrengths(
                e.target.value
              )
            }
          />

          <textarea
            style={styles.textArea}
            placeholder="Improvement Areas"
            value={improvementAreas}
            onChange={(e) =>
              setImprovementAreas(
                e.target.value
              )
            }
          />

          <textarea
            style={styles.textArea}
            placeholder="Overall Comments"
            value={overallComments}
            onChange={(e) =>
              setOverallComments(
                e.target.value
              )
            }
          />

          <select
            style={styles.select}
            value={finalOutcome}
            onChange={(e) =>
              setFinalOutcome(
                e.target.value
              )
            }
          >
            <option value="">
              Select Final Outcome
            </option>

            <option>
              Selected
            </option>

            <option>
              Rejected
            </option>

            <option>
              Hold
            </option>

          </select>

          <br />

          <button
            style={styles.submitButton}
            onClick={
              handleSubmit
            }
          >
            Submit Feedback
          </button>

        </div>

      </div>

    </div>

  );

}

function InfoCard({
  title,
  value
}) {

  return (

    <div style={styles.infoCard}>

      <div style={styles.infoLabel}>
        {title}
      </div>

      <div style={styles.infoValue}>
        {value}
      </div>

    </div>

  );

}

const styles = {

  app: {
    background: "#f4f6f9",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif"
  },

  header: {
    background: "#1f3b63",
    color: "#ffffff",
    padding: "20px 45px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  logo: {
    fontSize: "32px",
    fontWeight: "700"
  },

  tagline: {
    fontSize: "11px",
    color: "#f59e0b",
    marginTop: "2px"
  },

  title: {
    fontSize: "26px",
    fontWeight: "600",
    letterSpacing: "1px"
  },

  container: {
    padding: "45px"
  },

  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f2747",
    marginTop: "25px",
    marginBottom: "35px"
  },

  panel: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },

  panelHeader: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "20px"
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(260px,1fr))",
    gap: "22px",
    marginTop: "15px"
  },

  infoCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "14px 18px",
    minHeight: "78px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
  },

  infoLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    marginBottom: "6px"
  },

  infoValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827"
  },

  formRow: {
    display: "flex",
    gap: "30px",
    marginBottom: "30px",
    flexWrap: "wrap"
  },

  select: {
    width: "380px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    marginTop: "6px"
  },

  input: {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  boxSizing: "border-box"
},

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    marginBottom: "20px"
  },

  textArea: {
    width: "100%",
    minHeight: "120px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    padding: "12px",
    marginBottom: "18px",
    resize: "vertical"
  },

  addButton: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "25px",
    fontWeight: "600"
  },

  submitButton: {
    background: "#1f3b63",
    color: "#ffffff",
    border: "none",
    padding: "14px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    marginTop: "15px"
  },

  backButton: {
    background: "#1f3b63",
    color: "#ffffff",
    border: "none",
    padding: "14px 28px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "25px"
  }

};

export default InterviewFeedbackPage;