import { useEffect, useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";

import EnterpriseCard from "../enterprise/framework/EnterpriseCard";
import RequisitionClosureDialog from "./RequisitionClosureDialog";
import { resolveFulfillment } from "./requisitionFulfillmentUtils";
import RequisitionFulfillmentChip from "./RequisitionFulfillmentChip";
import { isClosedRequisitionStatus, REQUISITION_STATUS } from "@/constants/requisitionStatus";
import useEnterpriseStore from "@/store/enterpriseStore";
import { formatRequisitionSkillDisplay } from "@/utils/requisitionSkillUtils";

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
function formatPortalPublishedAt(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleString();
}

function RecruiterAssignmentPanel({
  initialSearchQuery = "",
  requisitions,
  recruiters,
  assignedRecruiters,
  selectedReqId,
  selectedRecruiter,
  showAssignModal,
  setRequisitionManagementUi,
  loadAssignedRecruiters,
  assignRecruiterOnRequisition,
  removeRecruiterFromRequisition,
  publishRequisitionToCandidatePortal,
  unpublishRequisitionFromCandidatePortal,
  closeRequisitionAsFilled,
  closeRequisitionAsCancelled
}) {
  const masterData = useEnterpriseStore((state) => state.masterData);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);
  const [portalActionCode, setPortalActionCode] = useState("");
  const [closureDialog, setClosureDialog] = useState({ open: false, mode: null, requisition: null });
  const [closureSubmitting, setClosureSubmitting] = useState(false);

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

  const resolveRequisitionCode = (req) =>
    req.requisition_code || req.req_code;

  const isApprovedOpen = (req) =>
    req.req_status === REQUISITION_STATUS.APPROVED
    && !isClosedRequisitionStatus(req.req_status);

  const openClosureDialog = (req, mode) => {
    setClosureDialog({ open: true, mode, requisition: req });
  };

  const closeClosureDialog = () => {
    setClosureDialog({ open: false, mode: null, requisition: null });
  };

  const handleConfirmCloseFilled = async (requisitionCode) => {
    setClosureSubmitting(true);
    try {
      await closeRequisitionAsFilled(requisitionCode);
      alert("Requisition closed as filled.");
      closeClosureDialog();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to close requisition as filled."
      );
    } finally {
      setClosureSubmitting(false);
    }
  };

  const handleConfirmCloseCancelled = async (requisitionCode, reason) => {
    setClosureSubmitting(true);
    try {
      await closeRequisitionAsCancelled(requisitionCode, reason);
      alert("Requisition closed as cancelled.");
      closeClosureDialog();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to close requisition as cancelled."
      );
    } finally {
      setClosureSubmitting(false);
    }
  };

  const handlePublishToPortal = async (req) => {
    const requisitionCode = resolveRequisitionCode(req);

    if (!requisitionCode) {
      return;
    }

    const confirmed = window.confirm(
      `Publish ${requisitionCode} to the Candidate Portal?\n\nCandidates will be able to view and apply to this requisition.`
    );

    if (!confirmed) {
      return;
    }

    setPortalActionCode(requisitionCode);

    try {
      await publishRequisitionToCandidatePortal(requisitionCode);
      alert("Requisition published to the Candidate Portal.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to publish requisition to the Candidate Portal."
      );
    } finally {
      setPortalActionCode("");
    }
  };

  const handleUnpublishFromPortal = async (req) => {
    const requisitionCode = resolveRequisitionCode(req);

    if (!requisitionCode) {
      return;
    }

    const confirmed = window.confirm(
      `Unpublish ${requisitionCode} from the Candidate Portal?\n\nNew applications will be blocked. Existing applications will remain unchanged.`
    );

    if (!confirmed) {
      return;
    }

    setPortalActionCode(requisitionCode);

    try {
      await unpublishRequisitionFromCandidatePortal(requisitionCode);
      alert("Requisition unpublished from the Candidate Portal.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to unpublish requisition from the Candidate Portal."
      );
    } finally {
      setPortalActionCode("");
    }
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
                <th style={styles.th}>Required</th>
                <th style={styles.th}>Reserved</th>
                <th style={styles.th}>Filled</th>
                <th style={styles.th}>Remaining</th>
                <th style={styles.th}>Closure</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Candidate Portal</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Recruiters</th>
              </tr>
            </thead>
            <tbody>
              {
                filteredRequisitions.map((req) => {
                  const metrics = resolveFulfillment(req);
                  const requisitionCode = resolveRequisitionCode(req);
                  const closed = isClosedRequisitionStatus(req.req_status);

                  return (
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
                      {formatRequisitionSkillDisplay(req.primary_skill, masterData)}
                    </td>
                    <td style={styles.td}>
                      {metrics.required}
                    </td>
                    <td style={styles.td}>
                      {metrics.reserved}
                    </td>
                    <td style={styles.td}>
                      {metrics.filled}
                    </td>
                    <td style={styles.td}>
                      {metrics.remaining}
                    </td>
                    <td style={styles.td}>
                      <RequisitionFulfillmentChip
                        fulfillment={req.fulfillment || req}
                        reqStatus={req.req_status}
                      />
                    </td>
                    <td style={styles.td}>
                      {req.priority_level}
                    </td>
                    <td style={styles.td}>
                      {req.req_status}
                    </td>
                    <td style={styles.td}>
                      <div>
                        {req.candidate_portal_published ? "Published" : "Not published"}
                      </div>
                      {req.candidate_portal_published && formatPortalPublishedAt(
                        req.candidate_portal_published_at
                      ) ? (
                        <div style={{ color: "#6b7280", fontSize: "11px" }}>
                          {formatPortalPublishedAt(req.candidate_portal_published_at)}
                        </div>
                      ) : null}
                      {!closed ? (
                        <div style={{ marginTop: "6px" }}>
                          {req.candidate_portal_published ? (
                            <button
                              type="button"
                              onClick={() => handleUnpublishFromPortal(req)}
                              disabled={portalActionCode === requisitionCode}
                              style={{
                                background: "#fff",
                                color: "#b45309",
                                border: "1px solid #f59e0b",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600
                              }}
                            >
                              Unpublish from Candidate Portal
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePublishToPortal(req)}
                              disabled={
                                portalActionCode === requisitionCode
                                || !isApprovedOpen(req)
                              }
                              style={{
                                background: "#1f3b63",
                                color: "#fff",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600
                              }}
                            >
                              Publish to Candidate Portal
                            </button>
                          )}
                        </div>
                      ) : null}
                    </td>
                    <td style={styles.td}>
                      {req.work_location}
                    </td>
                    <td style={styles.td}>
                      <Stack spacing={0.75}>
                        {!closed ? (
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
                        ) : (
                          <span style={{ color: "#6b7280", fontSize: "11px" }}>
                            Closed
                          </span>
                        )}
                        {isApprovedOpen(req) ? (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={!metrics.closureEligible}
                              onClick={() => openClosureDialog(req, "filled")}
                              sx={{ fontSize: "10px", py: 0.25, px: 0.75, minWidth: 0 }}
                            >
                              Close Filled
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => openClosureDialog(req, "cancelled")}
                              sx={{ fontSize: "10px", py: 0.25, px: 0.75, minWidth: 0 }}
                            >
                              Close Cancelled
                            </Button>
                          </Stack>
                        ) : null}
                      </Stack>
                    </td>
                  </tr>
                  );
                })
              }
            </tbody>
          </table>
        </Box>
      </EnterpriseCard>

      <RequisitionClosureDialog
        open={closureDialog.open}
        mode={closureDialog.mode}
        requisition={closureDialog.requisition}
        onClose={closeClosureDialog}
        onConfirmFilled={handleConfirmCloseFilled}
        onConfirmCancelled={handleConfirmCloseCancelled}
        isSubmitting={closureSubmitting}
      />

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
