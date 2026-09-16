import {
  Avatar,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import { PANEL_SHELL, PANEL_HEADER, ROW_INTERACTIVE } from "./taLeadTokens";

function initialsFromName(name, code) {
  const source = String(name || code || "").trim();
  if (!source) {
    return "?";
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function deriveWorkloadAttention(activeCandidates, rows) {
  if (!rows.length) {
    return { label: "Normal", level: "normal" };
  }

  const counts = rows.map((row) => row.active_candidates ?? 0);
  const max = Math.max(...counts, 0);

  if (max === 0 || activeCandidates === 0) {
    return { label: "Normal", level: "normal" };
  }

  const ratio = activeCandidates / max;

  if (ratio >= 0.67) {
    return { label: "High", level: "high" };
  }

  if (ratio >= 0.34) {
    return { label: "Medium", level: "medium" };
  }

  return { label: "Normal", level: "normal" };
}

function AttentionPill({ label, level }) {
  const theme = useTheme();
  const palette = level === "high"
    ? theme.tokens.priorityColors.critical
    : level === "medium"
      ? theme.tokens.priorityColors.high
      : theme.tokens.priorityColors.normal;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 0.85,
        py: 0.2,
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.4,
        bgcolor: palette.bg,
        color: palette.text
      }}
    >
      {label}
    </Box>
  );
}

function TaLeadWorkloadSummary({ rows = [], onRowClick }) {
  if (!rows.length) {
    return null;
  }

  const totalRecruiters = rows.length;

  return (
    <Box sx={PANEL_SHELL}>
      <Box
        sx={{
          ...PANEL_HEADER,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <EnterpriseModuleIcon
            icon={GroupsOutlinedIcon}
            module="recruitment"
            density="sm"
            size={28}
            iconSize={16}
          />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
              Recruiter Workload Summary
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.2 }}>
              Active assignments and pipeline load
            </Typography>
          </Box>
        </Stack>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "text.secondary",
            whiteSpace: "nowrap"
          }}
        >
          {totalRecruiters} recruiter{totalRecruiters === 1 ? "" : "s"}
        </Typography>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 480 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", py: 0.85 }}>
                Recruiter
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", py: 0.85, width: 110 }}
              >
                Requisitions
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", py: 0.85, width: 130 }}
              >
                Active Candidates
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", py: 0.85, width: 100 }}
              >
                Load
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const displayName = row.full_name || row.recruiter_code || "—";
              const attention = deriveWorkloadAttention(row.active_candidates ?? 0, rows);

              return (
                <TableRow
                  key={row.id}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{
                    ...(onRowClick ? ROW_INTERACTIVE : {}),
                    "&:last-child td": { borderBottom: 0 },
                    "& td": { py: 0.75 }
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1} minWidth={0}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: "secondary.main",
                          color: "primary.main"
                        }}
                      >
                        {initialsFromName(row.full_name, row.recruiter_code)}
                      </Avatar>
                      <Box minWidth={0}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {displayName}
                        </Typography>
                        {row.full_name && row.recruiter_code ? (
                          <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.2 }}>
                            {row.recruiter_code}
                          </Typography>
                        ) : null}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums"
                      }}
                    >
                      {row.active_requisitions ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: attention.level === "high" ? "error.main" : "text.primary"
                      }}
                    >
                      {row.active_candidates ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <AttentionPill label={attention.label} level={attention.level} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

export default TaLeadWorkloadSummary;
