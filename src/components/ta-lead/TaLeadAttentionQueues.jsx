import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";

import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import { PANEL_SHELL, PANEL_HEADER } from "./taLeadTokens";

function QueueTable({ rows, emptyLabel, actionLabel, onAction }) {
  if (!rows.length) {
    return (
      <Typography sx={{ px: 1.5, py: 1, fontSize: 12, color: "text.secondary" }}>
        {emptyLabel}
      </Typography>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 420 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", py: 0.75 }}>
              Requisition
            </TableCell>
            <TableCell sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", py: 0.75 }}>
              Role
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", py: 0.75, width: 120 }}
            >
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const code = row.req_code || row.requisition_code;

            return (
              <TableRow
                key={row.requisition_code || code}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 }, "& td": { py: 0.7 } }}
              >
                <TableCell>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
                    {code}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.2 }}>
                    {row.client_name || row.department || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 12, lineHeight: 1.3 }}>
                    {row.job_title || "—"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onAction(row)}
                    sx={{ textTransform: "none", fontSize: 11, py: 0.25 }}
                  >
                    {actionLabel}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

function QueueSection({ title, subtitle, icon, children }) {
  return (
    <Box sx={PANEL_SHELL}>
      <Box
        sx={{
          ...PANEL_HEADER,
          display: "flex",
          alignItems: "center",
          gap: 0.75
        }}
      >
        <EnterpriseModuleIcon
          icon={icon}
          module="recruitment"
          density="sm"
          size={28}
          iconSize={16}
        />
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.2 }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
      {children}
    </Box>
  );
}

function TaLeadAttentionQueues({
  withoutRecruiter = [],
  closureEligible = [],
  onAssignRecruiter,
  onManageClosure
}) {
  const hasQueues = withoutRecruiter.length > 0 || closureEligible.length > 0;

  if (!hasQueues) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      {withoutRecruiter.length > 0 ? (
        <QueueSection
          title="Approved Without Recruiter"
          subtitle={`${withoutRecruiter.length} requisition${withoutRecruiter.length === 1 ? "" : "s"} need assignment`}
          icon={AssignmentIndOutlinedIcon}
        >
          <QueueTable
            rows={withoutRecruiter}
            emptyLabel="No unassigned approved requisitions."
            actionLabel="Assign"
            onAction={onAssignRecruiter}
          />
        </QueueSection>
      ) : null}

      {closureEligible.length > 0 ? (
        <QueueSection
          title="Closure Eligible"
          subtitle={`${closureEligible.length} requisition${closureEligible.length === 1 ? "" : "s"} ready to close`}
          icon={TaskAltOutlinedIcon}
        >
          <QueueTable
            rows={closureEligible}
            emptyLabel="No closure-eligible requisitions."
            actionLabel="Manage"
            onAction={onManageClosure}
          />
        </QueueSection>
      ) : null}
    </Stack>
  );
}

export default TaLeadAttentionQueues;
