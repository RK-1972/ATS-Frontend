import { useMemo, useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

import { Box, Button, Grid, Alert, Typography } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import PositionCatalogueCard from "../../components/workforce-planning/PositionCatalogueCard";
import WorkforcePlanningSectionSearch from "../../components/workforce-planning/WorkforcePlanningSectionSearch";
import AuthorizationService from "../../services/authorizationService";
import { EmptyState } from "../../components/enterprise";
import ApprovalOutlinedIcon from "@mui/icons-material/ApprovalOutlined";
import {
  APPROVED_POSITION_SEARCH_FIELDS,
  filterItemsBySearch,
  WORKFORCE_PLANNING_RESULTS_SCROLL_SX
} from "@/utils/workforcePlanningListFilter";

function extractExistingRequisitionCode(error) {
  const message =
    error?.response?.data?.message || error?.message || "";
  const match = String(message).match(/REQ-\d{4}-\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function ApprovedPositionCataloguePage() {
  const navigate = useNavigate();
  const { data, createRequisition, setToastMessage } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [canRaiseRequisition, setCanRaiseRequisition] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AuthorizationService.canRaiseRequisition()
      .then((allowed) => {
        if (!cancelled) {
          setCanRaiseRequisition(Boolean(allowed));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanRaiseRequisition(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const approvedPositions = data?.approved_positions;

  const filteredPositions = useMemo(
    () =>
      filterItemsBySearch(
        approvedPositions ?? [],
        APPROVED_POSITION_SEARCH_FIELDS,
        searchQuery
      ),
    [approvedPositions, searchQuery]
  );

  const handleCreateRequisition = async (position) => {
    const positionId = position?.id || position;
    let requisitionCode = position?.open_requisition_code || null;
    let draftId = position?.open_draft_id || null;
    const isResume = Boolean(requisitionCode || draftId);

    if (!isResume && !canRaiseRequisition) {
      if (typeof setToastMessage === "function") {
        setToastMessage(
          "Enterprise Access Denied. You are not authorized to create a Requisition."
        );
      }
      return;
    }

    if (!requisitionCode && !draftId) {
      try {
        const result = await createRequisition(positionId);
        requisitionCode = result?.requisitionId || null;
        draftId = result?.draftId || null;
      } catch (error) {
        const accessDenied = error?.response?.status === 403;
        requisitionCode = extractExistingRequisitionCode(error);

        if (!requisitionCode) {
          if (typeof setToastMessage === "function") {
            setToastMessage(
              error?.response?.data?.message ||
                error?.message ||
                "Unable to start requisition from this approved position."
            );
          }
          if (accessDenied || !draftId) {
            return;
          }
        }
      }
    }

    if (!draftId && !requisitionCode) {
      return;
    }

    const params = new URLSearchParams();
    if (draftId) {
      params.set("draftId", String(draftId));
    } else if (requisitionCode) {
      params.set("requisitionCode", requisitionCode);
    }
    if (positionId) {
      params.set("approvedPositionId", String(positionId));
    }
    const query = params.toString();

    navigate(query ? `/requisitions?${query}` : "/requisitions", {
      state: {
        ...(draftId ? { draftId } : {}),
        ...(!draftId && requisitionCode ? { requisitionCode } : {}),
        approvedPositionId: positionId
      }
    });
  };

  return (
    <>
      <ConfigPageHeader
        title="Approved position catalogue"
        subtitle="Approved manpower positions still available for raising a requisition."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Approved Positions" }
        ]}
      />

      <Alert
        severity="info"
        sx={{
          mb: 1.5,
          borderRadius: 2,
          py: 0.5,
          "& .MuiAlert-message": { py: 0.25 }
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 13 }}>
          <strong>Gate to recruitment:</strong> The Create Requisition button
          is enabled only when an approved budget exists with remaining
          headcount and budget. Use Create requisition to open a Talent Demand
          draft. The approved position stays here until you successfully submit.
          If work is already in progress, use Resume requisition.
        </Typography>
      </Alert>

      <WorkforcePlanningSectionSearch
        label="Search approved positions"
        placeholder="Position ID, title, department, grade, status, source request…"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        onClear={() => setSearchQuery("")}
      />

      <Box sx={{ ...WORKFORCE_PLANNING_RESULTS_SCROLL_SX, mt: 1.5 }}>
        {filteredPositions.length === 0 ? (
          (approvedPositions?.length ?? 0) === 0 ? (
            <EmptyState
              icon={ApprovalOutlinedIcon}
              title="No available approved positions"
              description="All approved positions have already raised a requisition or have no remaining budget."
            />
          ) : (
            <ConfigSurface sx={{ p: 2.5, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No approved positions match your search. Try different keywords
                or clear the search.
              </Typography>
              <Button
                size="small"
                onClick={() => setSearchQuery("")}
                sx={{ mt: 1.5, textTransform: "none", fontWeight: 600 }}
              >
                Clear search
              </Button>
            </ConfigSurface>
          )
        ) : (
          <Grid container spacing={1.5}>
            {filteredPositions.map((position) => (
              <Grid key={position.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <PositionCatalogueCard
                  position={position}
                  canRaiseRequisition={canRaiseRequisition}
                  onCreateRequisition={handleCreateRequisition}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
}

export default ApprovedPositionCataloguePage;
