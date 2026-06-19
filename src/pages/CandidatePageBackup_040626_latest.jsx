import { useState, useEffect } from "react";
import API from "../api/axios";
import {
  FaUserPlus,
  FaSearch,
  FaUserCheck,
  FaUsers,
  FaHandshake,
  FaFileSignature,
  FaCheckCircle
} from "react-icons/fa";
function CandidatePage() {

  const candidateStatuses = [

    "To be screened",
    "Screen Select",
    "Screen Reject",
    "L1 Interview",
    "L1 Interview Reject",
    "Managerial Interview",
    "Managerial Interview Reject",
    "Client Interview",
    "Client Interview Reject",
    "HR Interview",
    "HR Interview Select",
    "To be offered",
    "Offered",
    "Offer accepted",
    "Offer declined",
    "Position abort",
    "Candidate abort",
    "Joined",
    "Bank",
    "On hold",

  ];


  const [formData, setFormData] = useState({

    first_name: "",
    last_name: "",
    email_id: "",
    pan_number: "",
    mobile_number: "",
    primary_skill: "",
    total_experience: "",
    candidate_status: "Applied",
    req_id: "",
    source_type: "LinkedIn",
    ats_stage: "Applied",
    remarks: "",

  });

  const [resumeFile, setResumeFile] = useState(null);

  const [existingResume, setExistingResume] =
    useState("");

  const [candidates, setCandidates] = useState([]);

  const [requisitions, setRequisitions] =
  useState([]);

  const [searchText, setSearchText] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [editCandidateId, setEditCandidateId] =
    useState(null);
  const [pipelineData, setPipelineData] = useState([]);

  const [dashboard, setDashboard] = 
  useState({});
  
  const [selectedPeriod, setSelectedPeriod] =
  useState("month");

  const [funnelData, setFunnelData] = useState([]);

   // =========================================
  // Logged In User
  // =========================================

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  const roleName =
    user?.role_name;


  // =========================================
// Funnel Icons
// =========================================

const stageIcons = {
  "Applied": <FaUserPlus />,
  "Screening": <FaSearch />,
  "L1 Interview": <FaUserCheck />,
  "L2 Interview": <FaUsers />,
  "Client Interview": <FaHandshake />,
  "Offer": <FaFileSignature />,
  "Joined": <FaCheckCircle />
};

// =========================================
// Funnel Colors
// =========================================

const stageColors = {
  "Applied": "#2563eb",
  "Screening": "#7c3aed",
  "L1 Interview": "#0891b2",
  "L2 Interview": "#0284c7",
  "Client Interview": "#f59e0b",
  "Offer": "#ea580c",
  "Joined": "#16a34a"
};

  /* =========================================
     FETCH CANDIDATES
  ========================================= */

  const fetchCandidates = async () => {

  try {

    let response;

    if (roleName === "Recruiter") {

      response =
        await API.get(
          "/my-candidates-list"
        );

    }

    else {

      response =
        await API.get(
          "/candidates"
        );

    }

    setCandidates(
      response.data.data
    );

  }

  catch (error) {

    console.log(error);

  }

};
  useEffect(() => {

  fetchCandidates();

  fetchRequisitions();

  fetchPipelineData();

  fetchDashboardSummary(
    selectedPeriod
  );
  fetchFunnelData();

}, [selectedPeriod]);
  
  /* =========================================
   FETCH REQUISITIONS
========================================= */

const fetchRequisitions = async () => {

  try {

    const response =
      await API.get("/requisitions");

    setRequisitions(response.data.data);

  }

  catch (error) {

    console.error(error);

  }

};

// =========================================
// Fetch Pipeline Data
// =========================================

const fetchPipelineData = async () => {

  try {

    const response =
      await API.get(

        "/pipeline-details"

      );

    setPipelineData(

      response.data.data

    );

  }

  catch (error) {

    console.log(error);

    alert(

      "Error Fetching Pipeline Data"

    );

  }

};

// =========================================
// Fetch Dashboard Summary
// =========================================

const fetchDashboardSummary =
async (
  period = selectedPeriod
) => {

  try {

    const response =
      await API.get(
  `/dashboard-summary?period=${period}`
);
    console.log(
  "Dashboard Response:",
  response.data
  );

    setDashboard(

      response.data.data

    );

  }

  catch (error) {

    console.log(error);

    alert(

      "Error Fetching Dashboard Summary"

    );

  }

};

// =========================================
// Fetch Funnel Data
// =========================================

const fetchFunnelData = async () => {

  try {

    const response =
      await API.get(
        "/dashboard-funnel"
      );

    console.log(
      "Funnel Response:",
      response.data
    );

    setFunnelData(
      response.data.data
    );

  }

  catch (error) {

    console.error(
      "Funnel Fetch Error",
      error
    );

    alert(
      "Error Fetching Funnel Data"
    );

  }

};
  /* =========================================
     HANDLE FORM CHANGE
  ========================================= */

  const handleChange = (e) => {

    setFormData({

      ...formData,
      [e.target.name]: e.target.value

    });

  };


  /* =========================================
     CLEAR FORM
  ========================================= */

  const clearForm = () => {

    setFormData({

      first_name: "",
      last_name: "",
      email_id: "",
      pan_number: "",
      mobile_number: "",
      primary_skill: "",
      total_experience: "",
      candidate_status: "To be screened"

    });

    setResumeFile(null);

    setExistingResume("");

    setEditMode(false);

    setEditCandidateId(null);

  };


  /* =========================================
     SAVE / UPDATE
  ========================================= */

  const handleSubmit = async () => {
  const confirmSave = window.confirm(

    editMode

      ? "Are you sure you want to update this candidate?"

      : "Are you sure you want to save this candidate?"

  );

  if (!confirmSave) {

    return;

  }
    try {
      // =====================================
    // PAN Mandatory Validation
    // =====================================

    if (!formData.pan_number?.trim()) {

      alert("PAN Number is mandatory");

      return;

    }
  const panNumber =
  formData.pan_number
    .trim()
    .toUpperCase();

const panRegex =
  /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

if (!panRegex.test(panNumber)) {

  alert(
    "Invalid PAN Format. Example: ABCDE1234F"
  );

  return;

}
      console.log(formData);
      const data = new FormData();

      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("email_id", formData.email_id);
      data.append("pan_number",formData.pan_number);
      data.append("mobile_number", formData.mobile_number);
      data.append("primary_skill", formData.primary_skill);

      data.append(
        "total_experience",
        formData.total_experience
      );

      data.append("relevant_experience", "5");
      data.append("current_company", "IGS");
      data.append("current_ctc", "1000000");
      data.append("expected_ctc", "1200000");
      data.append("notice_period", "30");
      data.append("current_location", "Bangalore");
      data.append("preferred_location", "Bangalore");
      data.append("secondary_skill", "Node.js");
      data.append("linkedin_url", "https://linkedin.com");
      data.append("source_channel", "LinkedIn");

      data.append(
        "candidate_status",
        formData.candidate_status
      );
      data.append(
      "req_id",
        formData.req_id || ""
      );

      data.append(
        "ats_stage",
        formData.ats_stage || "Applied"
      );

      data.append(
        "source_type",
        "ATS"
      );
      data.append("remarks", "ATS UI Test");
      data.append("created_by", "admin");

      if (resumeFile) {

        data.append("resume", resumeFile);

      }


      /* =====================================
   UPDATE MODE
===================================== */

if (editMode) {

  console.log("ATS UPDATE");

  console.log({

    candidate_status:
      formData.candidate_status,

    ats_stage:
      formData.ats_stage,

    req_id:
      formData.req_id

  });

  await API.put(

    `/candidate/${editCandidateId}`,

    data,

    {

      headers: {

        "Content-Type":
          "multipart/form-data"

      }

    }

  );

  // =====================================
  // Candidate Was Not Previously Mapped
  // Create Mapping
  // =====================================

  if (

    formData.req_id &&

    !formData.map_id

  ) {

    await API.post(

      "/map-existing-candidate",

      {

        candidate_id:
          editCandidateId,

        req_id:
          formData.req_id,

          stage_name:
          formData.ats_stage ||

          "Applied",

        source_type:
          formData.source_type ||

          "LinkedIn",

        remarks:
          formData.remarks || ""

      }

    );

  }

  // =====================================
  // Existing Mapping
  // Update ATS Stage
  // =====================================

  /*
  if (

    formData.req_id &&

    formData.map_id

  ) {

    await API.put(

      `/update-ats-stage/${formData.map_id}`,

      {

        req_id:
          formData.req_id,

        stage_name:
          formData.ats_stage,

        remarks:
          formData.remarks

      }

    );

  }
  */

  alert(
    "Candidate Updated Successfully!"
  );

  fetchCandidates();

  fetchPipelineData();

  clearForm();

  return;

}
      /* =====================================
         CREATE MODE
      ===================================== */

      else {

        const candidateResponse =
        await API.post(

         "/candidate",

        data,

      {

      headers: {

          "Content-Type":
          "multipart/form-data"

      }

    }

  );
      // =====================================
      // Candidate ↔ Req Mapping
      // =====================================

      if (formData.req_id) {

      await API.post(

    "/candidate-req-map",

    {

      candidate_id:
        candidateResponse.data.data
          .candidate_id,

      req_id:
        formData.req_id,

      recruiter_id:
        formData.recruiter_id,

      stage_name:
        formData.ats_stage,

      source_type:
        formData.source_type,

      remarks:
        formData.remarks

    }

  );

}

        alert("Candidate Saved Successfully!");

      }

      fetchCandidates();

      clearForm();

    }

    catch (error) {

  console.log("FULL ERROR:");

  console.log(error);

  if (error.response) {

    console.log(error.response.data);

  }

  alert("Error Saving Candidate");

}

  };

/* =========================================
   EDIT CANDIDATE
========================================= */

const handleEdit = async (candidate) => {

  try {

    console.log("EDIT CLICKED");
    console.log(candidate);

    const response =
      await API.get(

        `/candidate-full-details/${candidate.candidate_id}`

      );

    const data =
      response.data.data;

    console.log("FULL DETAILS");
    console.log(data);

    setEditMode(true);

    setEditCandidateId(
      data.candidate_id
    );

    setFormData({

      first_name:
        data.first_name || "",

      last_name:
        data.last_name || "",

      email_id:
        data.email_id || "",
      pan_number:
      data.pan_number || "",

      mobile_number:
        data.mobile_number || "",

      primary_skill:
        data.primary_skill || "",

      total_experience:
        data.total_experience || "",

      candidate_status:
        data.candidate_status ||
        "To be screened",

      req_id:
        data.req_id || "",

      ats_stage:
        data.stage_name || "Applied",

      source_type:
        data.source_type || "",

      remarks:
        data.remarks || "",

      map_id:
        data.map_id || ""

    });

  }

  catch (error) {

    console.log("EDIT ERROR");
    console.log(error);

    alert(
      "Error Fetching Candidate Details"
    );

  }

};

  /* =========================================
     SEARCH FILTER
  ========================================= */

  const filteredCandidates = candidates.filter(
    (candidate) => {

      const search = searchText.toLowerCase();

      return (

        candidate.first_name
          ?.toLowerCase()
          .includes(search)

        ||

        candidate.last_name
          ?.toLowerCase()
          .includes(search)

        ||

        candidate.email_id
          ?.toLowerCase()
          .includes(search)

        ||

        candidate.primary_skill
          ?.toLowerCase()
          .includes(search)

        ||

        candidate.candidate_code
          ?.toLowerCase()
          .includes(search)

      );

    }
  );


  return (

    <div style={styles.page}>

      <div style={styles.header}>
        ATS Recruitment Dashboard
      </div>
      <div
  style={{
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }}
>
  <span
    style={{
      fontWeight: "600",
      color: "#374151"
    }}
  >
    Period
  </span>

  <select
    value={selectedPeriod}
    onChange={(e) =>
      setSelectedPeriod(
        e.target.value
      )
    }
    style={{
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      background: "white"
    }}
  >

    <option value="today">
      Today
    </option>

    <option value="week">
      This Week
    </option>

    <option value="month">
      This Month
    </option>

    <option value="quarter">
      This Quarter
    </option>

    <option value="year">
      This Year
    </option>

  </select>

</div>

      {/* =====================================
          FORM
          ===================================== */}
      {/* =====================================
          DASHBOARD CARDS
          ===================================== */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "25px"
  }}
>

  {/* Total Candidates */}

  <div
    style={{
      background: "#eff6ff",
      border: "1px solid #dbeafe",
      borderRadius: "10px",
      padding: "14px 18px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    <div
      style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#1e40af"
      }}
    >
      👥 Total Candidates
    </div>

    <div
  style={{
    fontSize: "26px",
    fontWeight: "700",
    color: "#1e40af"
  }}
>
  {dashboard.total_candidates || 0}
</div>

  </div>

  {/* Pipeline Records */}

  <div
    style={{
      background: "#f5f3ff",
      border: "1px solid #e9d5ff",
      borderRadius: "10px",
      padding: "14px 18px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    <div
      style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#6d28d9"
      }}
    >
      📋 Pipeline Records
    </div>

    <div
      style={{
        fontSize: "26px",
        fontWeight: "700",
        color: "#6d28d9"
      }}
    >
      {dashboard.pipeline_records || 0}
    </div>

  </div>

  {/* Joined */}

  <div
    style={{
      background: "#ecfdf5",
      border: "1px solid #bbf7d0",
      borderRadius: "10px",
      padding: "14px 18px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    <div
      style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#15803d"
      }}
    >
      ✅ Joined
    </div>

    <div
      style={{
        fontSize: "26px",
        fontWeight: "700",
        color: "#15803d"
      }}
    >
      
        {dashboard.joined || 0}
      
    </div>

  </div>

  {/* Offered */}

  <div
    style={{
      background: "#fff7ed",
      border: "1px solid #fed7aa",
      borderRadius: "10px",
      padding: "14px 18px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    <div
      style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#ea580c"
      }}
    >
      🎯 Offered
    </div>

    <div
      style={{
        fontSize: "26px",
        fontWeight: "700",
        color: "#ea580c"
      }}
    >
      
        {dashboard.offered || 0}
      
    </div>

  </div>

</div>
{/* =====================================
         RECRUITMENT FUNNEL
===================================== */}

<h2
  style={{
    marginTop: "25px",
    marginBottom: "15px",
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "600"
  }}
>
  Recruitment Funnel
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "25px"
  }}
