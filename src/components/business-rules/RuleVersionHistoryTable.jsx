import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Stack
} from "@mui/material";

import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";

function RuleVersionHistoryTable({

  versions,
  onRollback,
  onCompare

}) {

  return (

    <TableContainer>

      <Table size="small">

        <TableHead>

          <TableRow sx={{ bgcolor: "action.hover" }}>

            <TableCell sx={{ fontWeight: 700, width: 72 }}>
              Version
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 120 }}>
              Published By
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 100 }}>
              Date
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              Description
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 180 }} align="center">
              Actions
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {versions.map((entry, index) => (

            <TableRow key={entry.id} hover>

              <TableCell>
                <Typography variant="body2" fontWeight={700}>
                  {entry.version}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="caption" fontWeight={600}>
                  {entry.published_by}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="caption">
                  {new Date(entry.date).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric", year: "numeric" }
                  )}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {entry.description}
                </Typography>
              </TableCell>

              <TableCell align="center">

                <Stack
                  direction="row"
                  spacing={0.5}
                  justifyContent="center"
                >

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RestoreOutlinedIcon />}
                    onClick={() => onRollback?.(entry.id)}
                    disabled={index === 0}
                    sx={{ fontWeight: 600, fontSize: 11 }}
                  >
                    Rollback
                  </Button>

                  <Button
                    size="small"
                    variant="text"
                    startIcon={<CompareArrowsOutlinedIcon />}
                    onClick={() => onCompare?.(entry.id)}
                    sx={{ fontWeight: 600, fontSize: 11 }}
                  >
                    Compare
                  </Button>

                </Stack>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </TableContainer>

  );

}

export default RuleVersionHistoryTable;
