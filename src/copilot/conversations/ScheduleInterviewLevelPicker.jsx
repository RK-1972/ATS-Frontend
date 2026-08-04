import { useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

import masterDataClient from "@/api/clients/masterDataClient";
import { getPublishedRecords } from "@/enterprise/masterDataHelpers";

/**
 * Interview level Autocomplete — same source as InterviewSchedulePage
 * (EMD interview_types via masterDataClient.getAll()).
 */
function ScheduleInterviewLevelPicker({
  onSelect,
  disabled = false,
  initialValue = null
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const bundle = await masterDataClient.getAll();
        const levels = getPublishedRecords(bundle, "interview_types").map(
          (record) => record.name
        );
        if (!cancelled) {
          setOptions(levels);
        }
      } catch (_error) {
        if (!cancelled) {
          setOptions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const autocompleteOptions = useMemo(
    () =>
      options.map((name) => ({
        id: name,
        label: name,
        value: name
      })),
    [options]
  );

  useEffect(() => {
    if (
      initialValue == null ||
      String(initialValue).trim() === "" ||
      autocompleteOptions.length === 0
    ) {
      return;
    }

    const match = autocompleteOptions.find(
      (option) => option.value === initialValue
    );
    if (!match) {
      return;
    }

    setValue((prev) => (prev && prev.value === match.value ? prev : match));
  }, [initialValue, autocompleteOptions]);

  return (
    <Autocomplete
      size="small"
      disabled={disabled}
      loading={loading}
      options={autocompleteOptions}
      value={value}
      getOptionLabel={(option) => option.label || ""}
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      onChange={(_event, selected) => {
        setValue(selected);
        if (selected) {
          onSelect?.(selected.value);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Interview Level"
          placeholder="Select level…"
          variant="outlined"
        />
      )}
    />
  );
}

export default ScheduleInterviewLevelPicker;