>
  {funnelData.map((item) => (

    <div
      key={item.stage_name}
      style={{
        background:`${stageColors[item.stage_name]}08`,
        border:`1px solid ${stageColors[item.stage_name]}25`,
        borderRadius: "12px",
        padding: "12px",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        minHeight: "70px",

        boxShadow:
          "0 2px 6px rgba(0,0,0,0.05)",

        transition:
          "all 0.2s ease"
      }}
    >

      <div
  style={{
    fontSize: "20px",
    color: stageColors[item.stage_name]
  }}
>
  {stageIcons[item.stage_name]}
</div>

<div
  style={{
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "6px",
    color: "#374151",
    textAlign: "center"
  }}
>
  {item.stage_name}
</div>

<div
  style={{
    fontSize: "26px",
    fontWeight: "700",
    marginTop: "4px",
    color: stageColors[item.stage_name]
  }}
>
  {item.candidate_count}
</div>

    </div>

  ))}
</div>

<h2
  style={{
    marginBottom: "12px",
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600"
  }}
>
  Candidate Registration
</h2>
      <div style={styles.formContainer}>

        <div style={styles.row}>

          <input
            name="first_name"
            placeholder="First Name"
            style={styles.input}
            value={formData.first_name}
            onChange={handleChange}
          />

          <input
            name="last_name"
            placeholder="Last Name"
            style={styles.input}
            value={formData.last_name}
            onChange={handleChange}
          />

        </div>


        <div style={styles.row}>

          <input
            name="email_id"
            placeholder="Email"
            style={{
              ...styles.input,
              backgroundColor:
                editMode ? "#f3f4f6" : "white"
            }}
            value={formData.email_id}
            onChange={handleChange}
            readOnly={editMode}
          />

        <input
        name="pan_number"
        type="text"
        placeholder="PAN Number"
        value={formData.pan_number}
        onChange={(e) =>
        setFormData({
      ...formData,
        pan_number:
        e.target.value.toUpperCase()
          })
        }
      readOnly={editMode}
      style={{
      ...styles.input,
      backgroundColor:
      editMode ? "#f3f4f6" : "white"
        }}

        />
          <input
            name="mobile_number"
            placeholder="Mobile"
            style={styles.input}
            value={formData.mobile_number}
            onChange={handleChange}
          />

        </div>


        <div style={styles.row}>

          <input
            name="primary_skill"
            placeholder="Primary Skill"
            style={styles.input}
            value={formData.primary_skill}
            onChange={handleChange}
          />

          <input
            name="total_experience"
            placeholder="Experience"
            style={styles.input}
            value={formData.total_experience}
            onChange={handleChange}
          />

        </div>


        {/* CANDIDATE STATUS */}

