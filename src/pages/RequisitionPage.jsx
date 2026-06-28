import { useState } from "react";
import Header from "../components/Header";
import useRequisitionManagement from "../hooks/useRequisitionManagement";

function RequisitionPage() {
  const {
    loggedInUser,
    requisitions,
    clients,
    projects,
    hiringManagers,
    recruiters,
    assignedRecruiters,
    selectedReqId,
    selectedRecruiter,
    showAssignModal,
    setRequisitionManagementUi,
    loadRequisitionFormProjects,
    loadRequisitionFormHiringManagers,
    loadAssignedRecruiters,
    createRequisitionFromForm,
    assignRecruiterOnRequisition,
    removeRecruiterFromRequisition
  } = useRequisitionManagement();

  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "",
    project_id: "",
    project_name: "",
    job_title: "",
    job_description: "",
    primary_skill: "",
    secondary_skill: "",
    experience_min: "",
    experience_max: "",
    openings_count: 1,
    work_location: "",
    employment_type: "",
    priority_level: "",
    req_status: "Open",
    recruiter_id: loggedInUser?.employee_code || "",
    hiring_manager_id: "",
    hiring_manager: "",
    target_date: "",
    created_by: loggedInUser?.full_name || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "client_id") {
      const selectedClient =
        clients.find(
          (client) => client.client_id === parseInt(value, 10)
        );

      setFormData((prev) => ({
        ...prev,
        client_id: value,
        client_name: selectedClient?.client_name || "",
        project_id: "",
        project_name: "",
        hiring_manager_id: "",
        hiring_manager: ""
      }));

      loadRequisitionFormProjects(value);
      return;
    }

    if (name === "project_id") {
      const selectedProject =
        projects.find(
          (project) => project.project_id === parseInt(value, 10)
        );

      setFormData((prev) => ({
        ...prev,
        project_id: value,
        project_name: selectedProject?.project_name || "",
        hiring_manager_id: "",
        hiring_manager: ""
      }));

      loadRequisitionFormHiringManagers(value);
      return;
    }

    if (name === "hiring_manager_id") {
      const selectedHM =
        hiringManagers.find(
          (hm) => hm.hiring_manager_id === parseInt(value, 10)
        );

      setFormData((prev) => ({
        ...prev,
        hiring_manager_id: value,
        hiring_manager: selectedHM?.hiring_manager_name || ""
      }));
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCreateRequisition = async () => {
    if (
      !formData.client_name.trim() ||
      !formData.job_title.trim() ||
      !formData.primary_skill.trim() ||
      !formData.work_location.trim() ||
      !formData.employment_type ||
      !formData.priority_level ||
      !formData.target_date
    ) {
      alert("Please fill all mandatory fields");
      return;
    }

    try {
      await createRequisitionFromForm(formData);
      alert("Requisition Created Successfully!");

      setFormData({
        client_name: "",
        project_name: "",
        job_title: "",
        job_description: "",
        primary_skill: "",
        secondary_skill: "",
        experience_min: "",
        experience_max: "",
        openings_count: 1,
        work_location: "",
        employment_type: "",
        priority_level: "",
        req_status: "Open",
        recruiter_id: loggedInUser?.employee_code || "",
        hiring_manager: "",
        target_date: "",
        created_by: loggedInUser?.full_name || ""
      });
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
        "Error Creating Requisition"
      );
    }
  };

  const handleAssignRecruiter = async () => {
    try {
      await assignRecruiterOnRequisition(selectedReqId, selectedRecruiter);
      alert("Recruiter Assigned Successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Assignment Failed"
      );
    }
  };

  const handleRemoveRecruiter = async (assignmentId) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to remove this recruiter from the requisition?"
      );

    if (!confirmDelete) return;

    try {
      await removeRecruiterFromRequisition(assignmentId, selectedReqId);
      alert("Recruiter Removed Successfully");
    } catch (error) {
      console.log(error);
      alert("Error Removing Recruiter");
    }
  };

  const openAssignModal = (reqId) => {
    setRequisitionManagementUi({
      selectedReqId: reqId,
      showAssignModal: true
    });
    loadAssignedRecruiters(reqId);
  };

  return (
  <div>
    <Header
      userName={localStorage.getItem("full_name")}
      roleName={localStorage.getItem("role_name")}
    />

    <div style={styles.page}>
      <div style={styles.header}>
        Talent Demand Request
      </div>

  <div style={styles.formContainer}>
  <div style={styles.row}>
    <select
      name="client_id"
      style={styles.input}
      value={formData.client_id}
      onChange={handleChange}
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
      name="project_id"
      style={styles.input}
      value={formData.project_id}
      onChange={handleChange}
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

        <div style={styles.row}>
          <input
            name="job_title"
            placeholder="Job Title *"
            style={styles.input}
            value={formData.job_title}
            onChange={handleChange}
          />

          <input
            name="primary_skill"
            placeholder="Primary Skill *"
            style={styles.input}
            value={formData.primary_skill}
            onChange={handleChange}
          />
        </div>

        <div style={styles.row}>
          <input
            name="secondary_skill"
            placeholder="Secondary Skill"
            style={styles.input}
            value={formData.secondary_skill}
            onChange={handleChange}
          />

          <input
            type="number"
            name="openings_count"
            placeholder="Openings Count"
            style={styles.input}
            value={formData.openings_count}
            onChange={handleChange}
          />
        </div>

        <div style={styles.row}>
          <input
            type="number"
            name="experience_min"
            placeholder="Min Experience"
            style={styles.input}
            value={formData.experience_min}
            onChange={handleChange}
          />

          <input
            type="number"
            name="experience_max"
            placeholder="Max Experience"
            style={styles.input}
            value={formData.experience_max}
            onChange={handleChange}
          />
        </div>

        <div style={styles.row}>
          <input
            name="work_location"
            placeholder="Work Location *"
            style={styles.input}
            value={formData.work_location}
            onChange={handleChange}
          />

          <select
  name="hiring_manager_id"
  style={styles.input}
  value={formData.hiring_manager_id}
  onChange={handleChange}
>
  <option value="">
    Select Hiring Manager
  </option>
  {
    hiringManagers.map((hm) => (
      <option
        key={hm.hiring_manager_id}
        value={hm.hiring_manager_id}
      >
        {hm.hiring_manager_name}
      </option>
    ))
  }
</select>
        </div>

        <div style={styles.row}>
          <select
            name="employment_type"
            style={styles.input}
            value={formData.employment_type}
            onChange={handleChange}
          >
            <option value="">
              Select Employment Type
            </option>
            <option value="Full Time">
              Full Time
            </option>
            <option value="Contract">
              Contract
            </option>
            <option value="Intern">
              Intern
            </option>
          </select>

          <select
            name="priority_level"
            style={styles.input}
            value={formData.priority_level}
            onChange={handleChange}
          >
            <option value="">
              Select Priority
            </option>
            <option value="High">
              High
            </option>
            <option value="Medium">
              Medium
            </option>
            <option value="Low">
              Low
            </option>
          </select>
        </div>

        <div style={styles.row}>
          <input
            type="date"
            name="target_date"
            style={styles.input}
            value={formData.target_date}
            onChange={handleChange}
          />
        </div>

        <div style={styles.row}>
          <textarea
            name="job_description"
            placeholder="Job Description"
            style={styles.textarea}
            value={formData.job_description}
            onChange={handleChange}
          />
        </div>

        <button
          style={styles.button}
          onClick={handleCreateRequisition}
        >
          Create Requisition
        </button>
      </div>

<div style={styles.tableContainer}>
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>Req Code</th>
        <th style={styles.th}>Client</th>
        <th style={styles.th}>Job Title</th>
        <th style={styles.th}>Skills</th>
        <th style={styles.th}>Openings</th>
        <th style={styles.th}>Priority</th>
        <th style={styles.th}>Status</th>
        <th style={styles.th}>Location</th>
        <th style={styles.th}>Recruiters</th>
      </tr>
    </thead>
    <tbody>
      {
        requisitions.map((req) => (
          <tr key={req.req_id}>
            <td style={styles.td}>
              {req.req_code}
            </td>
            <td style={styles.td}>
              {req.client_name}
            </td>
            <td style={styles.td}>
              {req.job_title}
            </td>
            <td style={styles.td}>
              {req.primary_skill}
            </td>
            <td style={styles.td}>
              {req.openings_count}
            </td>
            <td style={styles.td}>
              {req.priority_level}
            </td>
            <td style={styles.td}>
              {req.req_status}
            </td>
            <td style={styles.td}>
              {req.work_location}
            </td>
            <td style={styles.td}>
  <span
    onClick={() => openAssignModal(req.req_id)}
    style={{
      color: "#2563eb",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    Manage
  </span>
</td>
          </tr>
        ))
      }
    </tbody>
  </table>
</div>

{showAssignModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999
    }}
  >
    <div
      style={{
        background: "#fff",
        width: "500px",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
      }}
    >
      <h3>
        Assign Recruiter
      </h3>

      <select
        value={selectedRecruiter}
        onChange={(e) =>
          setRequisitionManagementUi({
            selectedRecruiter: e.target.value
          })
        }
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px"
        }}
      >
        <option value="">
          Select Recruiter
        </option>
        {
          recruiters.map((r) => (
            <option
              key={r.employee_code}
              value={r.employee_code}
            >
              {r.full_name}
              {" "}
              ({r.employee_code})
            </option>
          ))
        }
      </select>

      <h4>
        Assigned Recruiters
      </h4>

      {
        assignedRecruiters.map((r) => (
    <div
      key={r.map_id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
        padding: "10px",
        background: "#f3f4f6",
        borderRadius: "6px"
      }}
    >
      <span>
        ✓ {r.full_name}
        {" "}
        ({r.employee_code})
      </span>

      <button
        onClick={() =>
          handleRemoveRecruiter(
            r.map_id
          )
        }
        style={{
          background: "#ef4444",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px"
        }}
      >
        Remove
      </button>
    </div>
  ))
}

<div
  style={{
    marginTop: "20px"
  }}
>
  <button
    onClick={handleAssignRecruiter}
    style={{
      background: "#16a34a",
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: "6px",
      marginRight: "10px",
      cursor: "pointer"
    }}
  >
    Assign Recruiter
  </button>

  <button
    onClick={() =>
      setRequisitionManagementUi({
        showAssignModal: false
      })
    }
    style={{
      padding: "10px 18px",
      cursor: "pointer"
    }}
  >
    Close
  </button>
</div>
    </div>
  </div>
)}

</div>
</div>
  );
}

const styles = {
  page: {
    padding: "20px 30px 30px 30px",
    background: "#f4f6f9",
    minHeight: "100vh",
    fontFamily: "Segoe UI"
  },
  header: {
  fontSize: "22px",
  fontWeight: "600",
  marginBottom: "20px",
  color: "#1f2937"
},
  formContainer: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  row: {
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
  textarea: {
    width: "100%",
    minHeight: "120px",
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
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid #ddd",
    background: "#f4f6f9"
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #eee"
  }
};

export default RequisitionPage;
