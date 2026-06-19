import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from "react-icons/fa";

import { useEffect, useState } from "react";
import API from "../api/axios";

function InterviewerHome() {

  const loggedInUser =
    JSON.parse(localStorage.getItem("user"));

  const [interviews, setInterviews] =
    useState([]);

  const navigate = useNavigate();  

  // ===========================
  // Fetch My Interviews
  // ===========================

  const fetchMyInterviews =
    async () => {

      try {

        const response =
          await API.get(
            "/my-interviews"
          );

        setInterviews(
          response.data.data || []
        );

      }

      catch (error) {

        console.log(error);

      }

    };

  useEffect(() => {

    fetchMyInterviews();

  }, []);

  const scheduledCount =
  interviews.filter(
    x => !x.feedback_submitted
  ).length;

const completedCount =
  interviews.filter(
    x => x.feedback_submitted
  ).length;

const selectedCount =
  interviews.filter(
    x =>
      x.final_outcome === "Selected"
  ).length;

const rejectedCount =
  interviews.filter(
    x =>
      x.final_outcome === "Rejected"
  ).length;

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

        <div style={styles.userSection}>

          <div>

            <div style={styles.userName}>
              {loggedInUser?.full_name}
            </div>

            <div style={styles.roleName}>
              Interviewer
            </div>

          </div>

          <button
            style={styles.logoutButton}
            onClick={() => {

              localStorage.clear();

              window.location.href =
                "/login";

            }}
          >
            Logout
          </button>

        </div>

      </div>

      {/* CONTENT */}

      <div style={styles.mainContent}>

        <div
  style={{
    fontSize: "30px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "30px"
  }}
>
  Interviewer Workspace
</div>

        {/* DASHBOARD CARDS */}

        <div style={styles.cardContainer}>

          <div
            style={{
              ...styles.card,
              border:
                "2px solid #2563eb"
            }}
          >
            <FaCalendarCheck
              size={20}
              color="#2563eb"
            />

            <div style={styles.metricTitle}>
              Scheduled
            </div>

            <div style={styles.metricValue}>
              {scheduledCount}
            </div>

          </div>

          <div
            style={{
              ...styles.card,
              border:
                "2px solid #0891b2"
            }}
          >
            <FaClock
              size={20}
              color="#0891b2"
            />

            <div style={styles.metricTitle}>
              Completed
            </div>

            <div style={styles.metricValue}>
              {completedCount}
            </div>

          </div>

          <div
            style={{
              ...styles.card,
              border:
                "2px solid #16a34a"
            }}
          >
            <FaCheckCircle
              size={20}
              color="#16a34a"
            />

            <div style={styles.metricTitle}>
              Selected
            </div>

            <div style={styles.metricValue}>
              {selectedCount}
            </div>

          </div>

          <div
            style={{
              ...styles.card,
              border:
                "2px solid #dc2626"
            }}
          >
            <FaTimesCircle
              size={20}
              color="#dc2626"
            />

            <div style={styles.metricTitle}>
              Rejected
            </div>

            <div style={styles.metricValue}>
              {rejectedCount}
            </div>

          </div>

        </div>

        {/* TABLE */}

        <div style={styles.panel}>

          <div style={styles.panelHeader}>
            My Interview Schedule
          </div>

          <div style={styles.panelBody}>

            <table
              style={styles.table}
            >

              <thead>

                <tr>

                  <th style={styles.th}>
                    Date
                  </th>

                  <th style={styles.th}>
                    Time
                  </th>

                  <th style={styles.th}>
                    Candidate
                  </th>

                  <th style={styles.th}>
                    Position
                  </th>

                  <th style={styles.th}>
                    Round
                </th>

                <th style={styles.th}>
                  Resume
                </th>

                <th style={styles.th}>
                  JD
                </th>

                <th style={styles.th}>
                  Teams
                </th>

                <th style={styles.th}>
                  Feedback
                </th>

                <th style={styles.th}>
                  Status
                </th>
                </tr>

              </thead>

              <tbody>

                {

                  interviews.map(
                    row => (

                      <tr
                        key={
                          row.schedule_id
                        }
                      >

                        <td style={styles.td}>
                          {
                            new Date(
                              row.interview_date
                            )
                            .toLocaleDateString()
                          }
                        </td>

                        <td style={styles.td}>
                          {
                            row.interview_time
                          }
                        </td>

                        <td style={styles.td}>
                          {
                            row.candidate_name
                          }
                        </td>

                        <td style={styles.td}>
                          {
                            row.job_title
                          }
                        </td>

                        <td style={styles.td}>
  {row.round_type}
</td>

<td style={styles.td}>

  {
    row.resume_path ?

    (
      <button
        style={styles.actionButton}
        onClick={() =>
          window.open(
            row.resume_path,
            "_blank"
          )
        }
      >
        Resume
      </button>
    )

    :

    <span>N/A</span>
  }

</td>

<td style={styles.td}>

  <button
    style={styles.actionButton}
    onClick={() => {

      alert(

`Client : ${row.client_name}

Position : ${row.job_title}

Primary Skill : ${row.primary_skill}

Secondary Skill : ${row.secondary_skill}

Experience : ${row.experience_min} - ${row.experience_max} Years`

      );

    }}
  >
    JD
  </button>

</td>

<td style={styles.td}>

  {
    row.feedback_submitted ? (

      <button
        disabled
        style={{
          ...styles.actionButton,
          background: "#d1d5db",
          color: "#6b7280",
          cursor: "not-allowed",
          opacity: 0.8
        }}
      >
        Completed
      </button>

    ) : (

      <button
        style={styles.actionButton}
        onClick={() =>
          window.open(
            row.meeting_link,
            "_blank"
          )
        }
      >
        Join Teams
      </button>

    )
  }

</td>
<td style={styles.td}>

  {
    row.feedback_submitted ? (

      <button
        disabled
        style={{
          background: "#d1fae5",
          color: "#065f46",
          border: "none",
          padding: "8px 16px",
          borderRadius: "20px",
          fontWeight: "600",
          cursor: "not-allowed"
        }}
      >
        Submitted
      </button>

    ) : (

      <button
        style={styles.actionButton}
        onClick={() =>
          navigate(
            `/feedback/${row.schedule_id}`
          )
        }
      >
        Submit
      </button>

    )
  }

</td>

<td style={styles.td}>

  <span
    style={{

      background:
        row.feedback_submitted
          ? "#dcfce7"
          : "#dbeafe",

      color:
        row.feedback_submitted
          ? "#15803d"
          : "#1d4ed8",

      padding: "5px 10px",

      borderRadius: "20px",

      fontSize: "12px",

      fontWeight: "600"

    }}
  >

    {
      row.feedback_submitted
        ? "Completed"
        : "Scheduled"
    }

  </span>

</td>
                      </tr>

                    )

                  )

                }

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}

