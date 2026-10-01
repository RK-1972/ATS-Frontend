/** MUI DataGrid chrome — taller tap targets on xs/sm only; md+ unchanged. */

export const ENTERPRISE_DATA_GRID_TOUCH_SX = {
  "& .MuiDataGrid-columnHeader .MuiIconButton-root": {
    width: { xs: 44, md: 28 },
    height: { xs: 44, md: 28 }
  },
  "& .MuiDataGrid-menuIconButton": {
    width: { xs: 44, md: 28 },
    height: { xs: 44, md: 28 }
  },
  "& .MuiTablePagination-root .MuiIconButton-root": {
    width: { xs: 44, md: 34 },
    height: { xs: 44, md: 34 }
  },
  "& .MuiTablePagination-select": {
    minHeight: { xs: 44, md: 32 }
  }
};

export const ENTERPRISE_DATA_GRID_SURFACE_SX = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  overflowX: { xs: "auto", md: "hidden" },
  WebkitOverflowScrolling: "touch",
  ...ENTERPRISE_DATA_GRID_TOUCH_SX
};
