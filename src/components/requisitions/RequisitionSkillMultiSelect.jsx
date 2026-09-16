import { Autocomplete, TextField } from "@mui/material";

import {
  buildRequisitionSkillOptions,
  joinRequisitionSkillCodes,
  parseRequisitionSkillCodes
} from "@/utils/requisitionSkillUtils";

function RequisitionSkillMultiSelect({
  label,
  value = "",
  onChange,
  masterData,
  required = false,
  disabled = false,
  placeholder = "Select skills"
}) {
  const options = buildRequisitionSkillOptions(masterData);
  const selectedCodes = parseRequisitionSkillCodes(value);
  const selectedOptions = selectedCodes
    .map((code) => options.find((option) => option.code === code))
    .filter(Boolean);

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      value={selectedOptions}
      disabled={disabled}
      getOptionLabel={(option) => option.label || option.name || option.code}
      isOptionEqualToValue={(option, selected) => option.code === selected.code}
      onChange={(_event, nextOptions) => {
        onChange?.(
          joinRequisitionSkillCodes(nextOptions.map((option) => option.code))
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          size="small"
        />
      )}
    />
  );
}

export default RequisitionSkillMultiSelect;