const styles = {

  app: {
    fontFamily:
      "Segoe UI, sans-serif",
    background: "#f4f6f9",
    minHeight: "100vh"
  },

  header: {
    height: "70px",
    background: "#1f3b63",
    color: "white",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: "0 30px"
  },

  logo: {
    fontSize: "28px",
    fontWeight: "bold"
  },

  tagline: {
    fontSize: "11px",
    color: "#f39c12"
  },

  title: {
    fontSize: "24px",
    fontWeight: "600"
  },

  userSection: {
    display: "flex",
    gap: "15px",
    alignItems: "center"
  },

  userName: {
    fontWeight: "600"
  },

  roleName: {
    fontSize: "12px"
  },

  logoutButton: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer"
  },

  mainContent: {
    padding: "30px"
  },

  cardContainer: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4,1fr)",
    gap: "20px",
    marginBottom: "30px"
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center"
  },

  metricTitle: {
    marginTop: "10px"
  },

  metricValue: {
    fontSize: "24px",
    fontWeight: "700"
  },

  panel: {
    background: "#fff",
    borderRadius: "12px"
  },

  panelHeader: {
    padding: "20px",
    fontSize: "20px",
    fontWeight: "600"
  },

  panelBody: {
    padding: "20px"
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse"
  },

  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f8fafc"
  },

  td: {
    padding: "12px",
    borderBottom:
      "1px solid #e5e7eb"
  },

  actionButton: {

  background: "#1f3b63",

  color: "#ffffff",

  border: "none",

  padding: "6px 12px",

  borderRadius: "6px",

  cursor: "pointer",

  fontSize: "12px",

  fontWeight: "500"

}

};

export default InterviewerHome;