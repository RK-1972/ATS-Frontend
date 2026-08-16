import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material";

import {
  FILTER_VALUE_SOURCE,
  isMultiValueOperator,
  resolveFilterValueSource
} from "./reportFilterValueSources";

function normalizeStoredValues(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (value === null || value === undefined || value === "") {
    return [];
  }

  return [String(value)];
}

function LookupAutocomplete({
  filterRow,
  options,
  loading,
  errorMessage,
  multiple,
  placeholder,
  onChange
}) {
  const storedValues = normalizeStoredValues(filterRow.value);
  const selectedOptions = multiple
    ? options.filter((option) => storedValues.includes(String(option.value)))
    : options.find((option) => String(option.value) === String(filterRow.value)) || null;

  return (
    <Autocomplete
      size="small"
      fullWidth
      multiple={multiple}
      disableCloseOnSelect={multiple}
      loading={loading}
      options={options}
      value={selectedOptions}
      getOptionLabel={(option) => option.label || String(option.value || "")}
      isOptionEqualToValue={(option, selected) =>
        String(option.value) === String(selected.value)
      }
      onChange={(_event, selected) => {
        if (multiple) {
          onChange({
            value: (selected || []).map((option) => option.value)
          });
          return;
        }

        onChange({ value: selected?.value ?? "" });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={multiple ? "Values" : "Value"}
          placeholder={placeholder}
          error={Boolean(errorMessage)}
          helperText={errorMessage || undefined}
        />
      )}
    />
  );
}

function EnumValueControl({ filterRow, fieldMeta, enumOptions, onChange }) {
  const options = enumOptions.fromValues(fieldMeta?.enum_values);
  const operator = filterRow.operator;

  if (isMultiValueOperator(operator)) {
    return (
      <LookupAutocomplete
        filterRow={filterRow}
        options={options}
        loading={false}
        errorMessage=""
        multiple
        placeholder="Select values…"
        onChange={onChange}
      />
    );
  }

  return (
    <FormControl size="small" fullWidth>
      <InputLabel id={`filter-value-${filterRow.id}`}>Value</InputLabel>
      <Select
        labelId={`filter-value-${filterRow.id}`}
        label="Value"
        value={filterRow.value || ""}
        onChange={(event) => onChange({ value: event.target.value })}
        aria-label="Filter value"
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function ReportFilterValueInput({ filterRow, fieldMeta, lookups, onChange }) {
  const operator = filterRow.operator;
  const dataType = fieldMeta?.data_type;
  const valueSource = resolveFilterValueSource(filterRow.fieldCode || fieldMeta?.code, fieldMeta, operator);

  if (valueSource === FILTER_VALUE_SOURCE.DISABLED) {
    return (
      <TextField
        size="small"
        fullWidth
        disabled
        placeholder="Select operator"
        aria-label="Filter value"
      />
    );
  }

  if (valueSource === FILTER_VALUE_SOURCE.NATIVE_DATE && operator === "between") {
    return (
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        <TextField
          size="small"
          fullWidth
          type="date"
          label="From"
          value={filterRow.value}
          onChange={(event) => onChange({ value: event.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          aria-label="Filter range start"
        />
        <TextField
          size="small"
          fullWidth
          type="date"
          label="To"
          value={filterRow.valueEnd}
          onChange={(event) => onChange({ valueEnd: event.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          aria-label="Filter range end"
        />
      </Stack>
    );
  }

  if (valueSource === FILTER_VALUE_SOURCE.NATIVE_DATE) {
    return (
      <TextField
        size="small"
        fullWidth
        type="date"
        label="Value"
        value={filterRow.value}
        onChange={(event) => onChange({ value: event.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        aria-label="Filter value"
      />
    );
  }

  if (valueSource === FILTER_VALUE_SOURCE.NATIVE_NUMBER && operator === "between") {
    return (
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        <TextField
          size="small"
          fullWidth
          type="number"
          label="From"
          value={filterRow.value}
          onChange={(event) => onChange({ value: event.target.value })}
          aria-label="Filter range start"
        />
        <TextField
          size="small"
          fullWidth
          type="number"
          label="To"
          value={filterRow.valueEnd}
          onChange={(event) => onChange({ valueEnd: event.target.value })}
          aria-label="Filter range end"
        />
      </Stack>
    );
  }

  if (valueSource === FILTER_VALUE_SOURCE.NATIVE_NUMBER) {
    return (
      <TextField
        size="small"
        fullWidth
        type="number"
        label="Value"
        value={filterRow.value}
        onChange={(event) => onChange({ value: event.target.value })}
        aria-label="Filter value"
      />
    );
  }

  if (valueSource === FILTER_VALUE_SOURCE.METADATA_ENUM) {
    return (
      <EnumValueControl
        filterRow={filterRow}
        fieldMeta={fieldMeta}
        enumOptions={lookups.enumOptions}
        onChange={onChange}
      />
    );
  }

  const masterBackedSources = new Set([
    FILTER_VALUE_SOURCE.MASTER_DEPARTMENTS,
    FILTER_VALUE_SOURCE.MASTER_GRADES,
    FILTER_VALUE_SOURCE.MASTER_DESIGNATIONS,
    FILTER_VALUE_SOURCE.MASTER_WORK_LOCATIONS,
    FILTER_VALUE_SOURCE.MASTER_BUSINESS_UNITS,
    FILTER_VALUE_SOURCE.MASTER_EMPLOYMENT_TYPES,
    FILTER_VALUE_SOURCE.API_RECRUITERS,
    FILTER_VALUE_SOURCE.API_HIRING_MANAGERS
  ]);

  if (masterBackedSources.has(valueSource)) {
    const options = lookups.getOptionsForSource(valueSource);
    const sourceError = lookups.getSourceError(valueSource);
    const multiple = isMultiValueOperator(operator);

    return (
      <LookupAutocomplete
        filterRow={filterRow}
        options={options}
        loading={lookups.loading}
        errorMessage={sourceError}
        multiple={multiple}
        placeholder={multiple ? "Select values…" : "Search…"}
        onChange={onChange}
      />
    );
  }

  if (isMultiValueOperator(operator)) {
    return (
      <TextField
        size="small"
        fullWidth
        label="Values"
        placeholder="Comma-separated values"
        value={Array.isArray(filterRow.value) ? filterRow.value.join(", ") : filterRow.value}
        onChange={(event) => onChange({ value: event.target.value })}
        aria-label="Filter values"
      />
    );
  }

  const inputType = dataType === "date" ? "date" : dataType === "number" ? "number" : "text";

  return (
    <TextField
      size="small"
      fullWidth
      type={inputType}
      label="Value"
      value={filterRow.value}
      onChange={(event) => onChange({ value: event.target.value })}
      aria-label="Filter value"
    />
  );
}

export default ReportFilterValueInput;
