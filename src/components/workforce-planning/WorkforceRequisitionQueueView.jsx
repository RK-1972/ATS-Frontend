import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  Button,
  Stack
} from "@mui/material";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import ConfigPageHeader from "../platform-config/ConfigPageHeader";
import EnterpriseCard from "../enterprise/framework/EnterpriseCard";
import RequisitionInspectorDrawer from "../requisitions/RequisitionInspectorDrawer";
import WorkforceStatusChip from "./WorkforceStatusChip";
import WorkforceRequisitionQueueService from "@/services/workforceRequisitionQueueService";
import { matchesWorkforceRequisitionSearch } from "@/utils/workforceRequisitionSearch";
import {
  EmptyState,
  EnterpriseDataGrid,
  LoadingState,
  SearchBar
} from "../enterprise";

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString();
}

function WorkforceRequisitionQueueView({
  queueKey,
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  searchPlaceholder,
  primaryActionLabel = "View Requisition"
}) {
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [inspectorRequisitionCode, setInspectorRequisitionCode] = useState(null);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await WorkforceRequisitionQueueService.listQueue(queueKey);
      setRows(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setRows([]);
      setLoadError(
        error.response?.data?.message || "Failed to load requisitions."
      );
    } finally {
      setIsLoading(false);
    }
  }, [queueKey]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    const requisitionCode = location.state?.requisitionCode;
    if (!requisitionCode) {
      return;
    }

    setInspectorRequisitionCode(String(requisitionCode));
  }, [location.state?.requisitionCode]);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesWorkforceRequisitionSearch(row, search)),
    [rows, search]
  );

  const openRequisitionInspector = (row) => {
    if (!row?.requisition_code) {
      return;
    }

    setInspectorRequisitionCode(row.requisition_code);
  };

  const columns = [
    {
      field: "requisition_code",
      headerName: "Requisition",
      minWidth: 140,
      flex: 1
    },
    {
      field: "approved_position_id",
      headerName: "Approved Position",
      minWidth: 140,
      flex: 1
    },
    {
      field: "position_title",
      headerName: "Position",
      minWidth: 160,
      flex: 1.2
    },
    {
      field: "project",
      headerName: "Project",
      minWidth: 130,
      flex: 1,
      valueGetter: (_value, row) => row.project || row.department || "—"
    },
    {
      field: "grade",
      headerName: "Grade",
      width: 90
    },
    {
      field: "req_status",
      headerName: "Status",
      minWidth: 170,
      renderCell: (params) => (
        <WorkforceStatusChip status={params.row.req_status || "—"} />
      )
    },
    {
      field: "created_on",
      headerName: "Raised",
      minWidth: 150,
      valueGetter: (_value, row) => formatDateTime(row.created_on)
    },
    {
      field: "modified_on",
      headerName: "Last Updated",
      minWidth: 150,
      valueGetter: (_value, row) => formatDateTime(row.modified_on)
    },
    {
      field: "workflow_comment",
      headerName: "Comment",
      minWidth: 180,
      flex: 1.2,
      valueGetter: (_value, row) => row.workflow_comment || "—"
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="text"
          startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={(event) => {
            event.stopPropagation();
            openRequisitionInspector(params.row);
          }}
          sx={{ textTransform: "none", fontWeight: 600, minWidth: 0, px: 0.75 }}
        >
          {primaryActionLabel}
        </Button>
      )
    }
  ];

  return (
    <>
      <ConfigPageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
          { label: "Requisitions" },
          { label: title }
        ]}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 1.5 }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={searchPlaceholder}
          sx={{ maxWidth: { sm: 420 }, flex: 1 }}
        />

        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          onClick={loadRows}
          sx={{ alignSelf: { xs: "stretch", sm: "center" }, fontWeight: 600 }}
        >
          Refresh
        </Button>
      </Stack>

      <EnterpriseCard>
        {isLoading ? (
          <LoadingState message="Loading requisitions..." />
        ) : loadError ? (
          <EmptyState
            icon={ErrorOutlineOutlinedIcon}
            title="Unable to load requisitions"
            description={loadError}
            actionLabel="Retry"
            onAction={loadRows}
          />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <EnterpriseDataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.requisition_code}
            height={520}
            disableColumnMenu
            onRowClick={(params) => openRequisitionInspector(params.row)}
          />
        )}
      </EnterpriseCard>

      <RequisitionInspectorDrawer
        open={Boolean(inspectorRequisitionCode)}
        requisitionCode={inspectorRequisitionCode}
        onClose={() => setInspectorRequisitionCode(null)}
        onSubmitted={loadRows}
      />
    </>
  );
}

export default WorkforceRequisitionQueueView;
