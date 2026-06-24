import Header from "../components/Header";
import { useEffect, useState } from "react";
import API from "../api/axios";

function MasterManagementPage() {
    useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

  const [activeTab, setActiveTab] =
    useState("Clients");


  // =========================================
  // MASTER STATES
  // =========================================

  const [clients, setClients] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [hiringManagers, setHiringManagers] =
    useState([]);


  // =========================================
  // FORM STATES
  // =========================================

  const [clientName, setClientName] =
    useState("");

  const [selectedClient, setSelectedClient] =
    useState("");

  const [projectName, setProjectName] =
    useState("");

  const [selectedProject, setSelectedProject] =
    useState("");

  const [

    hiringManagerName,
    setHiringManagerName

  ] = useState("");

  const [

    hiringManagerEmail,
    setHiringManagerEmail

  ] = useState("");


  // =========================================
  // FETCH CLIENTS
  // =========================================

  const fetchClients = async () => {

    try {

      const response =
        await API.get("/clients");

      setClients(response.data.data);

    }

    catch (error) {

      console.log(error);

    }

  };


  // =========================================
  // FETCH PROJECTS
  // =========================================

  const fetchProjects = async () => {

    try {

      const response =
        await API.get("/all-projects");

      setProjects(response.data.data);

    }

    catch (error) {

      console.log(error);

    }

  };


  // =========================================
  // FETCH HIRING MANAGERS
  // =========================================

  const fetchHiringManagers =
    async () => {

      try {

        const response =
          await API.get(

            "/all-hiring-managers"

          );

        setHiringManagers(
          response.data.data
        );

      }

      catch (error) {

        console.log(error);

      }

    };


  useEffect(() => {

    fetchClients();

    fetchProjects();

    fetchHiringManagers();

  }, []);


  // =========================================
  // CREATE CLIENT
  // =========================================

  const handleCreateClient =
    async () => {

      if (!clientName.trim()) {

        alert("Please Enter Client Name");

        return;

      }

      try {

        await API.post(

          "/client",

          {

            client_name: clientName

          }

        );

        alert("Client Added Successfully");

        setClientName("");

        fetchClients();

      }

      catch (error) {

        console.log(error);

        alert(

          error.response?.data?.message ||

          "Error Creating Client"

        );

      }

    };


  // =========================================
  // CREATE PROJECT
  // =========================================

  const handleCreateProject =
    async () => {

      if (

        !selectedClient ||

        !projectName.trim()

      ) {

        alert(

          "Please Select Client And Enter Project"

        );

        return;

      }

      try {

        await API.post(

          "/project",

          {

            client_id: selectedClient,
            project_name: projectName

          }

        );

        alert("Project Added Successfully");

        setProjectName("");

        fetchProjects();

      }

      catch (error) {

        console.log(error);

      }

    };


  // =========================================
  // CREATE HIRING MANAGER
  // =========================================

  const handleCreateHiringManager =
    async () => {

      if (

        !selectedClient ||

        !selectedProject ||

        !hiringManagerName.trim()

      ) {

        alert(

          "Please Fill All Mandatory Fields"

        );

        return;

      }

      try {

        await API.post(

          "/hiring-manager",

          {

            client_id: selectedClient,
            project_id: selectedProject,

            hiring_manager_name:
              hiringManagerName,

            email_id:
              hiringManagerEmail

          }

        );

        alert(

          "Hiring Manager Added Successfully"

        );

        setHiringManagerName("");

        setHiringManagerEmail("");

        fetchHiringManagers();

      }

      catch (error) {

        console.log(error);

      }

    };


  return (

    <div style={styles.page}>

     <Header />
      {/* HEADER */}

      <div
    style={{
      padding: "30px"
    }}
  >

    {/* HEADER */}

    <div style={styles.header}>
        Master Management
      </div>
      </div>

      {/* TABS */}

      <div style={styles.tabContainer}>


        {

          [

            "Clients",
            "Projects",
            "Hiring Managers"

          ].map((tab) => (

            <button

              key={tab}

              style={

                activeTab === tab

                  ?

                  styles.activeTab

                  :

                  styles.tab

              }

              onClick={() =>

                setActiveTab(tab)

              }

            >

              {tab}

            </button>

          ))

        }

      </div>


      {/* =====================================
          CLIENTS
      ===================================== */}

      {

        activeTab === "Clients" && (

          <div style={styles.section}>


            <div style={styles.formRow}>


              <input

                type="text"

                placeholder="Client Name"

                value={clientName}

                onChange={(e) =>

                  setClientName(
                    e.target.value
                  )

                }

                style={styles.input}

              />


              <button

                style={styles.button}

                onClick={handleCreateClient}

              >

                Add Client

              </button>

            </div>


            <table style={styles.table}>


              <thead>

                <tr>

                  <th style={styles.th}>
                  Client Code
                </th>

                  <th style={styles.th}>
                   Client Name
                </th>

                </tr>

              </thead>


              <tbody>

                {

                  clients.map((client) => (

                    <tr

                      key={client.client_id}

                    >

                      <td style={styles.td}>

                      {client.client_code}

                    </td>

                      <td style={styles.td}>

                      {client.client_name}

                      </td>

                    </tr>

                  ))

                }

              </tbody>

            </table>

          </div>

        )

      }


      {/* =====================================
          PROJECTS
      ===================================== */}

      {

        activeTab === "Projects" && (

          <div style={styles.section}>


            <div style={styles.formRow}>


              <select

                value={selectedClient}

                onChange={(e) =>

                  setSelectedClient(
                    e.target.value
                  )

                }

                style={styles.input}

              >

                <option value="">
                  Select Client
                </option>

                {

                  clients.map((client) => (

                    <option

                      key={client.client_id}

                      value={client.client_id}

                    >

                      {client.client_name}

                    </option>

                  ))

                }

              </select>


              <input

                type="text"

                placeholder="Project Name"

                value={projectName}

                onChange={(e) =>

                  setProjectName(
                    e.target.value
                  )

                }

                style={styles.input}

              />


              <button

                style={styles.button}

                onClick={handleCreateProject}

              >

                Add Project

              </button>

            </div>


            <table style={styles.table}>


              <thead>

              <tr>

              <th style={styles.th}>
              Client
              </th>

              <th style={styles.th}>
              Project Code
              </th>

              <th style={styles.th}>
              Project
              </th>

              </tr>

              </thead>


              <tbody>

            {

              projects.map((project) => (

              <tr key={project.project_id}>

              <td style={styles.td}>

              {project.client_name}

              </td>

              <td style={styles.td}>

              {project.project_code}

              </td>

              <td style={styles.td}>

              {project.project_name}

              </td>

              </tr>

              ))

              }

              </tbody>

            </table>

          </div>

        )

      }


      {/* =====================================
          HIRING MANAGERS
      ===================================== */}

      {

        activeTab ===

        "Hiring Managers" && (

          <div style={styles.section}>


            <div style={styles.formRow}>


              <select

                value={selectedClient}

                onChange={(e) =>

                  setSelectedClient(
                    e.target.value
                  )

                }

                style={styles.input}

              >

                <option value="">
                  Select Client
                </option>

                {

                  clients.map((client) => (

                    <option

                      key={client.client_id}

                      value={client.client_id}

                    >

                      {client.client_name}

                    </option>

                  ))

                }

              </select>


              <select

                value={selectedProject}

                onChange={(e) =>

                  setSelectedProject(
                    e.target.value
                  )

                }

                style={styles.input}

              >

                <option value="">
                  Select Project
                </option>

                {

                  projects.map((project) => (

                    <option

                      key={project.project_id}

                      value={project.project_id}

                    >

                      {project.project_name}

                    </option>

                  ))

                }

              </select>

            </div>


            <div style={styles.formRow}>


              <input

                type="text"

                placeholder="Hiring Manager Name"

                value={hiringManagerName}

                onChange={(e) =>

                  setHiringManagerName(
                    e.target.value
                  )

                }

                style={styles.input}

              />


              <input

                type="email"

                placeholder="Email"

                value={hiringManagerEmail}

                onChange={(e) =>

                  setHiringManagerEmail(
                    e.target.value
                  )

                }

                style={styles.input}

              />


              <button

                style={styles.button}

                onClick={
                  handleCreateHiringManager
                }

              >

                Add Hiring Manager

              </button>

            </div>


            <table style={styles.table}>


              <thead>

                <tr>

            <th style={styles.th}>
            HM Code
            </th>

            <th style={styles.th}>
            Client
            </th>

            <th style={styles.th}>
            Project
            </th>

            <th style={styles.th}>
            Hiring Manager
            </th>

            <th style={styles.th}>
            Email
            </th>

            </tr>

              </thead>


              <tbody>

              {

              hiringManagers.map((hm) => (

              <tr key={hm.hiring_manager_id}>

              <td style={styles.td}>
              {hm.hiring_manager_code}
              </td>

              <td style={styles.td}>
              {hm.client_name}
              </td>

              <td style={styles.td}>
              {hm.project_name}
              </td>

              <td style={styles.td}>
              {hm.hiring_manager_name}
              </td>

              <td style={styles.td}>
              {hm.email_id}
              </td>

              </tr>

      ))

      }

          </tbody>

            </table>

          </div>

        )

      }

    </div>

  );

}


