import { useState, useEffect } from "react";
import API from "../api/axios";
import Select from "react-select";
import Header from "../components/Header";
function CandidatePage() {

  const candidateStatuses = [

  "Applied",

  "Screening",

  "L1 Technical",

  "L1 Technical Cleared",
  "L1 Technical Rejected",
  "L1 Technical On Hold",

  "L1 Non-Technical",

  "L1 Non-Technical Cleared",
  "L1 Non-Technical Rejected",
  "L1 Non-Technical On Hold",

  "L2 Technical",

  "L2 Technical Cleared",
  "L2 Technical Rejected",
  "L2 Technical On Hold",

  "L2 Non-Technical",

  "L2 Non-Technical Cleared",
  "L2 Non-Technical Rejected",
  "L2 Non-Technical On Hold",

  "HR Round",

  "HR Cleared",
  "HR Rejected",
  "HR On Hold",

  "Client Round",

  "Client Cleared",
  "Client Rejected",
  "Client On Hold",

  "Offer",

  "Offer Accepted",
  "Offer Rejected",
  "Offer On Hold",

  "Joined"

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

  const [stageUpdates, setStageUpdates] =
  useState({});

  // =========================================
  // Logged In User
  // =========================================

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  const roleName =
    user?.role_name;


  

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

}, []);
  
  /* =========================================
   FETCH REQUISITIONS
========================================= */

const fetchRequisitions = async () => {

  try {

    let response;

    if (roleName === "Recruiter") {

      response =
        await API.get(
          "/my-requisitions"
        );

    }

    else {

      response =
        await API.get(
          "/requisitions"
        );

    }

    setRequisitions(
      response.data.data
    );

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
// Quick ATS Stage Update
// =========================================

const updatePipelineStage = async (

  mapId,

  stageName

) => {

  const confirmUpdate = window.confirm(

    `Are you sure you want to move candidate to "${stageName}" stage?`

  );

  if (!confirmUpdate) {

    return;

  }

  try {

    await API.put(

      `/update-ats-stage/${mapId}`,

      {

        stage_name:
          stageName,

        remarks: ""

      }

    );

    fetchPipelineData();

    fetchCandidates();

    alert(

      "Candidate status has been changed successfully."

    );

  }

  catch (error) {

    console.log(error);

    alert(

      "Error Updating Candidate Status"

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
      remarks: "",
      source_type: ""

    });

     setResumeFile(null);

  setExistingResume("");

  setEditMode(false);

  setEditCandidateId(null);

  const fileInput =
    document.getElementById(
      "resumeFile"
    );

  if (fileInput) {
    fileInput.value = "";
  }

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

if (

  formData.req_id &&

  formData.map_id

) {

  await API.put(

    `/update-ats-stage/${formData.map_id}`,

    {

      stage_name:
        formData.ats_stage,

      remarks:
        formData.remarks

    }

  );

}
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

    setExistingResume(
  data.resume_path || ""
);

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

  <div>

    <Header
      userName={localStorage.getItem("full_name")}
      roleName={localStorage.getItem("role_name")}
    />

    <div style={styles.page}>

      <h2
        style={{
          marginBottom: "12px",
          color: "#1f2937",
          fontSize: "20px",
          fontWeight: "600"
        }}
      >
        Talent Registration
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


      {/* =====================================
         ATS WORKFLOW SECTION
        ===================================== */}

        <div style={styles.row}>


        {/* REQUISITION */}

<Select

  placeholder="Search Requisition..."

  options={

    requisitions.map((req) => ({

      value: req.req_id,

      label:
        `${req.req_code} - ${req.job_title}`

    }))

  }

  value={

    requisitions

      .filter(

        (req) =>

          String(req.req_id) ===
          String(formData.req_id)

      )

      .map((req) => ({

        value: req.req_id,

        label:
          `${req.req_code} - ${req.job_title}`

      }))[0] || null

  }

  onChange={(selected) =>

    setFormData({

      ...formData,

      req_id:
        selected?.value || ""

    })

  }

  isClearable

/>

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
            id="resumeFile"
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
  {
    candidate.candidate_status ||
    candidate.stage_name ||
    "-"
  }
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

  <select

    value={item.stage_name}

    onChange={(e) =>

      updatePipelineStage(

        item.map_id,

        e.target.value

      )

    }

    style={{

      padding: "6px",

      borderRadius: "6px",

      border:
        "1px solid #d1d5db",

      minWidth: "180px"

    }}

  >

    {

      candidateStatuses.map(

        (status) => (

          <option

            key={status}

            value={status}

          >

            {status}

          </option>

        )

      )

    }

  </select>

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