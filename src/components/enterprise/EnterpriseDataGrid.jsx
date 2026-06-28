import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import EnterpriseSurface from "./EnterpriseSurface";

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

  return (
    <EnterpriseSurface padding={false} sx={{ overflow: "hidden", ...sx }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={!checkboxSelection}
        onRowClick={onRowClick}
        getRowId={getRowId}
        density="compact"
        rowHeight={36}
        columnHeaderHeight={36}
        hideFooterSelectedRowCount
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } }
        }}
        sx={{
          height,
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
      />
    </EnterpriseSurface>
  );
}

export default EnterpriseDataGrid;