/* =========================================
   STYLES
========================================= */

const styles = {

  page: {

  background: "#f4f6f9",

  minHeight: "100vh",

  fontFamily: "Segoe UI"

},

  header: {

    fontSize: "30px",

    fontWeight: "600",

    marginBottom: "25px",

    color: "#1f2937"

  },

  tabContainer: {

    display: "flex",

    gap: "15px",

    marginBottom: "25px"

  },

  tab: {

    padding: "12px 24px",

    border: "none",

    borderRadius: "8px",

    background: "#e5e7eb",

    cursor: "pointer",

    fontWeight: "500"

  },

  activeTab: {

    padding: "12px 24px",

    border: "none",

    borderRadius: "8px",

    background: "#1f3b63",

    color: "white",

    cursor: "pointer",

    fontWeight: "500"

  },

  section: {

    background: "white",

    padding: "25px",

    borderRadius: "12px",

    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"

  },

  formRow: {

    display: "flex",

    gap: "20px",

    marginBottom: "20px"

  },

  input: {

    flex: 1,

    padding: "14px",

    borderRadius: "8px",

    border: "1px solid #ccc",

    fontSize: "15px"

  },

  button: {

    background: "#1f3b63",

    color: "white",

    border: "none",

    padding: "14px 24px",

    borderRadius: "8px",

    cursor: "pointer",

    fontSize: "15px"

  },

  table: {

    width: "100%",

    borderCollapse: "collapse"

  },

  th: {

    textAlign: "left",

    padding: "14px",

    background: "#f4f6f9",

    borderBottom: "1px solid #ddd"

  },

  td: {

    padding: "14px",

    borderBottom: "1px solid #eee"

  }

};

export default MasterManagementPage;