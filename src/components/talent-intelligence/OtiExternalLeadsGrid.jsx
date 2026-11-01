import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Stack,
  Typography
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

import recruitmentClient from "@/api/clients/recruitmentClient";
import { EnterpriseDataGrid } from "@/components/enterprise";
import OtiExternalLeadActionBar from "./OtiExternalLeadActionBar";
import OtiExternalLeadReviewButton from "./OtiExternalLeadReviewButton";
import OtiMatchExplanationDrawer from "./OtiMatchExplanationDrawer";
import {
  externalLeadHasRetrievedResume,
  openOrDownloadResumeBlob
} from "./otiExternalResumeDocument";

const REGISTRATION_STATUS_LABELS = {
  staged: "Staged",
  shortlisted: "Shortlisted",
  import_requested: "Review requested",
  imported: "Registered",
  dismissed: "Dismissed",
  rejected: "Rejected"
};

function OtiExternalLeadsGrid({ rows = [], requisitionCode, runId, onActionRecorded }) {
  const [explainRow, setExplainRow] = useState(null);
  const [resumeLoadingLeadId, setResumeLoadingLeadId] = useState(null);

  const handleOpenResume = useCallback(
    async (leadId) => {
      if (!leadId || resumeLoadingLeadId) {
        return;
      }

      setResumeLoadingLeadId(leadId);
      try {
        const { blob, filename } = await recruitmentClient.fetchOtiExternalLeadResumeDocument(leadId, {
          run_id: runId,
          requisition_code: requisitionCode
        });
        openOrDownloadResumeBlob({ blob, filename });
      } catch (error) {
        window.alert(error?.message || "Unable to open resume document.");
      } finally {
        setResumeLoadingLeadId(null);
      }
    },
    [requisitionCode, resumeLoadingLeadId, runId]
  );

  const gridRows = useMemo(
    () =>
      rows.map((row) => ({
        id: row.external_lead_id,
        ...row
      })),
    [rows]
  );

  const columns = useMemo(
    () => [
      {
        field: "display_name",
        headerName: "Candidate",
        flex: 1.15,
        minWidth: 168,
        renderCell: ({ row }) => (
          <Box sx={{ minWidth: 0, py: 0.5, whiteSpace: "normal" }}>
            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.35 }}>
              {row.display_name || "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
              {row.headline || row.current_role || row.organization || "—"}
            </Typography>
          </Box>
        )
      },
      {
        field: "match_score",
        headerName: "Match",
        width: 88,
        align: "center",
        headerAlign: "center",
        valueGetter: (_value, row) => Math.round((Number(row.match_score) || 0) * 100)
      },
      {
        field: "experience",
        headerName: "Experience",
        width: 110,
        sortable: false,
        renderCell: ({ row }) => {
          const years =
            row.match_explanation?.experience_years ??
            row.experience_indicators?.[0]?.years ??
            null;
          return years != null && years !== "" ? `${years} yrs` : "—";
        }
      },
      {
        field: "matching_skills",
        headerName: "Matching skills",
        flex: 1,
        minWidth: 160,
        sortable: false,
        renderCell: ({ row }) => {
          const skills = (row.match_explanation?.matched_skill_tokens || []).slice(0, 4);
          if (skills.length === 0) {
            return "—";
          }
          return (
            <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ py: 0.5 }}>
              {skills.map((skill) => (
                <Chip key={skill} size="small" variant="outlined" label={skill} />
              ))}
            </Stack>
          );
        }
      },
      {
        field: "source",
        headerName: "Source",
        width: 132,
        sortable: false,
        renderCell: ({ row }) => {
          const sources = row.sources?.length
            ? row.sources
            : row.source_providers?.length
              ? row.source_providers
              : [
                  {
                    provider_key: row.provider_key,
                    profile_url: row.profile_url,
                    provider_display_name: row.provider_key
                  }
                ].filter((entry) => entry.provider_key);

          if (!sources.length) {
            return "—";
          }

          return (
            <Stack spacing={0.5} sx={{ py: 0.5 }}>
              {sources.map((source) => {
                const label = source.provider_display_name || source.provider_key || "Source";
                const url = source.profile_url;

                if (!url) {
                  return (
                    <Typography key={`${label}-${url || "na"}`} variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                  );
                }

                return (
                  <Link
                    key={`${label}-${url}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="caption"
                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                  >
                    {label}
                    <OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />
                  </Link>
                );
              })}
            </Stack>
          );
        }
      },
      {
        field: "resume",
        headerName: "Resume",
        width: 96,
        sortable: false,
        renderCell: ({ row }) => {
          const hasResume = externalLeadHasRetrievedResume(row);
          const leadId = row.external_lead_id || row.id;
          const loading = resumeLoadingLeadId === leadId;

          if (!hasResume) {
            return "—";
          }

          return (
            <Link
              component="button"
              type="button"
              disabled={loading}
              onClick={() => handleOpenResume(leadId)}
              sx={{
                display: "inline-flex",
                gap: 0.5,
                alignItems: "center",
                cursor: loading ? "wait" : "pointer"
              }}
            >
              {loading ? <CircularProgress size={14} /> : null}
              View
            </Link>
          );
        }
      },
      {
        field: "import_status",
        headerName: "Registration",
        width: 124,
        renderCell: ({ row }) => {
          const status = String(row.import_status || "staged").toLowerCase();
          const label = REGISTRATION_STATUS_LABELS[status] || status;
          const color =
            status === "imported"
              ? "success"
              : status === "dismissed" || status === "rejected"
                ? "default"
                : "primary";
          return <Chip size="small" label={label} variant="outlined" color={color} />;
        }
      },
      {
        field: "explain",
        headerName: "",
        width: 48,
        sortable: false,
        renderCell: ({ row }) => (
          <IconButton
            size="small"
            aria-label="Explain external match"
            onClick={() =>
              setExplainRow({
                candidate_name: row.display_name,
                match_pct: Math.round((Number(row.match_score) || 0) * 100),
                matched_skills: (row.match_explanation?.matched_skill_tokens || []).map((name) => ({
                  name
                })),
                missing_skills: (row.match_explanation?.missing_skill_tokens || []).map((name) => ({
                  name
                })),
                explanation: row.match_explanation || {}
              })
            }
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        )
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 232,
        minWidth: 232,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack spacing={1} sx={{ width: "100%", py: 0.25 }}>
            <OtiExternalLeadReviewButton
              row={row}
              requisitionCode={requisitionCode}
              runId={runId}
            />
            <OtiExternalLeadActionBar
              row={row}
              requisitionCode={requisitionCode}
              runId={runId}
              onActionRecorded={onActionRecorded}
            />
          </Stack>
        )
      }
    ],
    [handleOpenResume, requisitionCode, runId, onActionRecorded, resumeLoadingLeadId]
  );

  return (
    <>
      <EnterpriseDataGrid
        rows={gridRows}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5, page: 0 } },
          pinnedColumns: { right: ["actions"] }
        }}
        getRowHeight={() => "auto"}
        sx={{
          "& .MuiDataGrid-cell": {
            alignItems: "flex-start",
            py: 1.25,
            lineHeight: 1.4
          },
          "& .MuiDataGrid-cell[data-field='actions']": {
            overflow: "visible"
          },
          "& .MuiDataGrid-columnHeaders": {
            minHeight: 44
          },
          minWidth: { xs: 720, md: 960 }
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

export default OtiExternalLeadsGrid;
