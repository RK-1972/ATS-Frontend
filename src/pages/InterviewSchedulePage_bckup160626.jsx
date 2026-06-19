import { useEffect, useState } from "react";
import API from "../api/axios";
import Select from "react-select";

function InterviewSchedulePage() {

  const [candidates, setCandidates] =
    useState([]);
  
  const [requisitions, setRequisitions] =
  useState([]);

  const [interviewers, setInterviewers] =
    useState([]);

  const [schedules, setSchedules] =
    useState([]);

  const [formData, setFormData] =
    useState({

      req_id: "",

      map_id: "",

      interviewer_id: "",

      round_type: "",

      interview_date: "",

      interview_time: "",

      remarks: ""

    });

    const fetchRequisitions = async () => {

  try {

    const response =
      await API.get(
        "/my-requisitions"
      );

    setRequisitions(
      response.data.data
    );

  }

  catch (error) {

    console.log(error);

  }

};
    const fetchCandidates = async () => {

  try {

    const response =
      await API.get(
        "/interview-candidates"
      );

    setCandidates(
      response.data.data
    );

  }

  catch (error) {

    console.log(error);

  }

};

const fetchInterviewers = async () => {

  try {

    const response =
      await API.get(
        "/active-interviewers"
      );

    setInterviewers(
      response.data.data
    );

  }

  catch (error) {

    console.log(error);

  }

};

const fetchSchedules = async () => {

  try {

    const response =
      await API.get(
        "/interview-schedules"
      );

    setSchedules(
      response.data.data
    );

  }

  catch (error) {

    console.log(error);

  }

};


useEffect(() => {

  fetchRequisitions();

  fetchInterviewers();

  fetchSchedules();

}, []);
const handleChange = (e) => {

  setFormData({

    ...formData,

    [e.target.name]: e.target.value

  });

};

const loadCandidatesByRequisition =
  async (reqId) => {

    try {

      const response =
        await API.get(
          `/interview-candidates/${reqId}`
        );

      setCandidates(
        response.data.data
      );

    }

    catch (error) {

      console.log(error);

    }

  };

const handleScheduleInterview = async () => {

  try {

    await API.post(

      "/schedule-interview",

      {

        req_id: Number(formData.req_id),

        map_id:
          Number(formData.map_id),

        interviewer_id:
          Number(formData.interviewer_id),

        round_type:
          formData.round_type,

          interview_date:
            formData.interview_date,

          interview_time:
            formData.interview_time,

            remarks:
            formData.remarks

        }

      );

      alert(
        "Interview Scheduled Successfully"
      );

    fetchSchedules();

    setFormData({
      req_id: "",

      map_id: "",

      interviewer_id: "",

      round_type: "",

      interview_date: "",

      interview_time: "",

      remarks: ""

    });

  }

  catch (error) {

    console.log(error);

    alert(

      error?.response?.data?.message ||

      "Failed to Schedule Interview"

    );

  }

};

const candidateOptions =
  candidates.map((c) => ({

    value: c.map_id,

    label:
      `${c.candidate_code} - ${c.candidate_name}`

  }));

  const requisitionOptions =
  requisitions.map((r) => ({

    value: r.req_id,

    label:
      `${r.req_code} - ${r.job_title}`

  }));

console.log("Requisitions:", requisitions);
console.log("Options:", requisitionOptions);
  return (

<div
  style={{
    padding: "30px",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh"
  }}
>

  <h1
    style={{
      marginBottom: "25px",
      color: "#1e293b"
    }}
  >
    Interview Schedule Management
  </h1>

  <div
    style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "15px",
      boxShadow:
        "0 2px 10px rgba(0,0,0,0.08)",
      marginBottom: "30px"
    }}
  >

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "1fr 1fr",
        gap: "20px"
      }}
    >
<Select

  options={requisitionOptions}

  placeholder="Search Requisition..."

  value={
    requisitionOptions.find(
      option =>
        option.value ===
        Number(formData.req_id)
    )
  }

  onChange={(selected) => {

    setFormData({

      ...formData,

      req_id: selected.value,

      map_id: ""

    });

    loadCandidatesByRequisition(
      selected.value
    );

  }}

/>
  <Select
  options={candidateOptions}
  placeholder="Search Candidate..."
  value={
    candidateOptions.find(
      option =>
        option.value ===
        Number(formData.map_id)
    )
  }
  onChange={(selected) => {

    setFormData({

      ...formData,

      map_id: selected.value

    });

  }}
