import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

import {
  annexureRowKind,
  buildAnnexureLayout,
  formatAnnexureAmount,
  hasAnnexureBreakup
} from "@/utils/offerAnnexureUtils";

const denseCellSx = {
  py: 0.625,
  px: 1.5,
  fontSize: 13,
  lineHeight: 1.4
};

const dividerSx = {
  borderTop: "1px solid",
  borderColor: "divider",
  py: 0,
  px: 0,
  height: 0
};

const totalRowSx = {
  bgcolor: "grey.50"
};

function AnnexureAmountCell({ value }) {
  if (value === null || value === undefined) {
    return <TableCell align="right" sx={denseCellSx} />;
  }

  return (
    <TableCell
      align="right"
      sx={{
        ...denseCellSx,
        fontVariantNumeric: "tabular-nums"
      }}
    >
      {formatAnnexureAmount(value)}
    </TableCell>
  );
}

function AnnexureLayoutRow({ row }) {
  if (row.kind === annexureRowKind.DIVIDER) {
    return (
      <TableRow>
        <TableCell colSpan={3} sx={{ ...denseCellSx, ...dividerSx, borderBottom: "none" }} />
      </TableRow>
    );
  }

  if (row.kind === annexureRowKind.SECTION_HEADER) {
    return (
      <TableRow>
        <TableCell
          colSpan={3}
          align="left"
          sx={{
            ...denseCellSx,
            fontWeight: 600,
            color: "text.secondary",
            pt: 1.25,
            pb: 0.25
          }}
        >
          {row.label}
        </TableCell>
      </TableRow>
    );
  }

  const rowSx = row.highlight ? totalRowSx : undefined;
  const fontWeight = row.bold ? 700 : 400;

  return (
    <TableRow sx={rowSx}>
      <TableCell align="left" sx={{ ...denseCellSx, fontWeight }}>
        {row.label}
      </TableCell>
      <AnnexureAmountCell value={row.monthlyOnly || !row.annualOnly ? row.monthly : null} />
      <AnnexureAmountCell value={row.annualOnly || !row.monthlyOnly ? row.annual : null} />
    </TableRow>
  );
}

function OfferCompensationBreakupTable({ components, gross, totalCtc }) {
  if (!hasAnnexureBreakup(components)) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Run offer letter generation to calculate and persist the salary breakup.
        </Typography>
      </Paper>
    );
  }

  const layout = buildAnnexureLayout(components, gross, totalCtc);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow sx={totalRowSx}>
            <TableCell align="left" sx={{ ...denseCellSx, fontWeight: 700, width: "46%" }}>
              Particulars
            </TableCell>
            <TableCell align="right" sx={{ ...denseCellSx, fontWeight: 700, width: "27%" }}>
              Monthly (₹)
            </TableCell>
            <TableCell align="right" sx={{ ...denseCellSx, fontWeight: 700, width: "27%" }}>
              Annual (₹)
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {layout.map((row) => (
            <AnnexureLayoutRow key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default OfferCompensationBreakupTable;
