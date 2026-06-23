import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import axios from "axios";

import Header from "../components/Header";

export default function ViewFeedback() {

  const navigate = useNavigate();

  const { scheduleId } = useParams();

  const [header, setHeader] = useState(null);

  const [details, setDetails] = useState([]);

  useEffect(() => {

    loadFeedback();

  }, []);

  const loadFeedback = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await axios.get(

          `http://localhost:5000/feedback/${scheduleId}`,

          {

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }

        );

      if (
        response.data.feedbackExists
      ) {

        setHeader(
          response.data.header
        );

        setDetails(
          response.data.details
        );

      }

    }

    catch (error) {

      console.log(error);

      alert(
        "Unable to load feedback"
      );

    }

  };

  const renderStars = (rating) => {

    return (

      <div>

        {

          [1, 2, 3, 4, 5].map(

            (star) => (

              <span

                key={star}

                style={{

                  fontSize: "28px",

                  color:

                    star <= rating
                      ? "#f59e0b"
                      : "#d1d5db"

                }}

              >
                ★
              </span>

            )

          )

        }

      </div>

    );

  };

  if (!header) {

  return (

    <div>

      <Header
        userName={localStorage.getItem("full_name")}
        roleName={localStorage.getItem("role_name")}
      />

      <div style={{ padding: "40px" }}>
        Loading...
      </div>

    </div>

  );

}

  return (

  <div>

    <Header
      userName={localStorage.getItem("full_name")}
      roleName={localStorage.getItem("role_name")}
    />

    <div
      style={{
        padding: "30px",
        background: "#f3f4f6",
        minHeight: "100vh"
      }}
    >

    <button
      onClick={() => navigate(-1)}
      style={{
        background: "#1e3a8a",
        color: "#fff",
        border: "none",
        padding: "12px 25px",
        borderRadius: "8px",
        cursor: "pointer",
        marginBottom: "25px",
        fontWeight: "600"
      }}
    >
      ← Back
    </button>

    <div
      style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "15px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.08)"
      }}
    >

      <h1
  style={{
    marginBottom: "30px",
    color: "#0f172a",
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "-0.5px"
  }}
>
  Interview Assessment Report
</h1>

        <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: "20px",
    marginBottom: "35px"
  }}
>

  <div style={styles.card}>
    <div style={styles.label}>
      Candidate Code
    </div>
    <div style={styles.value}>
      {header.candidate_code}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Candidate Name
    </div>
    <div style={styles.value}>
      {header.candidate_name}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Req Code
    </div>
    <div style={styles.value}>
      {header.req_code}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Position
    </div>
    <div style={styles.value}>
      {header.job_title}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Interviewer
    </div>
    <div style={styles.value}>
      {header.interviewer_name}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Interview Round
    </div>
    <div style={styles.value}>
      {header.round_type}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Interview Date
    </div>
    <div style={styles.value}>
      {header.interview_date}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Interview Time
    </div>
    <div style={styles.value}>
      {header.interview_time}
    </div>
  </div>

</div>

      {/* Summary Cards */}

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: "15px",
    marginBottom: "25px"
  }}
>

  <div style={styles.card}>
    <div style={styles.label}>
      Interview Level
    </div>
    <div style={styles.value}>
      {header.interview_level}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Area Of Interview
    </div>
    <div style={styles.value}>
      {header.area_of_interview}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Overall Rating
    </div>
    <div style={styles.value}>
      {header.overall_rating}
    </div>
  </div>

  <div style={styles.card}>
    <div style={styles.label}>
      Final Outcome
    </div>

    <div
      style={{
        marginTop: "5px"
      }}
    >
      <span
        style={{
          background:
            header.final_outcome === "Selected"
              ? "#dcfce7"
              : "#fee2e2",

          color:
            header.final_outcome === "Selected"
              ? "#166534"
              : "#991b1b",

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

      {/* Skill Assessment */}

      <div
        style={{
          background: "#fff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "25px"
        }}
      >

        <h2
          style={{
            marginBottom: "20px"
          }}
        >
          Skill Assessment
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse"
          }}
        >

          <thead>

            <tr
              style={{
                background:
                  "#f8fafc"
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

              <tr
                key={row.detail_id}
              >

                <td
                  style={{
                    padding: "12px",
                    borderBottom:
                      "1px solid #e5e7eb"
                  }}
                >
                  {row.skill_name}
                </td>

                <td
                  style={{
                    padding: "12px",
                    borderBottom:
                      "1px solid #e5e7eb"
                  }}
                >
                  {
                    renderStars(
                      row.rating
                    )
                  }
                </td>

                <td
                  style={{
                    padding: "12px",
                    borderBottom:
                      "1px solid #e5e7eb"
                  }}
                >
                  {row.comments}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div
        style={{
          background: "#fff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px"
        }}
      >
        <h2>Strengths</h2>
        <p>{header.strengths}</p>
      </div>

      <div
        style={{
          background: "#fff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px"
        }}
      >
        <h2>Improvement Areas</h2>
        <p>{header.improvement_areas}</p>
      </div>

      <div
        style={{
          background: "#fff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px"
        }}
      >
        <h2>Overall Comments</h2>
        <p>{header.overall_comments}</p>
      </div>

    </div>

  </div>
</div>
);
}

const styles = {

  card: {
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "12px",
  minHeight: "40px"
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
  wordBreak: "break-word"
},

};