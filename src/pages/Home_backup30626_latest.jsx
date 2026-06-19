import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  const loggedInUser =
    JSON.parse(localStorage.getItem("user"));

  const userRole =
    loggedInUser?.role_name;


  // =========================================
  // Dynamic Menu Based On Role
  // =========================================

  const menuItems =

    userRole === "Admin"

      ?

      [

        "Dashboard",
        "Candidates",
        "Requisitions",
        "Interviews",
        "Feedback",
        "Offers",
        "Reports",
        "Master Management",
        "User Management"

      ]

      :

      [

        "Dashboard",
        "Candidates",
        "Requisitions",
        "Interviews",
        "Feedback"

      ];


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


        {/* USER + LOGOUT */}

        <div style={styles.userSection}>


          <div style={styles.userInfo}>


            <div style={styles.userName}>

              {

                loggedInUser?.full_name ||

                "User"

              }

            </div>


            <div style={styles.roleName}>

              {

                userRole ||

                "Recruiter"

              }

            </div>

          </div>


          <button

            style={styles.logoutButton}

            onClick={() => {

              localStorage.removeItem("token");

              localStorage.removeItem("user");

              window.location.href = "/login";

            }}

          >

            Logout

          </button>

        </div>

      </div>


      {/* BODY */}
      <div style={styles.body}>


        {/* SIDEBAR */}
        <div style={styles.sidebar}>


          {

            menuItems.map((item) => (

              <button

                key={item}

                style={styles.menuButton}

                onClick={() => {

                  if (item === "Candidates") {

                    navigate("/candidates");

                  }

                  else if (

                    item === "User Management"

                  ) {

                    navigate("/users");

                  }

                  else if (

                    item === "Requisitions"

                  ) {

                    navigate("/requisitions");

                  }
                  else if (

                  item === "Master Management"

                ) {

  navigate("/masters");

                    }

                }}

              >

                {item}

              </button>

            ))

          }

        </div>


        {/* MAIN CONTENT */}
        <div style={styles.mainContent}>


          <div style={styles.pageTitle}>
            Recruitment Dashboard
          </div>


          {/* DASHBOARD CARDS */}
          <div style={styles.cardContainer}>


            <div style={styles.card}>

              <div style={styles.cardTitle}>
                Open Requisitions
              </div>

              <div style={styles.cardValue}>
                24
              </div>

            </div>


            <div style={styles.card}>

              <div style={styles.cardTitle}>
                Candidates
              </div>

              <div style={styles.cardValue}>
                138
              </div>

            </div>


            <div style={styles.card}>

              <div style={styles.cardTitle}>
                Interviews Today
              </div>

              <div style={styles.cardValue}>
                12
              </div>

            </div>


            <div style={styles.card}>

              <div style={styles.cardTitle}>
                Offers Released
              </div>

              <div style={styles.cardValue}>
                7
              </div>

            </div>

          </div>


          {/* DASHBOARD PANEL */}
          <div style={styles.dashboardPanel}>


            <div style={styles.panelHeader}>
              ATS Workspace
            </div>


            <div style={styles.panelBody}>
              ATS modules and dashboards will appear here.
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

    color: "white",

    fontWeight: "600",

    fontSize: "14px"

  },

  roleName: {

    fontSize: "12px",

    color: "#d1d5db"

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

    fontSize: "28px",

    fontWeight: "600",

    marginBottom: "25px",

    color: "#1f2937"

  },

  cardContainer: {

    display: "grid",

    gridTemplateColumns: "repeat(4, 1fr)",

    gap: "20px",

    marginBottom: "30px"

  },

  card: {

    background: "white",

    padding: "25px",

    borderRadius: "14px",

    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"

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

    fontSize: "18px"

  },

  panelBody: {

    padding: "30px",

    color: "#777"

  }

};

export default Home;