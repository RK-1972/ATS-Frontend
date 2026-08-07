import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import ApprovalOutlinedIcon from "@mui/icons-material/ApprovalOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import WorkspaceLayout from "../../components/enterprise/WorkspaceLayout";
import AdminNavRail from "../../components/layout/AdminNavRail";
import RecruiterNavRail from "../../components/layout/RecruiterNavRail";
import EnterpriseCard from "../../components/enterprise/framework/EnterpriseCard";
import EnterpriseWorkspaceHeader from "../../components/enterprise/framework/EnterpriseWorkspaceHeader";
import EnterpriseConfirmationDialog from "../../components/enterprise/EnterpriseConfirmationDialog";
import {
  EmptyState,
  EnterpriseDataGrid,
  InspectorDrawer,
  LoadingState,
  PriorityChip,
  SearchBar,
  StatusChip
} from "../../components/enterprise";
import MyApprovalsService from "../../services/myApprovalsService";
import useEnterpriseStore from "../../store/enterpriseStore";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  formatCommercialAmount,
  formatCommercialJoiningDate,
  formatCommercialPayFrequency,
  readCommercialValue
} from "@/utils/offerCommercialUtils";
import { matchesApprovalSearch } from "@/utils/myApprovalsSearch";

function resolveEnterpriseNavRail(user) {
  let workspace = {};
  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  if (workspace.showRecruitmentWorkspace || workspace.showInterviewWorkspace) {
    return <RecruiterNavRail loggedInUser={user} />;
  }

  return <AdminNavRail />;
}

function formatDateTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
}

function formatAge(days) {
  if (days === null || days === undefined || Number.isNaN(Number(days))) {
    return "—";
  }
  const n = Number(days);
  if (n === 0) return "Today";
  if (n === 1) return "1 day";
  return `${n} days`;
}

function resolveDocumentTypeKey(row) {
  return String(row?.document_type || row?.workflow_type || "")
    .trim()
    .toUpperCase();
}

