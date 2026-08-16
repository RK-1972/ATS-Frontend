import {

  Box,

  FormControl,

  IconButton,

  InputLabel,

  MenuItem,

  Select,

  Stack,

  Typography

} from "@mui/material";



import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";



import useReportFilterLookups from "../../hooks/useReportFilterLookups";

import ReportFilterValueInput from "./ReportFilterValueInput";

import {

  getDefaultValueForOperator,

  shouldResetValueOnOperatorChange

} from "./reportFilterValueSources";



function operatorLabel(operator) {

  return String(operator || "")

    .split("_")

    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))

    .join(" ");

}



function ReportFilterBuilder({

  filters,

  filterMetaMap,

  fieldMap,

  onAddFilter,

  onUpdateFilter,

  onRemoveFilter

}) {

  const lookups = useReportFilterLookups();

  const filterOptions = Array.from(filterMetaMap.values());



  const handleFieldChange = (filterRow, fieldCode) => {

    const filterMeta = filterMetaMap.get(fieldCode);

    const defaultOperator = filterMeta?.supported_operators?.[0] || "";



    onUpdateFilter(filterRow.id, {

      fieldCode,

      operator: defaultOperator,

      value: getDefaultValueForOperator(defaultOperator),

      valueEnd: ""

    });

  };



  const handleOperatorChange = (filterRow, nextOperator) => {

    const updates = { operator: nextOperator };



    if (shouldResetValueOnOperatorChange(filterRow.operator, nextOperator)) {

      updates.value = getDefaultValueForOperator(nextOperator);

      updates.valueEnd = "";

    }



    onUpdateFilter(filterRow.id, updates);

  };



  return (

    <Box sx={{ minWidth: 0, maxWidth: "100%", width: "100%" }}>

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>

        <Typography

          variant="caption"

          sx={{

            color: "text.secondary",

            fontWeight: 700,

            letterSpacing: 0.6,

            textTransform: "uppercase"

          }}

        >

          Filters

        </Typography>

        <IconButton

          size="small"

          onClick={onAddFilter}

          aria-label="Add filter"

          sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}

        >

          <AddOutlinedIcon fontSize="small" />

        </IconButton>

      </Stack>



      {filters.length === 0 ? (

        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>

          No filters applied.

        </Typography>

      ) : (

        <Stack spacing={1}>

          {filters.map((filterRow) => {

            const filterMeta = filterMetaMap.get(filterRow.fieldCode);

            const fieldMeta = fieldMap.get(filterRow.fieldCode);

            const operators = filterMeta?.supported_operators || [];



            return (

              <Stack

                key={filterRow.id}

                direction={{ xs: "column", md: "row" }}

                spacing={1}

                alignItems={{ xs: "stretch", md: "center" }}

                sx={{ minWidth: 0, maxWidth: "100%", width: "100%" }}

              >

                <FormControl size="small" sx={{ flex: "1 1 160px", minWidth: 0 }}>

                  <InputLabel id={`filter-field-${filterRow.id}`}>Field</InputLabel>

                  <Select

                    labelId={`filter-field-${filterRow.id}`}

                    label="Field"

                    value={filterRow.fieldCode || ""}

                    onChange={(event) => handleFieldChange(filterRow, event.target.value)}

                    aria-label="Filter field"

                  >

                    {filterOptions.map((filter) => (

                      <MenuItem key={filter.code} value={filter.field_code}>

                        {filter.label}

                      </MenuItem>

                    ))}

                  </Select>

                </FormControl>



                <FormControl size="small" sx={{ flex: "1 1 140px", minWidth: 0 }}>

                  <InputLabel id={`filter-operator-${filterRow.id}`}>Operator</InputLabel>

                  <Select

                    labelId={`filter-operator-${filterRow.id}`}

                    label="Operator"

                    value={filterRow.operator || ""}

                    onChange={(event) => handleOperatorChange(filterRow, event.target.value)}

                    disabled={!filterRow.fieldCode}

                    aria-label="Filter operator"

                  >

                    {operators.map((operator) => (

                      <MenuItem key={operator} value={operator}>

                        {operatorLabel(operator)}

                      </MenuItem>

                    ))}

                  </Select>

                </FormControl>



                <Box sx={{ flex: "2 1 200px", minWidth: 0, maxWidth: "100%" }}>

                  <ReportFilterValueInput

                    filterRow={filterRow}

                    fieldMeta={fieldMeta}

                    lookups={lookups}

                    onChange={(updates) => onUpdateFilter(filterRow.id, updates)}

                  />

                </Box>



                <IconButton

                  size="small"

                  onClick={() => onRemoveFilter(filterRow.id)}

                  aria-label="Remove filter"

                >

                  <DeleteOutlineOutlinedIcon fontSize="small" />

                </IconButton>

              </Stack>

            );

          })}

        </Stack>

      )}

    </Box>

  );

}



export default ReportFilterBuilder;

