import { useMemo } from "react";

import {
  Box,
  Button,
  Stack,
  TablePagination,
  Typography
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import {
  EmptyState,
  EnterpriseSurface,
  LoadingState
} from "../enterprise";
import { formatOptalynxDateTimeValue } from "@/utils/formatDateTime";
import ReportExportMenu from "./ReportExportMenu";

function formatCellValue(value, dataType) {
  if (value === null || value === undefined || value === "") {
    return dataType === "date" ? "—" : "";
  }

  if (dataType === "date") {
    return formatOptalynxDateTimeValue(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

function ReportResults({
  results,
  loading,
  hasGenerated,
  pagination,
  exporting,
  onExport,
  onPageChange,
  onAdjustFilters,
  onClearFilters
}) {
  const columns = useMemo(
    () =>
      (results?.columns || []).map((column) => ({
        field: column.code,
        headerName: column.label,
        minWidth: 140,
        flex: 1,
        valueFormatter: (value) => formatCellValue(value, column.data_type)
      })),
    [results]
  );

  const rows = useMemo(
    () =>
      (results?.rows || []).map((row, index) => ({
        id: `${pagination.page}-${index}`,
        ...row
      })),
    [results, pagination.page]
  );

  if (!hasGenerated && !loading) {
    return (
      <EnterpriseSurface sx={{ p: 2 }}>
        <EmptyState
          module="reports"
          title="No report generated yet"
          description="Configure fields, filters, and sorting, then select Generate Report to view results."
        />
      </EnterpriseSurface>
    );
  }

  if (loading) {
    return (
      <EnterpriseSurface sx={{ p: 1 }}>
        <LoadingState message="Generating report…" size={28} />
      </EnterpriseSurface>
    );
  }

  const totalCount = pagination.totalCount || 0;
  const datasetName = results?.dataset?.name || "Report";

  return (
    <Box sx={{ minWidth: 0, maxWidth: "100%", width: "100%" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              display: "block"
            }}
          >
            Report Results
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {datasetName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
            {totalCount.toLocaleString()} record{totalCount === 1 ? "" : "s"}
            {totalCount > 0
              ? ` · Page ${pagination.page} · ${pagination.pageSize} per page`
              : ""}
          </Typography>
        </Box>

        <ReportExportMenu
          disabled={!hasGenerated || loading}
          exporting={exporting}
          onExport={onExport}
        />
      </Stack>

      {totalCount === 0 ? (
        <EnterpriseSurface sx={{ p: 2 }}>
          <EmptyState
            module="reports"
            title="No records match the current report criteria."
            description="Try adjusting or clearing filters, then generate the report again."
            actionLabel="Adjust Filters"
            onAction={onAdjustFilters}
          />
          <Stack direction="row" justifyContent="center" spacing={1} sx={{ pb: 2 }}>
            <Button size="small" variant="text" onClick={onClearFilters}>
              Clear Filters
            </Button>
          </Stack>
        </EnterpriseSurface>
      ) : (
        <Box sx={{ minWidth: 0, maxWidth: "100%", width: "100%", overflow: "hidden" }}>
          <EnterpriseSurface padding={false} sx={{ overflow: "hidden", maxWidth: "100%" }}>
            <Box sx={{ width: "100%", minWidth: 0, maxWidth: "100%", overflowX: "auto" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                hideFooter
                rowHeight={36}
                columnHeaderHeight={36}
                sx={{
                  minWidth: Math.max(columns.length * 160, 640),
                  height: Math.min(Math.max(rows.length * 36 + 40, 180), 420),
                  border: "none",
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 600
                  }
                }}
              />
            </Box>
          </EnterpriseSurface>

          <TablePagination
            component="div"
            count={totalCount}
            page={Math.max(pagination.page - 1, 0)}
            onPageChange={(_, page) => onPageChange(page + 1, pagination.pageSize)}
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={(event) =>
              onPageChange(1, parseInt(event.target.value, 10))
            }
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ px: 0.5 }}
          />
        </Box>
      )}
    </Box>
  );
}

export default ReportResults;
