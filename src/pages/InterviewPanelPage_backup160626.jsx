import { useEffect, useState } from "react";
import API from "../api/axios";
import Select from "react-select";

function InterviewPanelPage() {

const [interviewers, setInterviewers] = useState([]);

const [formData, setFormData] = useState({

user_id: "",
primary_skill: "",
department: "",
designation: "",
interviewer_type: ""

});

const [isEditMode, setIsEditMode] =
  useState(false);

const [selectedPanelId, setSelectedPanelId] =
  useState(null);

const [interviewerOptions,
  setInterviewerOptions] = useState([]);

const [selectedInterviewer,
  setSelectedInterviewer] = useState(null);

/* =========================================
FETCH INTERVIEWERS
========================================= */

const fetchInterviewers = async () => {

try {

  const response =
    await API.get(
      "/interview-panel"
    );

  setInterviewers(
    response.data.data
  );

}

catch (error) {

  console.log(error);

  alert(
    "Error Fetching Interviewers"
  );

}
};

const fetchInterviewerDropdown =
  async () => {

    try {

      const response =
        await API.get(
          "/interviewer-dropdown"
        );

      const options =
        response.data.data.map(
          user => ({

            value:
              user.user_id,

            label:
              `${user.employee_code} - ${user.full_name}`

          })
        );

      setInterviewerOptions(
        options
      );

    }

    catch (error) {

      console.log(error);

    }

  
};

useEffect(() => {

fetchInterviewers();
  
fetchInterviewerDropdown();

}, []);

/* =========================================
HANDLE CHANGE
========================================= */

const handleChange = (e) => {

setFormData({


...formData,
[e.target.name]:
  e.target.value

});

};

const handleEdit = (row) => {

setFormData({


user_id:
  row.user_id || "",

primary_skill:
  row.primary_skill || "",

department:
  row.department || "",

designation:
  row.designation || "",

interviewer_type:
  row.interviewer_type || ""

});

setSelectedPanelId(
row.panel_id
);

setSelectedInterviewer({

value:
  row.user_id,

label:
  `${row.employee_code} - ${row.interviewer_name}`

});

setIsEditMode(
true
);

};

/* =========================================
CREATE INTERVIEWER
========================================= */

const handleCreateInterviewer = async () => {

if (


!formData.user_id ||

!formData.interviewer_type

) {

alert(
  "Please select interviewer and interviewer type"
);

return;


}

const confirmSave =
window.confirm(
"Are you sure you want to add this interviewer?"
);

if (!confirmSave) {


return;


}

try {

await API.post(

  "/interview-panel",

  {

    user_id:
      formData.user_id,

    primary_skill:
      formData.primary_skill,

    department:
      formData.department,

    designation:
      formData.designation,

    interviewer_type:
      formData.interviewer_type

  }

);

alert(
  "Interviewer Added Successfully!"
);

fetchInterviewers();

setFormData({

  user_id: "",

  primary_skill: "",
  department: "",
  designation: "",
  interviewer_type: ""

});

setSelectedInterviewer(
  null
);


}

catch (error) {

console.log(error);

alert(

  error.response?.data?.message ||

  "Error Adding Interviewer"

);

}

};

const handleUpdateInterviewer = async () => {

const confirmUpdate =
window.confirm(
"Are you sure you want to update this interviewer?"
);

if (!confirmUpdate) {

return;

}

try {


await API.put(

  `/interview-panel/${selectedPanelId}`,

  {

    ...formData,

    is_active: true

  }

);

alert(
  "Interviewer Updated Successfully!"
);

fetchInterviewers();

setFormData({

  user_id: "",

  primary_skill: "",
  department: "",
  designation: "",
  interviewer_type: ""

});

setSelectedInterviewer(
  null
);

setIsEditMode(false);

setSelectedPanelId(null);

}

catch (error) {

console.log(error);

alert(
  "Error Updating Interviewer"
);

}

};

const handleCancelEdit = () => {

setFormData({

user_id: "",

primary_skill: "",
department: "",
designation: "",
interviewer_type: ""

});

setSelectedInterviewer(
null
);

setSelectedPanelId(null);

setIsEditMode(false);

};

return (

<div style={styles.page}>

{/* HEADER */}

  <div style={styles.header}>
    Interview Panel Master
  </div>

{/* =====================================
FORM
===================================== */}

  <div style={styles.formContainer}>

<div style={styles.row}>

  <div
    style={{
      flex: 1
    }}
  >

    <label>

      Select Interviewer

    </label>

    <Select

      options={
        interviewerOptions
      }

      value={
        selectedInterviewer
      }

      onChange={option => {

        setSelectedInterviewer(
          option
        );

        setFormData({

          ...formData,

          user_id:
            option.value

        });

      }}

      placeholder=
        "Search Interviewer..."

      isSearchable

    />

  </div>

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
    name="department"
    placeholder="Department"
    style={styles.input}
    value={formData.department}
    onChange={handleChange}
  />

</div>

<div style={styles.row}>

  <input
    name="designation"
    placeholder="Designation"
    style={styles.input}
    value={formData.designation}
    onChange={handleChange}
  />

  <select
    name="interviewer_type"
    style={styles.input}
    value={formData.interviewer_type}
    onChange={handleChange}
  >

    <option value="">
      Please Select Interviewer Type
    </option>

    <option value="Technical">
      Technical
    </option>

    <option value="Non Technical">
      Non Technical
    </option>

    <option value="Managerial">
      Managerial
    </option>

    <option value="HR">
      HR
    </option>

    <option value="Client">
      Client
    </option>

  </select>

</div>

<div

  style={{

    display: "flex",

    gap: "10px"

  }}

>

  <button

    style={styles.button}

    onClick={

      isEditMode

        ? handleUpdateInterviewer

        : handleCreateInterviewer

    }

  >

    {

      isEditMode

        ? "Update Interviewer"

        : "Add Interviewer"

    }

  </button>

  {

    isEditMode && (

      <button

        style={styles.cancelButton}

        onClick={handleCancelEdit}

      >

        Cancel

      </button>

    )

  }

</div>

  </div>

{/* =====================================
TABLE
===================================== */}


  <div style={styles.tableContainer}>

    <table style={styles.table}>

      <thead>

        <tr>

          <th style={styles.th}>Employee Code</th>
          <th style={styles.th}>Interviewer Name</th>
          <th style={styles.th}>Email</th>
          <th style={styles.th}>Primary Skill</th>
          <th style={styles.th}>Department</th>
          <th style={styles.th}>Designation</th>
          <th style={styles.th}>Type</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Action</th>

        </tr>

      </thead>

      <tbody>

        {

          interviewers.map((row) => (

            <tr key={row.panel_id}>

              <td style={styles.td}>
                {row.employee_code}
              </td>

              <td style={styles.td}>
                {row.interviewer_name}
              </td>

              <td style={styles.td}>
                {row.email_id}
              </td>

              <td style={styles.td}>
                {row.primary_skill}
              </td>

              <td style={styles.td}>
                {row.department}
              </td>

              <td style={styles.td}>
                {row.designation}
              </td>

              <td style={styles.td}>
                {row.interviewer_type}
              </td>

              <td style={styles.td}>

                {

                  row.is_active

                    ? "Active"

                    : "Inactive"

                }
                
              </td>
                <td style={styles.td}>

  <button

    style={styles.editButton}

    onClick={() =>
      handleEdit(row)
    }

  >

    Edit

  </button>

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

padding: "30px",

background: "#f4f6f9",

minHeight: "100vh",

fontFamily: "Segoe UI"

},

header: {

fontSize: "30px",

fontWeight: "600",

marginBottom: "30px",

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

export default InterviewPanelPage;