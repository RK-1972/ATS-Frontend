import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import { StatusChip } from "@/components/enterprise";
import { mapApprovalStepRow } from "@/utils/offerApprovalUtils";

/**
 * Offer approval step history — mirrors Budget ApprovalHistory table layout.
 */
function OfferApprovalHistory({ steps = [], title = "Approval history", subtitle }) {
  const rows = steps.map(mapApprovalStepRow);

  if (!rows.length) {
    return (
      <EnterpriseCard title={title} subtitle={subtitle}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
          No approval steps recorded.
        </Typography>
      </EnterpriseCard>
    );
  }

  return (
    <EnterpriseCard title={title} subtitle={subtitle} sx={{ p: 0, overflow: "hidden" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                Step
              </TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                Approver
              </TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                Role
              </TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                Decision
              </TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                Approved date &amp; time
              </TableCell>
              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key} hover>
                <TableCell sx={{ py: 0.75, fontSize: 12, maxWidth: 180 }}>
                  {row.step}
                </TableCell>
                <TableCell sx={{ py: 0.75, fontSize: 13 }}>{row.approver}</TableCell>
                <TableCell sx={{ py: 0.75, fontSize: 13 }}>{row.role}</TableCell>
                <TableCell sx={{ py: 0.75, fontSize: 13 }}>{row.decision}</TableCell>
                <TableCell sx={{ py: 0.75, fontSize: 12, whiteSpace: "nowrap" }}>
                  {row.approvedAt}
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <StatusChip status={row.status || "Pending"} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </EnterpriseCard>
  );
}

export default OfferApprovalHistory;
