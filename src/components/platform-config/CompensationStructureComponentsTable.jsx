import {

  Box,

  Chip,

  Paper,

  Table,

  TableBody,

  TableCell,

  TableContainer,

  TableHead,

  TableRow,

  Typography

} from "@mui/material";



import { formatFormulaValue } from "@/utils/compensationUtils";



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



function CompensationStructureComponentsTable({ structure, components }) {

  if (!structure) {

    return (

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>

        <Typography variant="body2" color="text.secondary">

          No compensation structure is configured.

        </Typography>

      </Paper>

    );

  }



  return (

    <Box>

      <Box sx={{ mb: 1.5 }}>

        <Typography variant="subtitle1" fontWeight={700}>

          {structure.structureName}

        </Typography>

        <Typography variant="caption" color="text.secondary">

          {structure.structureCode}

          {structure.isDefault ? " · Default" : ""}

        </Typography>

      </Box>



      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>

        <Table size="small">

          <TableHead>

            <TableRow>

              <TableCell>Component</TableCell>

              <TableCell>Formula Type</TableCell>

              <TableCell>Formula Value</TableCell>

              <TableCell>Editable</TableCell>

              <TableCell>Mandatory</TableCell>

              <TableCell>Include in CTC</TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {(components || []).map((component) => (

              <TableRow key={component.structureComponentId}>

                <TableCell>{component.componentName}</TableCell>

                <TableCell>{component.formulaType}</TableCell>

                <TableCell>{formatFormulaValue(component)}</TableCell>

                <TableCell>

                  <BoolCell value={component.editable} />

                </TableCell>

                <TableCell>

                  <BoolCell value={component.mandatory} />

                </TableCell>

                <TableCell>

                  <BoolCell value={component.includeInCtc} />

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </TableContainer>

    </Box>

  );

}



export default CompensationStructureComponentsTable;