<div style={styles.row}>

  <input
    value={formData.candidate_status}
    readOnly
    style={{
      ...styles.input,
      backgroundColor: "#f3f4f6",
      cursor: "not-allowed"
    }}
  />

</div>
        {/* =====================================
         ATS WORKFLOW SECTION
        ===================================== */}

        <div style={styles.row}>


        {/* REQUISITION */}

       <select
      name="req_id"
      style={styles.input}
      value={formData.req_id}
      onChange={handleChange}
     >

      <option value="">
      Select Requisition
      </option>

      {

      requisitions.map((req) => (

        <option

          key={req.req_id}

          value={req.req_id}

        >

          {req.req_code} - {req.job_title}

        </option>

      ))

    }

  </select>


  {/* SOURCE TYPE */}

  <select
    name="source_type"
    style={styles.input}
    value={formData.source_type}
    onChange={handleChange}
  >

    <option value="LinkedIn">
      LinkedIn
    </option>

    <option value="Naukri">
      Naukri
    </option>

    <option value="Referral">
      Referral
    </option>

    <option value="Career Portal">
      Career Portal
    </option>

  </select>

</div>


<div style={styles.row}>


  {/* ATS STAGE */}

  <select
    name="ats_stage"
    style={styles.input}
    value={formData.ats_stage}
    onChange={handleChange}
  >

    <option value="Applied">
      Applied
    </option>

    <option value="Screening">
      Screening
    </option>

    <option value="L1 Interview">
      L1 Interview
    </option>

    <option value="L2 Interview">
      L2 Interview
    </option>

    <option value="Client Interview">
      Client Interview
    </option>

    <option value="Offer">
      Offer
    </option>

    <option value="Joined">
      Joined
    </option>

    <option value="Rejected">
      Rejected
    </option>

  </select>


  {/* REMARKS */}

  <input
    name="remarks"
    placeholder="Remarks"
    style={styles.input}
    value={formData.remarks}
    onChange={handleChange}
  />

