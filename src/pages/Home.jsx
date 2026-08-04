import Header from "../components/Header";
import AdminNavRail from "../components/layout/AdminNavRail";
import EnterpriseModuleIcon from "../components/enterprise/EnterpriseModuleIcon";
import {

  FaBriefcase,
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaUserFriends,
  FaHandshake,
  FaCheckCircle

} from "react-icons/fa";

import { useState } from "react";

import { Navigate } from "react-router-dom";

function AdminHomeLegacy() {

  const [dashboardData, setDashboardData] =
  useState({});

  const [myRequisitions, setMyRequisitions] =
  useState([]);

return (

  <div style={styles.app}>

    <Header />

    {/* BODY */}

    <div style={styles.body}>


        <AdminNavRail />


        {/* MAIN CONTENT */}
        <div style={styles.mainContent}>


          <div style={styles.pageTitle}>
            Recruiter Command Center
          </div>


          {/* DASHBOARD CARDS */}
<div style={styles.cardContainer}>

  {/* My Requisitions */}
  <div style={{
    ...styles.card,
    border: "2px solid #3b82f6",
    textAlign: "center"
  }}>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <EnterpriseModuleIcon icon={FaBriefcase} module="requisitions" density="sm" />
    </div>
    <div style={styles.metricTitle}>
      My Requisitions
    </div>
    <div style={{
      ...styles.metricValue,
      color: "#3b82f6"
    }}>
      {dashboardData.my_requisitions || 0}
    </div>
  </div>

  {/* My Candidates */}
  <div style={{
    ...styles.card,
    border: "2px solid #7c3aed",
    textAlign: "center"
  }}>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <EnterpriseModuleIcon icon={FaUsers} module="candidates" density="sm" />
    </div>
    <div style={styles.metricTitle}>
      My Candidates
    </div>
    <div style={{
      ...styles.metricValue,
      color: "#7c3aed"
    }}>
      {dashboardData.my_candidates || 0}
    </div>
  </div>

  {/* Applied */}
  <div style={{
    ...styles.card,
    border: "2px solid #2563eb",
    textAlign: "center"
  }}>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <EnterpriseModuleIcon icon={FaUserPlus} module="recruitment" density="sm" />
    </div>
    <div style={styles.metricTitle}>
      Applied
    </div>
    <div style={{
      ...styles.metricValue,
      color: "#2563eb"
    }}>
      {dashboardData.applied || 0}
    </div>
  </div>

  {/* L1 Interview */}
  <div style={{
    ...styles.card,
    border: "2px solid #0891b2",
    textAlign: "center"
  }}>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <EnterpriseModuleIcon icon={FaUserCheck} module="interviews" density="sm" />
    </div>
    <div style={styles.metricTitle}>
      L1 Interview
    </div>
    <div style={{
      ...styles.metricValue,
      color: "#0891b2"
    }}>
      {dashboardData.l1_interview || 0}
    </div>
  </div>

  {/* L2 Interview */}
  <div style={{
    ...styles.card,
    border: "2px solid #0f766e",
    textAlign: "center"
  }}>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <EnterpriseModuleIcon icon={FaUserFriends} module="interviews" density="sm" />
    </div>
    <div style={styles.metricTitle}>
      L2 Interview
    </div>
    <div style={{
      ...styles.metricValue,
      color: "#0f766e"
    }}>
      {dashboardData.l2_interview || 0}
    </div>
  </div>

  {/* Offer */}
  <div style={{
    ...styles.card,
    border: "2px solid #ea580c",
    textAlign: "center"
  }}>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <EnterpriseModuleIcon icon={FaHandshake} module="approvals" density="sm" />
    </div>
    <div style={styles.metricTitle}>
      Offer
    </div>
    <div style={{
      ...styles.metricValue,
      color: "#ea580c"
    }}>
      {dashboardData.offer || 0}
    </div>
  </div>

  {/* Joined */}
  <div style={{
    ...styles.card,
    border: "2px solid #16a34a",
    textAlign: "center"
  }}>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <EnterpriseModuleIcon icon={FaCheckCircle} module="team" density="sm" />
    </div>
    <div style={styles.metricTitle}>
      Joined
    </div>
    <div style={{
      ...styles.metricValue,
      color: "#16a34a"
    }}>
      {dashboardData.joined || 0}
    </div>
  </div>

</div>
          {/* DASHBOARD PANEL */}
<div style={styles.dashboardPanel}>

  <div style={styles.panelHeader}>
    Recruiter Workspace
  </div>

  <div style={styles.panelBody}>

    {/* =====================================
        ASSIGNED REQUISITIONS
    ===================================== */}

    <div
  style={{
    width: "100%",
    padding: "10px 0"
  }}
>

      <div
        style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px",
          color: "#111827"
        }}
      >
        Assigned Requisitions
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >

        <thead>

          <tr>

            <th style={styles.th}>
              Req Code
            </th>
            <th style={styles.th}>
            Status
            </th>
            <th style={styles.th}>
              Client
            </th>

            <th style={styles.th}>
              Position
            </th>

            <th style={styles.th}>
              Openings
            </th>

            <th style={styles.th}>
              Priority
            </th>

            <th style={styles.th}>
              Target Date
            </th>

          </tr>

        </thead>

        <tbody>

          {

            myRequisitions.length > 0 ?

            myRequisitions.map((req) => (

              <tr key={req.req_id}>

                <td style={styles.td}>
                  {req.req_code}
                </td>
                <td style={styles.td}>
              <span
              style={{
                background: "#dcfce7",
                color: "#15803d",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: "600"
              }}
            >
              {req.req_status}
            </span>
          </td>

                <td style={styles.td}>
                  {req.client_name}
                </td>

                <td style={styles.td}>
                  {req.job_title}
                </td>

                <td style={styles.td}>
                  {req.openings_count}
                </td>

                <td style={styles.td}>

  <span
    style={{
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      background:
        req.priority_level === "High"
          ? "#fee2e2"
          : req.priority_level === "Medium"
          ? "#fef3c7"
          : "#dcfce7",
      color:
        req.priority_level === "High"
          ? "#dc2626"
          : req.priority_level === "Medium"
          ? "#d97706"
          : "#16a34a"
    }}
  >

    {req.priority_level}

  </span>

</td>

                <td style={styles.td}>
                  {
                    new Date(
                      req.target_date
                    ).toLocaleDateString()
                  }
                </td>

              </tr>

            ))

            :

            <tr>

              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#6b7280"
                }}
              >

                No Assigned Requisitions

              </td>

            </tr>

          }

        </tbody>

      </table>

    </div>

  </div>

