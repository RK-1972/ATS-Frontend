import { useState } from "react";
import { Box, TextField } from "@mui/material";

import EnterpriseCard from "../enterprise/framework/EnterpriseCard";

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "8px",
    borderBottom: "1px solid #ddd",
    background: "#f4f6f9",
    fontSize: "12px",
    whiteSpace: "nowrap"
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #eee",
    fontSize: "12px"
  }
};

function matchesRequisitionSearch(req, rawQuery) {
  const query = String(rawQuery || "").trim().toLowerCase();

  if (!query) {
    return true;
  }

  const haystack = [
    req.req_code,
    req.requisition_code,
    req.client_name,
    req.job_title,
    req.primary_skill,
    req.work_location
  ]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");

  return haystack.includes(query);
}

/**
 * Recruiter Assignment presentation — Approved requisitions grid,
 * Manage action, Assign Recruiter modal, and client-side search.
 */
function RecruiterAssignmentPanel({
  requisitions,
  recruiters,
  assignedRecruiters,
  selectedReqId,
  selectedRecruiter,
  showAssignModal,
  setRequisitionManagementUi,
  loadAssignedRecruiters,
  assignRecruiterOnRequisition,
  removeRecruiterFromRequisition
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequisitions = (requisitions || []).filter((req) =>
    matchesRequisitionSearch(req, searchQuery)
  );

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
    <>
      <EnterpriseCard
        title="Talent Demand Directory"
        subtitle="Manage and review Talent Demand Requests"
      >
        <TextField
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search Talent Demand Requests"
          sx={{ mb: 1 }}
        />

        <Box sx={{ overflow: "auto", maxHeight: { md: "70vh" } }}>
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
                filteredRequisitions.map((req) => (
                  <tr key={req.req_id ?? req.req_code ?? req.requisition_code}>
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
        </Box>
      </EnterpriseCard>

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
    </>
  );
}

export default RecruiterAssignmentPanel;