function formatDocumentType(row) {
  const key = resolveDocumentTypeKey(row);
  const labels = {
    BUDGET: "Budget",
    REQUISITION: "Requisition",
    OFFER: "Offer",
    VENDOR: "Vendor"
  };

  if (labels[key]) {
    return labels[key];
  }

  const raw = String(row?.document_type || row?.workflow_type || "").trim();
  if (!raw) {
    return "—";
  }

  return raw
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizePriority(priority) {
  const raw = String(priority || "Normal").trim();
  const lower = raw.toLowerCase();
  if (lower === "critical") return "Critical";
  if (lower === "high") return "High";
  if (lower === "low") return "Low";
  if (lower === "medium" || lower === "normal") return "Normal";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function resolveCandidateName(row) {
  return row?.candidateName || row?.candidate_name || "—";
}

function GridEllipsisCell({ value }) {
  const displayValue = value || "—";

  return (
    <Tooltip title={displayValue} placement="top" arrow>
      <Typography
        variant="body2"
        noWrap
        sx={{
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        {displayValue}
      </Typography>
    </Tooltip>
  );
}

function MyApprovalsPage() {
  const navigate = useNavigate();
  const refreshWorkforce = useEnterpriseStore((state) => state.refreshWorkforce);
  const refreshOffers = useEnterpriseStore((state) => state.refreshOffers);
  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (_error) {
      return null;
    }
  }, []);

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", severity: "success" });
  const [inspectorRow, setInspectorRow] = useState(null);
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    row: null
  });
  const [actionComments, setActionComments] = useState("");
  const [isActing, setIsActing] = useState(false);

  const loadApprovals = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await MyApprovalsService.listMyActiveApprovals();
      setRows(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setRows([]);
      setToast({
        message:
          error.response?.data?.message || "Failed to load active approvals.",
        severity: "error"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const filteredRows = useMemo(() => {
    const matched = rows.filter((row) =>
      matchesApprovalSearch(row, search, formatDocumentType)
    );

    // Newest assignments first (UI display only; API order unchanged).
    return [...matched].sort((left, right) => {
      const leftTime = left.assigned_on
        ? new Date(left.assigned_on).getTime()
        : 0;
      const rightTime = right.assigned_on
        ? new Date(right.assigned_on).getTime()
        : 0;
      return rightTime - leftTime;
    });
  }, [rows, search]);

  const openAction = (type, row) => {
    setActionDialog({ open: true, type, row });
    setActionComments("");
  };

  const closeAction = () => {
    if (isActing) return;
    setActionDialog({ open: false, type: null, row: null });
    setActionComments("");
  };

  const handleConfirmAction = async () => {
    const { type, row } = actionDialog;
    if (!type || !row?.task_id) return;

    setIsActing(true);

    try {
      if (type === "approve") {
        await MyApprovalsService.approveApproval(row.task_id);
        setToast({ message: "Approved successfully.", severity: "success" });
      } else if (type === "reject") {
        await MyApprovalsService.rejectApproval(row.task_id, actionComments);
        setToast({ message: "Rejected successfully.", severity: "success" });
      } else if (type === "clarify") {
        if (!actionComments.trim()) {
          setToast({
            message: "Please enter clarification comments.",
            severity: "warning"
          });
          setIsActing(false);
          return;
        }
        await MyApprovalsService.requestClarification(
          row.task_id,
          actionComments.trim()
        );
        setToast({
          message: "Clarification requested.",
          severity: "success"
        });
      } else if (type === "resubmit") {
        await MyApprovalsService.submitClarification(
          row.instance_id,
          actionComments.trim()
        );
        setToast({
          message: "Clarification submitted. Workflow resumed.",
          severity: "success"
        });
      }

      setActionDialog({ open: false, type: null, row: null });
      setActionComments("");
      setInspectorRow(null);
      await Promise.all([
        loadApprovals(),
        refreshWorkforce?.().catch(() => null),
        refreshOffers?.().catch(() => null)
      ]);
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Action failed.",
        severity: "error"
      });
    } finally {
      setIsActing(false);
    }
  };

  const handleOpenDocument = (row) => {
    setInspectorRow(row);
  };

  const handleOpenInTalentDemand = (row) => {
    if (row?.requisition_code) {
      navigate("/requisitions", {
        state: { requisitionCode: row.requisition_code }
      });
      return;
    }
    navigate("/requisitions");
  };

  const handleOpenDocumentByType = (row) => {
    const documentType = resolveDocumentTypeKey(row);

    if (documentType === "BUDGET") {
      navigate("/workforce-planning/approvals", {
        state: { budgetRequestId: row.document_number || null }
      });
      return;
    }

    if (documentType === "OFFER") {
      navigate("/offers/pending-approvals", {
        state: { offerId: row.document_number || null }
      });
      return;
    }

    if (documentType === "REQUISITION" || row?.requisition_code) {
      handleOpenInTalentDemand(row);
    }
  };

  const canOpenDocument = (row) => {
    const documentType = resolveDocumentTypeKey(row);
    return (
      documentType === "BUDGET"
      || documentType === "REQUISITION"
      || Boolean(row?.requisition_code)
    );
  };

  const actionLabels = {
    approve: {
      title: "Approve request?",
      confirmLabel: "Approve",
      confirmColor: "primary",
      needsComments: false
    },
    reject: {
      title: "Reject request?",
      confirmLabel: "Reject",
      confirmColor: "error",
      needsComments: true
    },
    clarify: {
      title: "Request Clarification?",
      confirmLabel: "Send Back",
      confirmColor: "warning",
      needsComments: true
    },
    resubmit: {
      title: "Resubmit clarification?",
      confirmLabel: "Resubmit",
      confirmColor: "primary",
      needsComments: false
    }
  };

  const columns = [
    {
      field: "document_type",
      headerName: "Document Type",
      flex: 0.9,
      minWidth: 120,
      valueGetter: (_value, row) => formatDocumentType(row)
    },
    {
      field: "candidate_name",
      headerName: "Candidate Name",
      flex: 1.1,
      minWidth: 140,
      valueGetter: (_value, row) => resolveCandidateName(row),
      renderCell: (params) => <GridEllipsisCell value={params.value} />
    },
    {
      field: "document_number",
      headerName: "Document Number",
      flex: 1,
      minWidth: 130
    },
    {
      field: "document_title",
      headerName: "Document Title",
      flex: 1.3,
      minWidth: 160
    },
    {
      field: "requestor",
      headerName: "Requestor",
      flex: 1,
      minWidth: 120
    },
    {
      field: "current_approval_step",
      headerName: "Current Step",
      flex: 1.2,
      minWidth: 150
    },
    {
      field: "submitted_date",
      headerName: "Submitted",
      flex: 1,
      minWidth: 140,
      valueGetter: (_value, row) => formatDateTime(row.submitted_date)
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 110,
      renderCell: (params) => (
        <PriorityChip priority={normalizePriority(params.row.priority)} />
      )
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <StatusChip status={params.row.status || "Pending"} />
      )
    },
    {
      field: "age_days",
      headerName: "Age",
      width: 90,
      valueGetter: (_value, row) => formatAge(row.age_days)
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 360,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isClarificationTask =
          String(params.row.task_type || "").toLowerCase() === "clarification";

        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Button
              size="small"
              variant="text"
              startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={(event) => {
                event.stopPropagation();
                handleOpenDocument(params.row);
              }}
              sx={{ textTransform: "none", fontWeight: 600, minWidth: 0, px: 0.75 }}
            >
              Open
            </Button>
            {isClarificationTask ? (
              <Button
                size="small"
                color="primary"
                variant="text"
                onClick={(event) => {
                  event.stopPropagation();
                  openAction("resubmit", params.row);
                }}
                sx={{ textTransform: "none", fontWeight: 600, minWidth: 0, px: 0.75 }}
              >
                Resubmit
              </Button>
            ) : (
              <>
                <Button
                  size="small"
                  color="success"
                  variant="text"
                  startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                  onClick={(event) => {
                    event.stopPropagation();
                    openAction("approve", params.row);
                  }}
                  sx={{ textTransform: "none", fontWeight: 600, minWidth: 0, px: 0.75 }}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  startIcon={<HighlightOffOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={(event) => {
                    event.stopPropagation();
                    openAction("reject", params.row);
                  }}
                  sx={{ textTransform: "none", fontWeight: 600, minWidth: 0, px: 0.75 }}
                >
                  Reject
                </Button>
                <Button
                  size="small"
                  color="warning"
                  variant="text"
                  startIcon={<HelpOutlineIcon sx={{ fontSize: 16 }} />}
                  onClick={(event) => {
                    event.stopPropagation();
                    openAction("clarify", params.row);
                  }}
                  sx={{ textTransform: "none", fontWeight: 600, minWidth: 0, px: 0.75 }}
                >
                  Clarify
                </Button>
              </>
            )}
          </Stack>
        );
      }
    }
  ];

  const dialogMeta = actionLabels[actionDialog.type] || {};

  return (
    <WorkspaceLayout navRail={resolveEnterpriseNavRail(loggedInUser)}>
      <Box
        sx={{
          px: { xs: 0, sm: 0 },
          py: 0,
          bgcolor: "background.default"
        }}
      >
        <EnterpriseWorkspaceHeader
          title="My Approvals"
          subtitle="Active workflow tasks assigned to you"
          actions={
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshOutlinedIcon />}
              onClick={loadApprovals}
              disabled={isLoading}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Refresh
            </Button>
          }
        />

        <EnterpriseCard
          title="Active assignments"
          subtitle={`${filteredRows.length} pending approval${filteredRows.length === 1 ? "" : "s"}`}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ mb: 1.5 }}
          >
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by candidate, offer, requisition, project..."
              width={360}
            />
          </Stack>

          {isLoading ? (
            <LoadingState message="Loading your approvals…" />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={ApprovalOutlinedIcon}
              title="No active approvals"
              description="When workflow tasks are assigned to you, they will appear here."
            />
          ) : filteredRows.length === 0 ? (
            <EmptyState
              icon={ApprovalOutlinedIcon}
              title="No matching approvals"
              description="Try a different search term."
            />
          ) : (
            <EnterpriseDataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row.assignment_id || row.task_id}
              height={520}
              disableColumnMenu
              onRowClick={(params) => handleOpenDocument(params.row)}
            />
          )}
        </EnterpriseCard>
      </Box>

      <InspectorDrawer
        open={Boolean(inspectorRow)}
        onClose={() => setInspectorRow(null)}
        title={inspectorRow?.document_title || "Approval details"}
        subtitle={inspectorRow?.document_number || ""}
      >
        {inspectorRow ? (
          <Stack spacing={1.5} sx={{ p: 2 }}>
            <DetailRow
              label="Document Type"
              value={formatDocumentType(inspectorRow)}
            />
            <DetailRow label="Document Number" value={inspectorRow.document_number} />
            {resolveDocumentTypeKey(inspectorRow) === "OFFER" ? (
              <>
                <DetailRow
                  label="Candidate Name"
                  value={inspectorRow.candidateName || inspectorRow.candidate_name || "—"}
                />
                <DetailRow
                  label="Client Name"
                  value={inspectorRow.businessUnit || inspectorRow.business_unit || "—"}
                />
                <DetailRow
                  label="Project Name"
                  value={inspectorRow.department || "—"}
                />
                <DetailRow
                  label="Offered CTC"
                  value={formatCurrency(
                    Number(inspectorRow.offeredCtc ?? inspectorRow.offered_ctc ?? 0)
                  )}
                />
                <Box sx={{ pt: 0.25 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.75, fontWeight: 700 }}
                  >
                    Commercial Terms
                  </Typography>
                  <Stack spacing={1.5}>
                    <DetailRow
                      label="Expected Date of Joining"
                      value={formatCommercialJoiningDate(
                        readCommercialValue(
                          inspectorRow,
                          "expectedJoiningDate",
                          "expected_joining_date"
                        )
                      )}
                    />
                    <DetailRow
                      label="Annual Variable Pay"
                      value={formatCommercialAmount(
                        readCommercialValue(
                          inspectorRow,
                          "variablePay",
                          "variable_pay",
                          0
                        )
                      )}
                    />
                    <DetailRow
                      label="Variable Pay Payout Frequency"
                      value={formatCommercialPayFrequency(
                        readCommercialValue(
                          inspectorRow,
                          "variablePay",
                          "variable_pay",
                          0
                        ),
                        readCommercialValue(
                          inspectorRow,
                          "variablePayFrequency",
                          "variable_pay_frequency"
                        )
                      )}
                    />
                    <DetailRow
                      label="Joining Bonus"
                      value={formatCommercialAmount(
                        readCommercialValue(
                          inspectorRow,
                          "joiningBonus",
                          "joining_bonus",
                          0
                        )
                      )}
                    />
                    <DetailRow
                      label="Joining Bonus Payout Frequency"
                      value={formatCommercialPayFrequency(
                        readCommercialValue(
                          inspectorRow,
                          "joiningBonus",
                          "joining_bonus",
                          0
                        ),
                        readCommercialValue(
                          inspectorRow,
                          "joiningBonusFrequency",
                          "joining_bonus_frequency"
                        )
                      )}
                    />
                  </Stack>
                </Box>
              </>
            ) : null}
            <DetailRow label="Requestor" value={inspectorRow.requestor} />
            <DetailRow
              label="Current Step"
              value={inspectorRow.current_approval_step}
            />
            <DetailRow
              label="Submitted"
              value={formatDateTime(inspectorRow.submitted_date)}
            />
            <DetailRow
              label="Priority"
              value={
                <PriorityChip
                  priority={normalizePriority(inspectorRow.priority)}
                />
              }
            />
            <DetailRow
              label="Status"
              value={<StatusChip status={inspectorRow.status || "Pending"} />}
            />
            <DetailRow label="Age" value={formatAge(inspectorRow.age_days)} />
            <DetailRow
              label="Hiring Manager"
              value={inspectorRow.hiring_manager || "—"}
            />

            <Divider sx={{ my: 0.5 }} />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {canOpenDocument(inspectorRow) ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNewOutlinedIcon />}
                  onClick={() => handleOpenDocumentByType(inspectorRow)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Open document
                </Button>
              ) : null}
              {String(inspectorRow.task_type || "").toLowerCase() === "clarification" ? (
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  onClick={() => openAction("resubmit", inspectorRow)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Resubmit
                </Button>
              ) : (
                <>
                  <Button
                    size="small"
                    color="success"
                    variant="contained"
                    onClick={() => openAction("approve", inspectorRow)}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => openAction("reject", inspectorRow)}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="small"
                    color="warning"
                    variant="outlined"
                    onClick={() => openAction("clarify", inspectorRow)}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Clarify
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        ) : null}
      </InspectorDrawer>

      <EnterpriseConfirmationDialog
        open={actionDialog.open}
        title={dialogMeta.title || "Confirm"}
        message={
          actionDialog.row
            ? `${actionDialog.row.document_number || ""} — ${actionDialog.row.document_title || ""}`
            : ""
        }
        confirmLabel={dialogMeta.confirmLabel || "Confirm"}
        confirmColor={dialogMeta.confirmColor || "primary"}
        loading={isActing}
        onConfirm={handleConfirmAction}
        onClose={closeAction}
      >
        {dialogMeta.needsComments ? (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            size="small"
            label="Comments"
            value={actionComments}
            onChange={(event) => setActionComments(event.target.value)}
            disabled={isActing}
            sx={{ mt: 1.5 }}
          />
        ) : null}
      </EnterpriseConfirmationDialog>

      <Snackbar
        open={Boolean(toast.message)}
        autoHideDuration={4000}
        onClose={() => setToast({ message: "", severity: "success" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ message: "", severity: "success" })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </WorkspaceLayout>
  );
}

function DetailRow({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.25, fontWeight: 600 }}
      >
        {label}
      </Typography>
      {typeof value === "string" || typeof value === "number" ? (
        <Typography variant="body2">{value || "—"}</Typography>
      ) : (
        value
      )}
    </Box>
  );
}

export default MyApprovalsPage;