</div>
            
              
            </div>

          </div>

        </div>
  );

}


/* ================= STYLES ================= */

const styles = {

  app: {

    fontFamily: "Segoe UI, sans-serif",

    background: "#f4f6f9",

    minHeight: "100vh",

  },

  header: {

    height: "70px",

    background: "#1f3b63",

    color: "white",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    padding: "0 30px",

    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"

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

    fontSize: "26px",

    fontWeight: "600",

    letterSpacing: "2px"

  },


  /* USER SECTION */

  userSection: {

    display: "flex",

    alignItems: "center",

    gap: "15px"

  },

  userInfo: {

    display: "flex",

    flexDirection: "column",

    alignItems: "flex-end"

  },

  userName: {

    color: "#1f3b63",

    fontWeight: "600",

    fontSize: "14px"

  },

  roleName: {

    fontSize: "12px",

    color: "#64748b"

  },

  logoutButton: {

    background: "#ef4444",

    border: "none",

    color: "white",

    padding: "8px 14px",

    borderRadius: "8px",

    cursor: "pointer",

    fontSize: "14px",

    fontWeight: "600"

  },


  body: {

    display: "flex"

  },

  sidebar: {

    width: "240px",

    background: "#ffffff",

    minHeight: "calc(100vh - 70px)",

    padding: "25px 15px",

    boxShadow: "2px 0 8px rgba(0,0,0,0.05)",

    display: "flex",

    flexDirection: "column",

    gap: "15px"

  },

  menuButton: {

    background: "#f4f6f9",

    border: "none",

    padding: "14px",

    borderRadius: "10px",

    cursor: "pointer",

    fontSize: "15px",

    textAlign: "left",

    fontWeight: "500",

    transition: "0.2s"

  },

  mainContent: {

    flex: 1,

    padding: "30px"

  },

  pageTitle: {

    fontSize: "22px",

    fontWeight: "600",

    marginBottom: "25px",

    color: "#1f2937"

  },

  cardContainer: {

  display: "grid",

  gridTemplateColumns:
    "repeat(7, 1fr)",

  gap: "20px",

  marginBottom: "30px"

},

  card: {

  background: "#fff",

  padding: "15px",

  borderRadius: "12px",

  textAlign: "center",

  minHeight: "50px",

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.08)"

},
  cardTitle: {

    fontSize: "14px",

    color: "#666",

    marginBottom: "10px"

  },

  cardValue: {

    fontSize: "34px",

    fontWeight: "bold",

    color: "#1f3b63"

  },
  metricTitle: {

  fontSize: "12px",

  fontWeight: "500",

  minHeight: "36px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  textAlign: "center",

  lineHeight: "16px"

},

metricValue: {

  fontSize: "22px",

  fontWeight: "700",

  marginTop: "4px"

},

  dashboardPanel: {

    background: "white",

    borderRadius: "14px",

    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",

    minHeight: "420px"

  },

  panelHeader: {

    padding: "18px 25px",

    borderBottom: "1px solid #eee",

    fontWeight: "600",

    fontSize: "20px"

  },

  panelBody: {

  padding: "30px",

  color: "#777"

},

th: {

  textAlign: "left",

  padding: "14px",

  background: "#f8fafc",

  color: "#1e293b",

  fontWeight: "600",

  borderBottom:
    "2px solid #e5e7eb"

},

td: {

  padding: "14px",

  borderBottom:
    "1px solid #e5e7eb",

  color: "#374151"

}

};

function Home() {

  const loggedInUser =
    JSON.parse(localStorage.getItem("user"));

  const userRole =
    loggedInUser?.role_name;

  if (userRole === "Recruiter") {
    return <Navigate to="/recruiter" replace />;
  }

  return <AdminHomeLegacy />;

}

export default Home;