/>

      <select
        name="interviewer_id"
        value={formData.interviewer_id}
        onChange={handleChange}
        style={styles.input}
      >
        <option value="">
          Select Interviewer
        </option>

        {interviewers.map((i) => (

          <option
            key={i.panel_id}
            value={i.panel_id}
          >
            {i.interviewer_name}
          </option>

        ))}
      </select>

      <select
        name="round_type"
        value={formData.round_type}
        onChange={handleChange}
        style={styles.input}
      >
        <option value="">
          Select Round
        </option>

        <option>
          L1 Technical
        </option>

        <option>
          L2 Technical
        </option>

        <option>
          Manager Round
        </option>

        <option>
          HR Round
        </option>

        <option>
          Client Round
        </option>

      </select>

      <input
        type="date"
        name="interview_date"
        value={formData.interview_date}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        type="time"
        name="interview_time"
        value={formData.interview_time}
        onChange={handleChange}
        style={styles.input}
      />

      </div>

    <textarea
      name="remarks"
      placeholder="Remarks"
      value={formData.remarks}
      onChange={handleChange}
      rows="4"
      style={{
        ...styles.input,
        marginTop: "20px",
        width: "100%"
      }}
    />

    <button
      onClick={
        handleScheduleInterview
      }
      style={{
        marginTop: "20px",
        background: "#1e3a8a",
        color: "#fff",
        border: "none",
        padding:
          "12px 25px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600"
      }}
    >
      Schedule Interview
    </button>

  </div>

  <div
    style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "15px",
      boxShadow:
        "0 2px 10px rgba(0,0,0,0.08)"
    }}
  >

    <h2
      style={{
        marginBottom: "20px"
      }}
    >
      Scheduled Interviews
    </h2>

    <div
      style={{
        overflowX: "auto"
      }}
    >

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
                "#f1f5f9"
            }}
          >
            <th style={styles.th}>
              Req Code
            </th>
            
            <th style={styles.th}>
              Position
            </th>

            <th style={styles.th}>
              Candidate Code
            </th>

            <th style={styles.th}>
              Candidate Name
            </th>

            <th style={styles.th}>
              Round
            </th>

            <th style={styles.th}>
              Interviewer
            </th>

            <th style={styles.th}>
              Date
            </th>

            <th style={styles.th}>
              Time
            </th>

            <th style={styles.th}>
              Status
            </th>

            <th style={styles.th}>
              Feedback
            </th>

          </tr>

        </thead>

        <tbody>

  {schedules.map((s) => (

    <tr
      key={
        s.schedule_id
      }
    >

      <td
  style={styles.td}
>
  {s.req_code}
</td>

<td
  style={styles.td}
>
  {s.job_title}
</td>

      <td
        style={styles.td}
      >
        {s.candidate_code}
      </td>

      <td
        style={styles.td}
      >
        {s.candidate_name}
      </td>

      <td
        style={styles.td}
      >
        {s.round_type}
      </td>

      <td
        style={styles.td}
      >
        {s.interviewer_name}
      </td>

      <td
        style={styles.td}
      >
        {
          s.interview_date
        }
      </td>

      <td
        style={styles.td}
      >
        {s.interview_time}
      </td>

      <td
        style={styles.td}
      >

        <span
          style={{
            backgroundColor:
              "#d4edda",
            color:
              "#155724",
            padding:
              "8px 15px",
            borderRadius:
              "20px",
            fontWeight:
              "600"
          }}
        >
          {s.interview_status}
        </span>

      </td>

      <td>

  {s.feedback_submitted ? (

    <button
      style={{
        background:
          "#1e3a8a",
        color:
          "#fff",
        border:
          "none",
        padding:
          "8px 16px",
        borderRadius:
          "8px",
        cursor:
          "pointer",
        fontWeight:
          "600"
      }}

      onClick={() =>
        navigate(
          `/feedback-view/${s.schedule_id}`
        )
      }
    >
      View
    </button>

  ) : (

    <span
      style={{
        color:
          "#9ca3af"
      }}
    >
      -
    </span>

  )}

</td>

    </tr>

  ))}

</tbody>

      </table>

    </div>

  </div>

</div>



  );

}

const styles = {

  input: {

    padding: "12px",

    border:
      "1px solid #d1d5db",

    borderRadius: "8px",

    fontSize: "14px"

  },

  th: {

    textAlign: "left",

    padding: "12px",

    borderBottom:
      "1px solid #e5e7eb"

  },

  td: {

    padding: "12px",

    borderBottom:
      "1px solid #e5e7eb"

  }

};

export default InterviewSchedulePage;