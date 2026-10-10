import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import EnterpriseSurface from "./EnterpriseSurface";
import { ENTERPRISE_DATA_GRID_SURFACE_SX } from "./enterpriseDataGridTokens";

function EnterpriseDataGrid({
  rows = [],
  columns = [],
  loading = false,
  height = 360,
  onRowClick,
  getRowId,
  checkboxSelection = false,
  sx = {},
  ...props
}) {
  const theme = useTheme();
  const { typography } = theme.tokens;
  const usesControlledPagination =
    props.pagination != null || props.paginationModel != null;

  return (
    <EnterpriseSurface
      padding={false}
      data-enterprise-grid-scroll="table"
      sx={{ ...ENTERPRISE_DATA_GRID_SURFACE_SX, ...sx }}
    >
      <DataGrid
        loading={loading}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={!checkboxSelection}
        onRowClick={onRowClick}
        getRowId={getRowId}
        rowHeight={36}
        columnHeaderHeight={36}
        hideFooterSelectedRowCount
        pageSizeOptions={[10, 25, 50]}
        initialState={
          usesControlledPagination
            ? undefined
            : { pagination: { paginationModel: { pageSize: 10 } } }
        }
        sx={{
          height,
          width: "100%",
          minWidth: 0,
          border: "none",
          fontSize: typography.secondary.fontSize,
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
            fontSize: typography.caption.fontSize
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none"
          },
          "& .MuiDataGrid-row:hover": {
            cursor: onRowClick ? "pointer" : "default"
          }
        }}
        {...props}
        rows={rows}
        columns={columns}
      />
    </EnterpriseSurface>
  );
}

export default EnterpriseDataGrid;
