import Header from "../components/Header";
import { useEffect, useState } from "react";
import API from "../api/axios";

function UserManagementPage() {

  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({

    employee_code: "",
    full_name: "",
    email_id: "",
    password: "",
    role_name: ""

  });


  // =========================================
  // Fetch Users
  // =========================================

  const fetchUsers = async () => {

    try {

      const response = await API.get(
        "/users"
      );

      setUsers(response.data.data);

    }

    catch (error) {

      console.log(error);

      alert("Error Fetching Users");

    }

  };


  useEffect(() => {

    fetchUsers();

  }, []);


  // =========================================
  // Handle Change
  // =========================================

  const handleChange = (e) => {

    setFormData({

      ...formData,
      [e.target.name]: e.target.value

    });

  };


  // =========================================
  // Email Validation
  // =========================================

  const validateEmail = (email) => {

    return /\S+@\S+\.\S+/.test(email);

  };


  // =========================================
  // Create User
  // =========================================

  const handleCreateUser = async () => {


    // =====================================
    // Mandatory Validation
    // =====================================

    if (

      !formData.employee_code.trim() ||

      !formData.full_name.trim() ||

      !formData.email_id.trim() ||

      !formData.password.trim() ||

      !formData.role_name

    ) {

      alert("Please fill all mandatory fields");

      return;

    }


    // =====================================
    // Email Validation
    // =====================================

    if (!validateEmail(formData.email_id)) {

      alert("Please enter valid email address");

      return;

    }


    // =====================================
    // Password Validation
    // =====================================

    if (formData.password.length < 6) {

      alert(

        "Password must contain minimum 6 characters"

      );

      return;

    }


    try {

      await API.post(

        "/register",

        formData

      );

      alert("User Created Successfully!");

      fetchUsers();


      // =====================================
      // Clear Form
      // =====================================

      setFormData({

        employee_code: "",
        full_name: "",
        email_id: "",
        password: "",
        role_name: ""

      });

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Error Creating User"

      );

    }

  };


  return (

    <div style={styles.page}>

    <Header />

    <div
      style={{
        padding: "30px"
      }}
    >

      {/* HEADER */}

      <div style={styles.header}>
        User Management
      </div>
      </div>
     

      {/* =====================================
          CREATE USER FORM
      ===================================== */}

      <div style={styles.formContainer}>


        <div style={styles.row}>


          <input
            name="employee_code"
            placeholder="Employee Code"
            style={styles.input}
            value={formData.employee_code}
            onChange={handleChange}
          />


          <input
            name="full_name"
            placeholder="Full Name"
            style={styles.input}
            value={formData.full_name}
            onChange={handleChange}
          />

        </div>


        <div style={styles.row}>


          <input
            name="email_id"
            placeholder="Email"
            style={styles.input}
            value={formData.email_id}
            onChange={handleChange}
          />


          <input
            type="password"
            name="password"
            placeholder="Password"
            style={styles.input}
            value={formData.password}
            onChange={handleChange}
          />

        </div>


        <div style={styles.row}>


          <select
            name="role_name"
            style={styles.input}
            value={formData.role_name}
            onChange={handleChange}
          >

            <option value="">
              Please Select Role
            </option>

            <option value="Admin">
            Admin
            </option>

            <option value="Hiring Manager">
            Hiring Manager
          </option>

          <option value="TA Leader">
            TA Leader
          </option>

          <option value="TA Lead">
            TA Lead
          </option>

          <option value="Recruiter">
            Recruiter
          </option>

          <option value="Interviewer">
            Interviewer
          </option>

          </select>

        </div>


        <button

          style={styles.button}

          onClick={handleCreateUser}

        >

          Create User

        </button>

      </div>


      {/* =====================================
          USER TABLE
      ===================================== */}

      <div style={styles.tableContainer}>


        <table style={styles.table}>


          <thead>

            <tr>

              <th style={styles.th}>Employee Code</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created On</th>

            </tr>

          </thead>


          <tbody>

            {

              users.map((user) => (

                <tr key={user.user_id}>


                  <td style={styles.td}>
                    {user.employee_code}
                  </td>


                  <td style={styles.td}>
                    {user.full_name}
                  </td>


                  <td style={styles.td}>
                    {user.email_id}
                  </td>


                  <td style={styles.td}>
                    {user.role_name}
                  </td>


                  <td style={styles.td}>

                    {

                      user.is_active

                        ? "Active"

                        : "Inactive"

                    }

                  </td>


                  <td style={styles.td}>

                    {

                      new Date(
                        user.created_on
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

export default UserManagementPage;