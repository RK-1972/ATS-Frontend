import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

import ConfigSurface from "../platform-config/ConfigSurface";
import WorkforceStatusChip from "./WorkforceStatusChip";

function ApprovalHistory({ entries }) {

  if (!entries.length) {

    return (

      <ConfigSurface>

        <Typography variant="body2" fontWeight={700} mb={0.5} sx={{ fontSize: 14 }}>
          Approval history
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
          No prior approval actions recorded.
        </Typography>

      </ConfigSurface>

    );

  }

  return (

    <ConfigSurface sx={{ p: 0, overflow: "hidden" }}>

      <Typography variant="body2" fontWeight={700} sx={{ px: 1.5, py: 1, fontSize: 14 }}>
        Approval history
      </Typography>

      <TableContainer>

        <Table size="small">

          <TableHead>

            <TableRow sx={{ bgcolor: "action.hover" }}>

              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Actor</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Comment</TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {entries.map((entry, index) => (

              <TableRow key={index} hover>

                <TableCell sx={{ py: 0.75 }}>
                  <WorkforceStatusChip status={entry.action} />
                </TableCell>

                <TableCell sx={{ py: 0.75, fontSize: 13 }}>{entry.actor}</TableCell>

                <TableCell sx={{ py: 0.75, fontSize: 12 }}>
                  {new Date(entry.date).toLocaleDateString()}
                </TableCell>

                <TableCell sx={{ py: 0.75, fontSize: 12, maxWidth: 200 }}>
                  {entry.comment || "—"}
                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </TableContainer>

    </ConfigSurface>

  );

}

export default ApprovalHistory;