</div>

        {/* =====================================
            RESUME SECTION
        ===================================== */}

        <div style={styles.row}>

          <div style={{ width: "100%" }}>

            {

              editMode && existingResume && (

                <div style={styles.resumePreview}>

                  Current Resume:

                  <a
                    href={existingResume}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.resumeLink}
                  >
                    View Resume
                  </a>

                </div>

              )

            }

            <input
              type="file"
              style={styles.input}

              onChange={(e) =>
                setResumeFile(e.target.files[0])
              }

            />

          </div>

        </div>


        {/* =====================================
            BUTTONS
        ===================================== */}

        <div style={styles.buttonRow}>

          <button
            style={styles.button}
            onClick={handleSubmit}
          >

            {editMode
              ? "Update Candidate"
              : "Save Candidate"}

          </button>

          {editMode && (

            <button
              style={styles.cancelButton}
              onClick={clearForm}
            >
              Cancel
            </button>

          )}

        </div>

      </div>


      {/* =====================================
          SEARCH
      ===================================== */}

      <div style={styles.searchContainer}>

        <input

          type="text"

          placeholder="Search candidate by ID, name, email, skill..."

          style={styles.searchInput}

          value={searchText}

          onChange={(e) =>
            setSearchText(e.target.value)
          }

        />

      </div>


      {/* =====================================
          TABLE
      ===================================== */}

      <div style={styles.tableContainer}>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>Candidate ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Mobile</th>
              <th style={styles.th}>Skill</th>
              <th style={styles.th}>Experience</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Resume</th>
              <th style={styles.th}>Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredCandidates.map((candidate) => (

              <tr key={candidate.candidate_id}>

                <td style={styles.tdCode}>
                  {candidate.candidate_code}
                </td>

                <td style={styles.td}>
                  {candidate.first_name}
                  {" "}
                  {candidate.last_name}
                </td>

                <td style={styles.td}>
                  {candidate.email_id}
                </td>

                <td style={styles.td}>
                  {candidate.mobile_number}
                </td>

                <td style={styles.td}>
                  {candidate.primary_skill}
                </td>

                <td style={styles.td}>
                  {candidate.total_experience}
                </td>

                <td style={styles.td}>
                  {candidate.candidate_status}
                </td>

                <td style={styles.td}>

                  {candidate.resume_path ? (

                    <a
                      href={candidate.resume_path}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.resumeLink}
                    >
                      View Resume
                    </a>

                  ) : (

                    "No Resume"

                  )}

                </td>

                <td style={styles.td}>

                  <button
                    style={styles.editButton}
                    onClick={() =>
                      handleEdit(candidate)
                    }
                  >
                    Edit
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    {/* =====================================
PIPELINE DASHBOARD
===================================== */}

<div style={styles.pipelineContainer}>

  <div style={styles.pipelineTitle}>
    Recruiter Pipeline Dashboard
  </div>

  <table style={styles.table}>

    <thead>

      <tr>

        <th style={styles.th}>
          Candidate
        </th>

        <th style={styles.th}>
          Candidate Code
        </th>

        <th style={styles.th}>
          Requisition
        </th>

        <th style={styles.th}>
        Client
        </th>

        <th style={styles.th}>
        Project
        </th>

        <th style={styles.th}>
          ATS Stage
        </th>

        <th style={styles.th}>
          Source
        </th>

        <th style={styles.th}>
          Recruiter
        </th>

        <th style={styles.th}>
          Applied Date
        </th>

      </tr>

    </thead>

    <tbody>

      {

        pipelineData.map((item) => (

          <tr key={item.map_id}>

            <td style={styles.td}>
              {item.first_name} {item.last_name}
            </td>

            <td style={styles.td}>
              {item.candidate_code}
            </td>

            <td style={styles.td}>
              {item.req_code}
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {item.job_title}
            </div>
            </td>
            <td style={styles.td}>
              {item.client_name}
            </td>

        <   td style={styles.td}>
            {item.project_name}
          </td>
            <td style={styles.td}>

              <span style={{

                padding: "6px 12px",

                borderRadius: "20px",

                backgroundColor:
                  item.stage_name === "Applied"
                  ? "#dbeafe"
                  : "#dcfce7",

                color:
                  item.stage_name === "Applied"
                  ? "#1d4ed8"
                  : "#166534",

                fontWeight: "600"

              }}>

                {item.stage_name}

              </span>

            </td>

            <td style={styles.td}>
              {item.source_type}
            </td>

            <td style={styles.td}>
              {item.recruiter_id}
            </td>

            <td style={styles.td}>

              {

                new Date(

                  item.applied_date

                ).toLocaleDateString()

              }

            </td>

          </tr>

        ))

      }

    </tbody>

  </table>

    </div>

    </div>

  );

}


