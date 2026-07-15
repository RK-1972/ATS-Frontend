import { Autocomplete, TextField } from "@mui/material";

function SkillCategorySelect({
  label = "Skill Category",
  value,
  options,
  onChange,
  required = false,
  disabled = false
}) {
  const selectedOption = options.find(
    (option) => option.code === value
  ) || null;

  return (
    <Autocomplete
      size="small"
      options={options}
      value={selectedOption}
      onChange={(_, option) => onChange(option?.code || "")}
      getOptionLabel={(option) => option.label || option.name || option.code}
      isOptionEqualToValue={(option, selected) => option.code === selected.code}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={required ? `${label} *` : label}
          placeholder="Search skill category…"
        />
      )}
    />
  );
}

export default SkillCategorySelect;
