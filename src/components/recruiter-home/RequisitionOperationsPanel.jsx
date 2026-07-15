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
  TextField,
  InputAdornment
} from "@mui/material";
import { MdSearch } from "react-icons/md";
import { DESIGN, PANEL_HEADER, PANEL_SHELL, ROW_INTERACTIVE, TRANSITION_MS } from "./recruiterHomeTokens";
import { PRIORITY_CHIP } from "./recruiterHomeUiHelpers";

function PriorityChip({ label }) {
  const style = PRIORITY_CHIP[label] || PRIORITY_CHIP.Low;
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20,
        fontSize: 10,
        fontWeight: 600,
        bgcolor: style.bgcolor,
        color: style.color,
        border: `1px solid ${style.border}`
      }}
    />
  );
}

function StatusChip({ status }) {
  const lower = String(status || "").toLowerCase();
  let style = { bgcolor: "#F2F4F7", color: "#344054", border: "#EAECF0" };
  if (lower.includes("open")) style = { bgcolor: DESIGN.greenBg, color: DESIGN.green, border: "#ABEFC6" };
  if (lower.includes("offer")) style = { bgcolor: DESIGN.orangeBg, color: DESIGN.orange, border: "#FEC84B" };

  const label = lower.includes("offer") ? "Offer Stage" : status;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20,
        fontSize: 10,
        fontWeight: 600,
        bgcolor: style.bgcolor,
        color: style.color,
        border: `1px solid ${style.border}`
      }}
    />
  );
}

function BlockProgress({ value = 0, segments = 10 }) {
  const filled = Math.round((Math.min(100, Math.max(0, value)) / 100) * segments);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 100 }}>
      <Box sx={{ display: "flex", gap: "2px", flex: 1 }}>
        {Array.from({ length: segments }, (_, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 10,
              maxWidth: 8,
              borderRadius: 0.5,
              bgcolor: i < filled ? DESIGN.blue : "#EAECF0",
              transition: `background-color ${TRANSITION_MS}`
            }}
          />
        ))}
      </Box>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: DESIGN.textPrimary, minWidth: 32, flexShrink: 0 }}>
        {value}%
      </Typography>
    </Box>
  );
}

const thSx = {
  fontSize: 11,
  fontWeight: 600,
  color: DESIGN.textSecondary,
  py: 0.5,
  px: 1.25,
  borderBottom: `1px solid ${DESIGN.border}`,
  bgcolor: "#F9FAFB",
  whiteSpace: "nowrap"
};

const tdSx = {
  fontSize: 12,
  color: DESIGN.textPrimary,
  py: 0.5,
  px: 1.25,
  borderBottom: `1px solid ${DESIGN.border}`
};

function RequisitionOperationsPanel({
  rows = [],
  selectedId,
  onSelect,
  onViewAll,
  searchQuery = "",
  onSearchChange
}) {
  const activeCount = rows.length;

  return (
    <Box sx={{ ...PANEL_SHELL, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", width: "100%" }}>
      <Box
        sx={{
          ...PANEL_HEADER,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexShrink: 0
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: DESIGN.textPrimary }}>
            My Requisitions
          </Typography>
          <Typography sx={{ fontSize: 12, color: DESIGN.textSecondary }}>
            {activeCount} Active
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1, justifyContent: "flex-end" }}>
          <TextField
            size="small"
            placeholder="Search requisitions…"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={16} color={DESIGN.textMuted} />
                </InputAdornment>
              ),
              sx: { fontSize: 12, height: 32, borderRadius: 1.5 }
            }}
            sx={{
              width: { xs: 140, md: 220 },
              flexShrink: 0,
              "& .MuiOutlinedInput-root": { bgcolor: "#F9FAFB" }
            }}
          />
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={onViewAll}
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: DESIGN.blue,
              border: 0,
              bgcolor: "transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
          >
            View all requisitions
          </Link>
        </Box>
      </Box>

      {rows.length === 0 ? (
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary }}>
            No requisitions match the current filter.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={thSx}>Position</TableCell>
                <TableCell sx={thSx}>Req ID</TableCell>
                <TableCell sx={thSx}>Department</TableCell>
                <TableCell sx={thSx}>Status</TableCell>
                <TableCell sx={thSx} align="center">Open</TableCell>
                <TableCell sx={thSx} align="center">Filled</TableCell>
                <TableCell sx={thSx} align="center">Pending Intv.</TableCell>
                <TableCell sx={{ ...thSx, minWidth: 120 }}>Progress</TableCell>
                <TableCell sx={thSx}>Risk</TableCell>
                <TableCell sx={{ ...thSx, minWidth: 140 }}>Next Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isSelected = selectedId === row.id;
                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={isSelected}
                    onClick={() => onSelect?.(row)}
                    sx={{
                      ...ROW_INTERACTIVE,
                      "&.Mui-selected": { bgcolor: "#EFF8FF !important" },
                      "&.Mui-selected:hover": { bgcolor: "#EFF8FF !important" },
                      transition: `background-color ${TRANSITION_MS}`
                    }}
                  >
                    <TableCell sx={{ ...tdSx, fontWeight: 600 }}>{row.title}</TableCell>
                    <TableCell sx={tdSx}>{row.code}</TableCell>
                    <TableCell sx={{ ...tdSx, color: DESIGN.textSecondary }}>{row.department || "—"}</TableCell>
                    <TableCell sx={tdSx}><StatusChip status={row.status} /></TableCell>
                    <TableCell sx={tdSx} align="center">{row.openPositions}</TableCell>
                    <TableCell sx={tdSx} align="center">{row.filled}</TableCell>
                    <TableCell sx={tdSx} align="center">{row.pendingInterviews}</TableCell>
                    <TableCell sx={tdSx}>
                      <BlockProgress value={row.progress} />
                    </TableCell>
                    <TableCell sx={tdSx}><PriorityChip label={row.risk} /></TableCell>
                    <TableCell sx={{ ...tdSx, color: DESIGN.textSecondary, fontSize: 11 }}>
                      {row.nextAction}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

export default RequisitionOperationsPanel;
