import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Stack
} from "@mui/material";

function ApprovalMatrixTable({ matrix }) {

  return (

    <TableContainer>

      <Table size="small">

        <TableHead>

          <TableRow sx={{ bgcolor: "action.hover" }}>

            <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
              Department
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 64 }}>
              Grade
            </TableCell>

            <TableCell sx={{ fontWeight: 700, width: 100 }} align="right">
              Budget Limit
            </TableCell>

            <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>
              Required Approvers
            </TableCell>

            <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>
              Escalation
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {matrix.map((row) => (

            <TableRow key={row.id} hover>

              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {row.department}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={row.grade}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                />
              </TableCell>

              <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                  {row.budget_limit_lpa} LPA
                </Typography>
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {row.required_approvers.map((approver) => (
                    <Chip
                      key={approver}
                      label={approver}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 22, fontSize: 10, fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {row.escalation}
                </Typography>
              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </TableContainer>

  );

}

export default ApprovalMatrixTable;
