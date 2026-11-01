import { useMemo, useState } from "react";
import { Box, Chip, IconButton, LinearProgress, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { EnterpriseDataGrid } from "@/components/enterprise";
import OtiRecruiterActionBar from "./OtiRecruiterActionBar";
import OtiMatchExplanationDrawer from "./OtiMatchExplanationDrawer";
import { getLatestRecruiterAction } from "./otiDiscoveryFilters";

function sourceLabel(sourceType) {
  const value = String(sourceType || "");

  if (value.includes("resume_index") || value.includes("indexed_resume")) {
    return value.includes("+") ? "Pool + Resume" : "Resume index";
  }

  if (sourceType === "historical") {
    return "Historical";
  }

  return "Talent Pool";
}

function readMatchPct(row) {
  const direct = Number(row?.match_pct);
  if (Number.isFinite(direct)) {
    return Math.min(100, Math.max(0, direct));
  }

  const fromExplanation = Number(row?.explanation?.structured_skill_pct);
  if (Number.isFinite(fromExplanation)) {
    return Math.min(100, Math.max(0, fromExplanation));
  }

  return 0;
}

function OtiRunResultsGrid({ rows = [], requisitionCode, onActionRecorded }) {
  const [explainRow, setExplainRow] = useState(null);

  const gridRows = useMemo(
    () =>
      rows.map((row) => ({
        id: row.result_id,
        ...row
      })),
    [rows]
  );

  const columns = useMemo(
    () => [
      {
        field: "rank_order",
        headerName: "#",
        width: 52,
        align: "center",
        headerAlign: "center",
        valueGetter: (_value, row) => row.rank_order ?? ""
      },
      {
        field: "candidate_name",
        headerName: "Candidate",
        flex: 1.15,
        minWidth: 160,
        renderCell: (params) => (
          <Box sx={{ minWidth: 0, width: "100%", py: 0.25 }}>
            <Typography variant="body2" fontWeight={700} noWrap title={params.row.candidate_name || ""}>
              {params.row.candidate_name || "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap title={params.row.candidate_code || ""}>
              {params.row.candidate_code || "—"}
            </Typography>
          </Box>
        )
      },
      {
        field: "source_type",
        headerName: "Source",
        flex: 0.75,
        minWidth: 108,
        maxWidth: 140,
        renderCell: (params) => (
          <Chip
            size="small"
            label={sourceLabel(params.row.source_type)}
            color={params.row.source_type === "historical" ? "secondary" : "primary"}
            variant="outlined"
            sx={{ maxWidth: "100%" }}
          />
        )
      },
      {
        field: "recruiter_actions",
        headerName: "Action",
        flex: 0.7,
        minWidth: 100,
        maxWidth: 130,
        sortable: false,
        renderCell: (params) => {
          const latest = getLatestRecruiterAction(params.row.recruiter_actions);
          if (!latest) {
            return (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            );
          }

          return (
            <Chip
              size="small"
              variant="outlined"
              label={latest.action_type.replace(/_/g, " ")}
              sx={{ maxWidth: "100%" }}
            />
          );
        }
      },
      {
        field: "match_pct",
        headerName: "Match",
        flex: 0.85,
        minWidth: 120,
        maxWidth: 150,
        align: "left",
        headerAlign: "left",
        valueGetter: (_value, row) => readMatchPct(row),
        renderCell: (params) => {
          const pct = readMatchPct(params.row);
          return (
            <Box sx={{ width: "100%", minWidth: 0, py: 0.25 }}>
              <Typography variant="caption" fontWeight={700} sx={{ display: "block", mb: 0.5 }}>
                {pct}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{ height: 8, borderRadius: 999 }}
              />
            </Box>
          );
        }
      },
      {
        field: "total_experience",
        headerName: "Exp (yrs)",
        width: 88,
        align: "right",
        headerAlign: "right",
        valueGetter: (_value, row) => row.total_experience ?? null,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ width: "100%", textAlign: "right" }}>
            {params.row.total_experience ?? "—"}
          </Typography>
        )
      },
      {
        field: "explain",
        headerName: "",
        width: 48,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <IconButton
            size="small"
            aria-label="Explain match"
            onClick={() => setExplainRow(params.row)}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        )
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1.5,
        minWidth: 260,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ width: "100%", minWidth: 0, py: 0.25 }}>
            <OtiRecruiterActionBar
              row={params.row}
              requisitionCode={requisitionCode}
              onActionRecorded={onActionRecorded}
            />
          </Box>
        )
      }
    ],
    [requisitionCode, onActionRecorded]
  );

  return (
    <>
      <EnterpriseDataGrid
        rows={gridRows}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        getRowHeight={() => "auto"}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
          sorting: { sortModel: [{ field: "match_pct", sort: "desc" }] }
        }}
        sx={{
          width: "100%",
          minWidth: 0,
          "& .MuiDataGrid-columnHeaders": { minHeight: "40px !important" },
          "& .MuiDataGrid-columnHeader": { minHeight: "40px !important" },
          "& .MuiDataGrid-cell": {
            alignItems: "center",
            py: 1,
            display: "flex"
          },
          "& .MuiDataGrid-cellContent": { width: "100%" }
        }}
      />

      <OtiMatchExplanationDrawer
        open={Boolean(explainRow)}
        onClose={() => setExplainRow(null)}
        row={explainRow}
      />
    </>
  );
}

export default OtiRunResultsGrid;
