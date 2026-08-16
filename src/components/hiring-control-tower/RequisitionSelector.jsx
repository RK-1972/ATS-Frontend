import { useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  TextField,
  Alert,
  Box
} from "@mui/material";

function requisitionOptionLabel(option) {
  if (!option?.requisition_code) {
    return "";
  }

  const title = option.position_title || "Untitled";
  const status = option.req_status || "Unknown";

  return `${option.requisition_code} — ${title} (${status})`;
}

function RequisitionSelector({
  options,
  selected,
  loading,
  searchError,
  disabled,
  disabledMessage,
  hideFieldLabel = false,
  onSearch,
  onSelect
}) {

  const debounceRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const handleInputChange = (_event, value, reason) => {
    setInputValue(value);

    if (reason !== "input" || disabled) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  const helperText = useMemo(() => {
    if (disabled) {
      return disabledMessage || "Live API required for requisition lookup.";
    }

    if (searchError) {
      return searchError;
    }

    return "Search by requisition code, position title, or department.";
  }, [disabled, disabledMessage, searchError]);

  return (
    <Box mb={1.5}>
      {disabled ? (
        <Alert severity="info" sx={{ mb: 1.5 }}>
          {disabledMessage || "Live API required for requisition lookup."}
        </Alert>
      ) : null}

      <Autocomplete
        options={options}
        value={selected}
        inputValue={inputValue}
        loading={loading}
        disabled={disabled}
        onInputChange={handleInputChange}
        onChange={(_event, value) => {
          setInputValue(value ? requisitionOptionLabel(value) : "");
          onSelect(value);
        }}
        onOpen={() => {
          if (!disabled && !loading) {
            onSearch(inputValue);
          }
        }}
        getOptionLabel={(option) => requisitionOptionLabel(option)}
        isOptionEqualToValue={(option, value) =>
          option?.requisition_code === value?.requisition_code
        }
        filterOptions={(items) => items}
        noOptionsText={loading ? "Searching…" : "No requisitions found"}
        renderInput={(params) => (
          <TextField
            {...params}
            label={hideFieldLabel ? undefined : "Requisition"}
            placeholder="Search requisitions…"
            fullWidth
            size="small"
            error={Boolean(searchError)}
            helperText={helperText}
          />
        )}
      />
    </Box>
  );

}

export default RequisitionSelector;
