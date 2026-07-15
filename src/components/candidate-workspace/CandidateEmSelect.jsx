import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from "@mui/material";

import { getPublishedRecords } from "@/enterprise/masterDataHelpers";

function CandidateEmSelect({
  label,
  entityType,
  masterData,
  value = "",
  readOnly = true,
  onChange,
  fullWidth = true,
  size = "small"
}) {
  const options = getPublishedRecords(masterData, entityType).map((record) => ({
    value: record.code,
    label: record.name
  }));

  if (readOnly) {
    const selected = options.find((option) => option.value === value);

    return (
      <Typography variant="body2" fontWeight={500}>
        {selected?.label || value || "—"}
      </Typography>
    );
  }

  return (
    <FormControl fullWidth={fullWidth} size={size}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value || ""} onChange={onChange}>
        <MenuItem value="">
          <em>Select {label}</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default CandidateEmSelect;
