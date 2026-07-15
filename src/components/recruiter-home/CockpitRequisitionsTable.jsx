import {
  Box,
  Typography,
  Chip,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress
} from "@mui/material";
import { MdWorkOutline } from "react-icons/md";
import { DESIGN, PANEL_HEADER, PANEL_SHELL, ROW_INTERACTIVE } from "./recruiterHomeTokens";

const STATUS_STYLES = {
  ACTIVE: { bg: DESIGN.greenBg, color: DESIGN.green },
  "ON HOLD": { bg: "#F2F4F7", color: "#344054" },
  URGENT: { bg: DESIGN.redBg, color: DESIGN.red }
};

function StatusChip({ label }) {
  const style = STATUS_STYLES[label] || STATUS_STYLES.ACTIVE;
  return (
    <Chip label={label} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: style.bg, color: style.color }} />
  );
}

const thSx = { fontSize: 10, fontWeight: 700, color: DESIGN.textSecondary, py: 0.65, px: 1.5, borderBottom: `1px solid ${DESIGN.border}`, bgcolor: "#F9FAFB", letterSpacing: "0.03em", whiteSpace: "nowrap" };
const tdSx = { fontSize: 12, color: DESIGN.textPrimary, py: 0.75, px: 1.5, borderBottom: `1px solid ${DESIGN.border}` };

function CockpitRequisitionsTable({ rows = [], selectedId, onSelect, onViewAll }) {
  return (
    <Box sx={{ ...PANEL_SHELL, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Box sx={{ ...PANEL_HEADER, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <MdWorkOutline size={18} color={DESIGN.textSecondary} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: DESIGN.textSecondary, letterSpacing: "0.04em" }}>
            MY REQUISITIONS
          </Typography>
        </Box>
        <Link component="button" type="button" underline="hover" onClick={onViewAll} sx={{ fontSize: 12, fontWeight: 600, color: DESIGN.blue, border: 0, bgcolor: "transparent", cursor: "pointer" }}>
          View All Requisitions →
        </Link>
      </Box>

      {rows.length === 0 ? (
        <Box sx={{ px: 1.5, py: 2 }}>
          <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary }}>No requisitions assigned.</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={thSx}>REQ ID</TableCell>
                  <TableCell sx={thSx}>ROLE / POSITION</TableCell>
                  <TableCell sx={thSx}>HIRING MANAGER</TableCell>
                  <TableCell sx={thSx} align="center">OPEN / TARGET</TableCell>
                  <TableCell sx={{ ...thSx, minWidth: 120 }}>FUNNEL PROGRESS</TableCell>
                  <TableCell sx={thSx}>STATUS</TableCell>
                  <TableCell sx={thSx}>NEXT ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selectedId === row.id}
                    onClick={() => onSelect?.(row)}
                    sx={{ ...ROW_INTERACTIVE, "&.Mui-selected": { bgcolor: "#EFF8FF !important" } }}
                  >
                    <TableCell sx={{ ...tdSx, fontWeight: 600 }}>{row.code}</TableCell>
                    <TableCell sx={tdSx}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{row.title}</Typography>
                      {row.roleSubtitle && (
                        <Typography sx={{ fontSize: 11, color: DESIGN.textSecondary }}>{row.roleSubtitle}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, color: DESIGN.textSecondary }}>{row.hiringManager || "—"}</TableCell>
                    <TableCell sx={tdSx} align="center">{row.funnelCurrent} / {row.funnelTarget}</TableCell>
                    <TableCell sx={tdSx}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <LinearProgress variant="determinate" value={row.progress} sx={{ flex: 1, height: 6, borderRadius: 1, bgcolor: "#EAECF0", "& .MuiLinearProgress-bar": { bgcolor: DESIGN.blue, borderRadius: 1 } }} />
                        <Typography sx={{ fontSize: 11, fontWeight: 600, minWidth: 28 }}>{row.progress}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={tdSx}><StatusChip label={row.displayStatus} /></TableCell>
                    <TableCell sx={{ ...tdSx, color: DESIGN.textSecondary, fontSize: 11 }}>{row.nextAction}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Box sx={{ px: 1.5, py: 0.75, borderTop: `1px solid ${DESIGN.border}`, bgcolor: "#F9FAFB" }}>
            <Typography sx={{ fontSize: 11, color: DESIGN.textSecondary, textAlign: "center" }}>
              Showing 1 to {rows.length} of {rows.length} requisitions
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

export default CockpitRequisitionsTable;
