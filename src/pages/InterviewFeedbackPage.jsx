import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import WorkspaceLayout from "../components/enterprise/WorkspaceLayout";
import RecruiterNavRail from "../components/layout/RecruiterNavRail";

function normalizeSkillName(value) {
  return String(value || "").trim().toLowerCase();
}

function hasSkillName(value) {
  return String(value || "").trim().length > 0;
}

function hasSkillRating(value) {
  return Number(value) > 0;
}

function InterviewFeedbackPage() {

  const navigate = useNavigate();

  const { scheduleId } = useParams();

  const skillInputRefs = useRef([]);

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (_error) {
      return null;
    }
  }, []);

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

  const [skillError, setSkillError] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

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

    const lastIndex = skills.length - 1;
    const lastRow = skills[lastIndex] || {};
    const trimmedName = String(lastRow.skill_name || "").trim();
    const ratingValue = Number(lastRow.rating) || 0;

    if (!trimmedName || ratingValue < 1) {
      setSkillError(
        "Enter a skill and select a rating before adding."
      );
      return;
    }

    const isDuplicate = skills.some((row, index) => {
      if (index === lastIndex) {
        return false;
      }
      return normalizeSkillName(row.skill_name) === normalizeSkillName(trimmedName);
    });

    if (isDuplicate) {
      setSkillError(
        "This skill has already been added."
      );
      return;
    }

    const committed = skills.map((row, index) => {
      if (index !== lastIndex) {
        return row;
      }
      return {
        ...row,
        skill_name: trimmedName
      };
    });

    const nextIndex = committed.length;

    setSkills([
      ...committed,
      {
        skill_name: "",
        rating: "",
        comments: ""
      }
    ]);

    setSkillError("");

    setTimeout(() => {
      skillInputRefs.current[nextIndex]?.focus();
    }, 0);

  };

  const removeSkillRow = index => {

    const updated =
      [...skills];

    updated.splice(index, 1);

    if (updated.length === 0) {
      updated.push({
        skill_name: "",
        rating: "",
        comments: ""
      });
    }

    setSkills(updated);
    setSkillError("");

  };

  const updateSkill = (
    index,
    field,
    value
  ) => {

    const updated =
      [...skills];

    const current = {
      ...updated[index],
      [field]: value
    };

    if (field === "skill_name" && !String(value || "").trim()) {
      current.rating = "";
    }

    updated[index] = current;

    setSkills(updated);

    if (skillError) {
      setSkillError("");
    }

  };

  const handleStarClick = (index, star) => {

    const row = skills[index];

    if (!hasSkillName(row?.skill_name)) {
      return;
    }

    const currentRating = Number(row.rating) || 0;
    const nextRating = currentRating === star ? 0 : star;

    updateSkill(
      index,
      "rating",
      nextRating === 0 ? "" : nextRating
    );

  };

  // =====================================
  // Submit Feedback
  // =====================================

  const handleSubmit =
    async () => {

      try {

        const completedSkills = skills.filter(
          (row) =>
            hasSkillName(row.skill_name) &&
            hasSkillRating(row.rating)
        );

        if (
          !areaOfInterview ||
          !overallRating ||
          !finalOutcome ||
          completedSkills.length === 0
        ) {

          setSubmitError(
            "Please select Area Of Interview, Overall Rating, Final Outcome, and add at least one skill with a rating."
          );

          return;

        }

        setSubmitError("");

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

          skills: skills.map((row) => ({
            ...row,
            skill_name: String(row.skill_name || "").trim()
          }))

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

    return <div style={styles.loading}>Loading...</div>;

  }

  return (

    <WorkspaceLayout
      navRail={<RecruiterNavRail loggedInUser={loggedInUser} />}
    >

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

          <div style={styles.panelHeader}>
            Evaluation
          </div>

          <div style={styles.formRow}>

            <div style={styles.fieldBlock}>

              <label style={styles.formLabel}>
                  Area Of Interview
                </label>
              
              <select
                style={styles.select}
                value={areaOfInterview}
                onChange={(e) => {
                  setAreaOfInterview(e.target.value);
                  if (submitError) {
                    setSubmitError("");
                  }
                }}
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

            <div style={styles.fieldBlock}>

              <label style={styles.formLabel}>
                Overall Rating
              </label>

              <select
                style={styles.select}
                value={overallRating}
                onChange={(e) => {
                  setOverallRating(e.target.value);
                  if (submitError) {
                    setSubmitError("");
                  }
                }}
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

          <h3 style={styles.sectionTitle}>
            Skill Assessment
          </h3>

<div>

  {skills.map((row, index) => {

    const skillEnabled = hasSkillName(row.skill_name);
    const ratingValue = Number(row.rating) || 0;

    return (

    <div
      key={index}
      style={styles.skillRow}
    >

      <input
        ref={(el) => {
          skillInputRefs.current[index] = el;
        }}
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
          ...styles.starRow,
          cursor: skillEnabled ? "pointer" : "not-allowed",
          opacity: skillEnabled ? 1 : 0.55
        }}
        aria-disabled={!skillEnabled}
      >

  {[1, 2, 3, 4, 5].map((star) => (

    <span
      key={star}
      onClick={() =>
        handleStarClick(index, star)
      }
      style={{
        color:
          ratingValue >= star
            ? "#f39c12"
            : "#cfd8e3",
        transition: "0.2s",
        cursor: skillEnabled ? "pointer" : "not-allowed",
        pointerEvents: skillEnabled ? "auto" : "none",
        userSelect: "none"
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
        style={styles.removeButton}
        onClick={() =>
          removeSkillRow(index)
        }
      >
        -
      </button>

    </div>

    );

  })}

</div>

          {skillError ? (
            <div style={styles.inlineError}>
              {skillError}
            </div>
          ) : null}

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
            onChange={(e) => {
              setFinalOutcome(e.target.value);
              if (submitError) {
                setSubmitError("");
              }
            }}
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

          {submitError ? (
            <div style={styles.inlineError}>
              {submitError}
            </div>
          ) : null}

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

    </WorkspaceLayout>

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

  loading: {
    padding: "24px",
    fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
    fontSize: "14px",
    color: "#5f6368"
  },

  container: {
    padding: "24px 32px 32px",
    maxWidth: "1600px",
    fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
    color: "#202124"
  },

  pageTitle: {
    fontSize: "22px",
    fontWeight: "700",
    lineHeight: 1.3,
    color: "#1f3b63",
    marginTop: "8px",
    marginBottom: "24px",
    letterSpacing: "-0.01em"
  },

  panel: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px 24px",
    marginBottom: "16px",
    border: "1px solid rgba(31, 59, 99, 0.12)",
    boxShadow: "0 1px 2px rgba(31, 59, 99, 0.06)"
  },

  panelHeader: {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: 1.35,
    color: "#1f3b63",
    marginBottom: "16px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(31, 59, 99, 0.08)"
  },

  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: 1.35,
    color: "#202124",
    marginTop: "8px",
    marginBottom: "10px"
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "12px",
    marginTop: "4px"
  },

  infoCard: {
    background: "#f5f7fb",
    border: "1px solid rgba(31, 59, 99, 0.10)",
    borderRadius: "8px",
    padding: "12px 14px",
    minHeight: "64px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "none"
  },

  infoLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#5f6368",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: "4px"
  },

  infoValue: {
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: 1.4,
    color: "#202124"
  },

  formRow: {
    display: "flex",
    gap: "24px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },

  fieldBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },

  formLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#5f6368",
    letterSpacing: "0.02em"
  },

  select: {
    width: "320px",
    maxWidth: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(31, 59, 99, 0.18)",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#202124",
    background: "#ffffff",
    boxSizing: "border-box"
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(31, 59, 99, 0.18)",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#202124",
    background: "#ffffff",
    boxSizing: "border-box"
  },

  skillRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 2fr 48px",
    gap: "12px",
    marginBottom: "12px",
    alignItems: "center"
  },

  starRow: {
    display: "flex",
    gap: "4px",
    fontSize: "24px",
    cursor: "pointer",
    alignItems: "center",
    lineHeight: 1
  },

  inlineError: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#c5221f",
    marginBottom: "10px",
    fontFamily: "inherit"
  },

  textArea: {
    width: "100%",
    minHeight: "96px",
    borderRadius: "8px",
    border: "1px solid rgba(31, 59, 99, 0.18)",
    padding: "10px 12px",
    marginBottom: "16px",
    resize: "vertical",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#202124",
    background: "#ffffff",
    boxSizing: "border-box"
  },

  addButton: {
    background: "#ffffff",
    border: "1px solid rgba(31, 59, 99, 0.22)",
    color: "#1f3b63",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "20px",
    fontWeight: "600",
    fontSize: "13px",
    fontFamily: "inherit"
  },

  removeButton: {
    background: "rgba(197, 34, 31, 0.08)",
    color: "#c5221f",
    border: "1px solid rgba(197, 34, 31, 0.18)",
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "16px",
    fontFamily: "inherit"
  },

  submitButton: {
    background: "#1f3b63",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "inherit",
    marginTop: "12px"
  },

  backButton: {
    background: "#1f3b63",
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "inherit",
    marginBottom: "8px"
  }

};

export default InterviewFeedbackPage;