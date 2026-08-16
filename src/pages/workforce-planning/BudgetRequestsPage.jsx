import { useOutletContext } from "react-router-dom";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";

import { useState } from "react";

import { MdAdd } from "react-icons/md";

import AuthorizationService from "@/services/authorizationService";
import { dispatchApprovalNotificationsUpdated } from "@/utils/enterpriseNotificationEvents";
import { formatCurrency } from "@/utils/formatCurrency";
import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import BudgetRequestCard from "../../components/workforce-planning/BudgetRequestCard";
import BudgetRequestFormDialog from "../../components/workforce-planning/BudgetRequestFormDialog";
import WorkforceStatusChip from "../../components/workforce-planning/WorkforceStatusChip";

function BudgetRequestsPage() {
  const {
    data,
    setToastMessage,
    saveDraftRequest,
    submitRequest,
    resubmitClarification
  } = useOutletContext();
  const [view, setView] = useState("cards");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [accessDeniedOpen, setAccessDeniedOpen] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const assertCanRaiseBudget = async () => {
    setCheckingAccess(true);
    try {
      const allowed = await AuthorizationService.canRaiseBudgetRequest();
      if (!allowed) {
        setAccessDeniedOpen(true);
        return false;
      }
      return true;
    } catch {
      setAccessDeniedOpen(true);
      return false;
    } finally {
      setCheckingAccess(false);
    }
  };

  const openNewRequest = async () => {
    const allowed = await assertCanRaiseBudget();
    if (!allowed) {
      return;
    }
    setEditingRequest(null);
    setFormOpen(true);
  };

  const isOpenable = (request) =>
    request?.status === "Draft" || request?.status === "Clarification Requested";
  const openDraftRequest = async (request) => {
    if (!isOpenable(request)) {
      return;
    }

    const allowed = await assertCanRaiseBudget();
    if (!allowed) {
      return;
    }

    setEditingRequest(request);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingRequest(null);
  };

  const handleSaveDraft = async (payload) => {
    try {
      return await saveDraftRequest(payload);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to save budget request draft.";
      setToastMessage(message);
      if (error.response?.status === 403) {
        setAccessDeniedOpen(true);
        closeForm();
      }
      return null;
    }
  };

  const handleSubmitRequest = async (requestId) => {
    try {
      const result = await submitRequest(requestId);
      if (result) {
        dispatchApprovalNotificationsUpdated();
      }
      return result;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to submit budget request.";
      setToastMessage(message);
      if (error.response?.status === 403) {
        setAccessDeniedOpen(true);
      }
      return null;
    }
  };

  const handleSubmitClarification = async (requestId, comment) => {
    try {
      const result = await resubmitClarification(requestId, comment);
      if (result) {
        dispatchApprovalNotificationsUpdated();
      }
      return result;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to submit clarification.";
      setToastMessage(message);
      return null;
    }
  };

  return (
    <>
      <ConfigPageHeader
        title="Budget requests"
        subtitle="Hiring managers submit manpower budget requests before recruitment can begin."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Budget Requests" }
        ]}
        statusChip={
          <Button
            variant="contained"
            size="small"
            startIcon={<MdAdd size={18} />}
            onClick={openNewRequest}
            disabled={checkingAccess}
            sx={{ fontWeight: 600 }}
          >
            New request
          </Button>
        }
      />

      <Stack direction="row" justifyContent="flex-end" mb={1}>
        <ToggleButtonGroup
          size="small"
          value={view}
          exclusive
          onChange={(_, val) => val && setView(val)}
          sx={{
            "& .MuiToggleButton-root": {
              py: 0.375,
              px: 1.25,
              fontSize: 12
            }
          }}
        >
          <ToggleButton value="cards">Cards</ToggleButton>
          <ToggleButton value="table">Table</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {view === "cards" ? (
        <Grid container spacing={1.5}>
          {data.budget_requests.map((request) => {
            const clickable = isOpenable(request);

            return (
              <Grid key={request.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <BudgetRequestCard
                  request={request}
                  selected={editingRequest?.id === request.id && formOpen}
                  onClick={
                    clickable ? () => openDraftRequest(request) : undefined
                  }
                />
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <ConfigSurface sx={{ p: 0, overflow: "hidden" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                    Request
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                    Department
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                    Position
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                    Grade
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}
                    align="center"
                  >
                    HC
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}
                    align="right"
                  >
                    Budget
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.budget_requests.map((req) => {
                  const clickable = isOpenable(req);

                  return (
                    <TableRow
                      key={req.id}
                      hover={clickable}
                      onClick={
                        clickable ? () => openDraftRequest(req) : undefined
                      }
                      sx={{ cursor: clickable ? "pointer" : "default" }}
                    >
                      <TableCell sx={{ py: 0.75, fontSize: 12 }}>
                        {req.id}
                      </TableCell>
                      <TableCell sx={{ py: 0.75, fontSize: 13 }}>
                        {req.department}
                      </TableCell>
                      <TableCell sx={{ py: 0.75, fontSize: 13 }}>
                        {req.position}
                      </TableCell>
                      <TableCell sx={{ py: 0.75, fontSize: 13 }}>
                        {req.grade}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ py: 0.75, fontSize: 13 }}
                      >
                        {req.headcount}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ py: 0.75, fontSize: 13 }}
                      >
                        {formatCurrency(req.proposed_budget)}
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <WorkforceStatusChip status={req.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </ConfigSurface>
      )}

      {data.budget_requests[0] ? (
        <ConfigSurface sx={{ mt: 1.5 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ fontSize: 14, mb: 0.5 }}
          >
            Sample justification — {data.budget_requests[0].id}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 13, lineHeight: 1.45 }}
          >
            {data.budget_requests[0].justification}
          </Typography>
        </ConfigSurface>
      ) : null}

      <BudgetRequestFormDialog
        key={editingRequest?.id || "new-budget-request"}
        open={formOpen}
        initialRequest={editingRequest}
        onClose={closeForm}
        onSaveDraft={handleSaveDraft}
        onSubmitRequest={handleSubmitRequest}
        onSubmitClarification={handleSubmitClarification}
      />

      <Dialog
        open={accessDeniedOpen}
        onClose={() => setAccessDeniedOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Enterprise Access Denied
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 0, pb: 1.5 }}>
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            You are not authorized to raise Budget Requests.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Please contact your system administrator if you require the
            Raise Budget Request permission.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button
            variant="contained"
            onClick={() => setAccessDeniedOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              minWidth: 96
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BudgetRequestsPage;
