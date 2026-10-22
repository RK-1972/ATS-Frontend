import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

import {
  formatFormulaBasis,
  formatFormulaValue
} from "@/utils/compensationUtils";

function BoolCell({ value }) {
  return (
    <Chip
      label={value ? "Yes" : "No"}
      size="small"
      color={value ? "success" : "default"}
      variant="outlined"
      sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
    />
  );
}

function CompensationStructureComponentsTable({
  structure,
  components,
  canEdit = false,
  onSaveComponent
}) {
  const [draftValues, setDraftValues] = useState({});
  const [savingId, setSavingId] = useState("");
  const [rowError, setRowError] = useState("");

  const rows = useMemo(() => components || [], [components]);

  if (!structure) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No compensation structure is configured.
        </Typography>
      </Paper>
    );
  }

  const handleSave = async (component) => {
    const draft = draftValues[component.structureComponentId];

    if (!draft) {
      return;
    }

    setSavingId(component.structureComponentId);
    setRowError("");

    try {
      await onSaveComponent?.(component, draft);
      setDraftValues((current) => {
        const next = { ...current };
        delete next[component.structureComponentId];
        return next;
      });
    } catch (error) {
      setRowError(
        error?.response?.data?.message || "Unable to save component rule."
      );
    } finally {
      setSavingId("");
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {structure.structureName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {structure.structureCode}
          {structure.isDefault ? " · Default" : ""}
          {structure.effectiveFrom
            ? ` · Effective from ${structure.effectiveFrom}`
            : ""}
        </Typography>
      </Box>

      {rowError ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {rowError}
        </Alert>
      ) : null}

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Component</TableCell>
              <TableCell>Formula Type</TableCell>
              <TableCell>Basis</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Include in CTC</TableCell>
              <TableCell>Editable</TableCell>
              {canEdit ? <TableCell align="right">Actions</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((component) => {
              const draft = draftValues[component.structureComponentId] || {};
              const isPercent =
                component.formulaType === "PERCENT_OF_CTC" ||
                component.formulaType === "PERCENT_OF_BASIC";
              const isFixed = component.formulaType === "FIXED";
              const showEditor = canEdit && component.editable && (isPercent || isFixed);

              return (
                <TableRow key={component.structureComponentId}>
                  <TableCell>{component.componentName}</TableCell>
                  <TableCell>{component.formulaType}</TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatFormulaBasis(component)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {showEditor ? (
                      <TextField
                        size="small"
                        type="number"
                        value={
                          draft.formulaValue ??
                          draft.fixedAmount ??
                          (isPercent
                            ? component.formulaValue ?? ""
                            : component.fixedAmount ?? "")
                        }
                        onChange={(event) => {
                          const value = event.target.value;
                          setDraftValues((current) => ({
                            ...current,
                            [component.structureComponentId]: isPercent
                              ? { formulaValue: value }
                              : { fixedAmount: value }
                          }));
                        }}
                        sx={{ width: 120 }}
                        inputProps={{ min: 0, step: "0.01" }}
                      />
                    ) : (
                      formatFormulaValue(component)
                    )}
                  </TableCell>
                  <TableCell>
                    <BoolCell value={component.includeInCtc} />
                  </TableCell>
                  <TableCell>
                    <BoolCell value={component.editable} />
                  </TableCell>
                  {canEdit ? (
                    <TableCell align="right">
                      {showEditor ? (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={savingId === component.structureComponentId}
                          onClick={() => handleSave(component)}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          Save
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={0.5} sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Percentages apply to annual amounts. Basic uses approved annual CTC;
          HRA uses annual Basic (+ DA). Changes affect new calculations only;
          issued offer letters keep their locked snapshot.
        </Typography>
      </Stack>
    </Box>
  );
}

export default CompensationStructureComponentsTable;
