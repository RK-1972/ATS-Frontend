import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Typography
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";

const STATUS_COLORS = {
  Active: "success",
  Draft: "warning",
  "Pending Approval": "info"
};

const PRIORITY_COLORS = {
  High: "error",
  Medium: "secondary",
  Low: "default"
};

function RuleLibraryTable({ rules, onEdit, onSimulate }) {

  return (

    <TableContainer>

      <Table size="small">

        <TableHead>

          <TableRow sx={{ bgcolor: "action.hover" }}>

            <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>
              Rule Name
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 100 }}>
              Category
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 80 }}>
              Priority
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 110 }}>
              Status
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 100 }}>
              Last Modified
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 56 }} align="center">
              Version
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 88 }} align="center">
              Actions
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {rules.map((rule) => (

            <TableRow key={rule.id} hover>

              <TableCell>
                <Typography variant="body2" fontWeight={700}>
                  {rule.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {rule.description}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="caption" fontWeight={600}>
                  {rule.category}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={rule.priority}
                  size="small"
                  color={PRIORITY_COLORS[rule.priority] || "default"}
                  variant="outlined"
                  sx={{ height: 22, fontSize: 10, fontWeight: 600 }}
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={rule.status}
                  size="small"
                  color={STATUS_COLORS[rule.status] || "default"}
                  variant={rule.status === "Active" ? "filled" : "outlined"}
                  sx={{ height: 22, fontSize: 10, fontWeight: 600 }}
                />
              </TableCell>

              <TableCell>
                <Typography variant="caption">
                  {new Date(rule.last_modified).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric", year: "numeric" }
                  )}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="caption" fontWeight={600}>
                  {rule.version}
                </Typography>
              </TableCell>

              <TableCell align="center">

                <Tooltip title="Edit rule">
                  <IconButton
                    size="small"
                    onClick={() => onEdit?.(rule.id)}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Simulate">
                  <IconButton
                    size="small"
                    onClick={() => onSimulate?.(rule.id)}
                  >
                    <PlayCircleOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </TableContainer>

  );

}

export default RuleLibraryTable;
