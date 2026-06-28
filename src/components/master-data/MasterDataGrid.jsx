import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Stack,
  Tooltip
} from "@mui/material";

import { MdEdit, MdHistory, MdHub } from "react-icons/md";

import ConfigSurface from "../platform-config/ConfigSurface";

const VERSION_COLORS = {
  Published: "success",
  Draft: "warning",
  Archived: "default"
};

function formatDate(isoString) {

  if (!isoString) {
    return "—";
  }

  return new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

}

function MasterDataGrid({

  records,
  onEdit,
  onOpenTab

}) {

  return (

    <ConfigSurface sx={{ p: 0, overflow: "hidden" }}>

      <TableContainer>

        <Table size="small">

          <TableHead>

            <TableRow sx={{ bgcolor: "action.hover" }}>

              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Used In</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Last Updated</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }} align="right">
                Actions
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {!records.length ? (

              <TableRow>

                <TableCell colSpan={7} sx={{ py: 4, textAlign: "center" }}>

                  <Typography variant="body2" color="text.secondary">
                    No master records match the current filters.
                  </Typography>

                </TableCell>

              </TableRow>

            ) : (

              records.map((record) => (

                <TableRow
                  key={record.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => onEdit(record.id)}
                >

                  <TableCell sx={{ py: 0.75 }}>

                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
                      {record.name}
                    </Typography>

                    <Chip
                      label={`v${record.version}`}
                      size="small"
                      color={VERSION_COLORS[record.versionStatus] || "default"}
                      variant={record.versionStatus === "Archived" ? "outlined" : "filled"}
                      sx={{
                        mt: 0.5,
                        height: 20,
                        fontSize: 10,
                        fontWeight: 600
                      }}
                    />

                  </TableCell>

                  <TableCell sx={{ py: 0.75, fontSize: 12, fontFamily: "monospace" }}>
                    {record.code}
                  </TableCell>

                  <TableCell sx={{ py: 0.75, maxWidth: 220 }}>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {record.description || "—"}
                    </Typography>

                  </TableCell>

                  <TableCell sx={{ py: 0.75 }}>

                    <Chip
                      label={record.status}
                      size="small"
                      color={record.status === "Active" ? "success" : "default"}
                      variant={record.status === "Active" ? "filled" : "outlined"}
                      sx={{ height: 22, fontSize: 10, fontWeight: 600 }}
                    />

                  </TableCell>

                  <TableCell sx={{ py: 0.75 }}>

                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>

                      {(record.usedBy || []).slice(0, 3).map((module) => (
                        <Chip
                          key={module}
                          label={module}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10 }}
                        />
                      ))}

                      {(record.usedBy || []).length > 3 && (
                        <Chip
                          label={`+${record.usedBy.length - 3}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10 }}
                        />
                      )}

                    </Stack>

                  </TableCell>

                  <TableCell sx={{ py: 0.75, fontSize: 12, whiteSpace: "nowrap" }}>
                    {formatDate(record.lastUpdated)}
                  </TableCell>

                  <TableCell sx={{ py: 0.75 }} align="right" onClick={(event) => event.stopPropagation()}>

                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">

                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(record.id)}>
                          <MdEdit size={18} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Dependencies">
                        <IconButton
                          size="small"
                          onClick={() => onOpenTab(record.id, "dependencies")}
                        >
                          <MdHub size={18} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="History">
                        <IconButton
                          size="small"
                          onClick={() => onOpenTab(record.id, "history")}
                        >
                          <MdHistory size={18} />
                        </IconButton>
                      </Tooltip>

                    </Stack>

                  </TableCell>

                </TableRow>

              ))

            )}

          </TableBody>

        </Table>

      </TableContainer>

    </ConfigSurface>

  );

}

export default MasterDataGrid;