/* =========================================
   STYLES
========================================= */

const styles = {

  page: {
    padding: "24px",
    background: "#f3f4f6",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: "1600px",
    margin: "0 auto"
  },

  header: {
    fontSize: "32px",
    fontWeight: "600",
    marginBottom: "24px",
    color: "#111827"
  },

  formContainer: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
  },

  row: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px"
  },

  input: {
    flex: 1,
    height: "42px",
    padding: "0 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    background: "#ffffff"
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px"
  },

  button: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600"
  },

  cancelButton: {
    background: "#6b7280",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600"
  },

  editButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600"
  },

  searchContainer: {
    marginBottom: "16px"
  },

  searchInput: {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    background: "#ffffff",
    outline: "none"
  },

  resumePreview: {
    marginBottom: "10px",
    fontSize: "13px",
    color: "#374151",
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },

  resumeLink: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none"
  },

  tableContainer: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
  },

  pipelineContainer: {
    marginTop: "30px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
  },

  pipelineTitle: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#111827"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    textAlign: "left",
    padding: "12px 14px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827"
  },

  tdCode: {
    padding: "12px 14px",
    borderBottom: "1px solid #f3f4f6",
    fontWeight: "600",
    color: "#1d4ed8",
    fontSize: "14px"
  },

  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "14px",
    color: "#374151"
  }

};

export default CandidatePage;