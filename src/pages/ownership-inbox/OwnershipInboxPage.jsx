import { useState } from "react";

import { Box, Button, Card, CardActions, CardContent, Stack, Typography } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { WorkspaceHeader } from "@/components/enterprise";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import useOwnershipInbox from "@/hooks/useOwnershipInbox";

function OwnershipInboxPage() {
  const {
    requests,
    isLoading,
    error,
    loadOwnershipRequests,
    approveOwnershipRequest,
    rejectOwnershipRequest
  } = useOwnershipInbox();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);

  const handleOpenApprove = (request) => {
    setSelectedRequest(request);
    setActionType("approve");
    setDialogOpen(true);
  };

  const handleOpenReject = (request) => {
    setSelectedRequest(request);
    setActionType("reject");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    setActionType(null);
  };

  const handleConfirm = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      if (actionType === "approve") {
        await approveOwnershipRequest(selectedRequest.request_id);
        window.dispatchEvent(
          new Event("ownershipRequestsUpdated")
        );
      } else if (actionType === "reject") {
        await rejectOwnershipRequest(selectedRequest.request_id);
        window.dispatchEvent(
          new Event("ownershipRequestsUpdated")
        );
      }
    } finally {
      setDialogOpen(false);
      setSelectedRequest(null);
      setActionType(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 3,
            bgcolor: "background.paper",
            boxShadow: (theme) => theme.shadows[1]
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 240,
              py: 4
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading ownership requests...
            </Typography>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 3,
            bgcolor: "background.paper",
            boxShadow: (theme) => theme.shadows[1]
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 240,
              py: 4
            }}
          >
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    if (requests.length === 0) {
      return (
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: 3,
            bgcolor: "background.paper",
            boxShadow: (theme) => theme.shadows[1]
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 240,
              py: 4
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No pending ownership requests.
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Stack spacing={1.5} sx={{ flex: 1 }}>
        {requests.map((request) => {
          const candidateName = [request.first_name, request.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();

          return (
            <Card
              key={request.request_id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: (theme) => theme.shadows[1]
              }}
            >
              <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                <Stack spacing={1}>
                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Candidate Name
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {candidateName || request.candidate_code || "—"}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Requested By
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {request.requester_display_name || "—"}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Requested On
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {request.requested_on
                        ? new Date(request.requested_on).toLocaleString()
                        : "—"}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Status
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {request.status || "—"}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Reason
                    </Typography>
                    <Typography variant="body2">
                      {request.reason || "—"}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 1.5, pt: 0, justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={() => handleOpenReject(request)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    height: 40,
                    minHeight: 40,
                    py: 0,
                    px: 2
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleOpenApprove(request)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    height: 40,
                    minHeight: 40,
                    py: 0,
                    px: 2
                  }}
                >
                  Approve Transfer
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </Stack>
    );
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <WorkspaceHeader
        title="Ownership Requests"
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Recruitment" },
          { label: "Ownership Requests" }
        ]}
        actions={
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshOutlinedIcon />}
            onClick={loadOwnershipRequests}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Refresh
          </Button>
        }
      />

      {renderContent()}

      <EnterpriseConfirmationDialog
        open={dialogOpen}
        title={
          actionType === "approve"
            ? "Approve Ownership Transfer"
            : "Reject Ownership Request"
        }
        message={
          actionType === "approve"
            ? "Are you sure you want to transfer ownership of this candidate to the requesting recruiter?"
            : "Are you sure you want to reject this ownership request?"
        }
        confirmLabel={
          actionType === "approve"
            ? "Approve Transfer"
            : "Reject Request"
        }
        confirmColor={actionType === "approve" ? "success" : "error"}
        loading={isLoading}
        onConfirm={handleConfirm}
        onClose={handleCloseDialog}
      />
    </Box>
  );
}

export default OwnershipInboxPage;
