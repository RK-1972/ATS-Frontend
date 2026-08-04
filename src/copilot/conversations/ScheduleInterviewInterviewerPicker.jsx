import { useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

import API from "@/api/axios";

/**
 * Interviewer Autocomplete — same data source as InterviewSchedulePage
 * (GET /active-interviewers). Copilot UI shell only.
 */
function ScheduleInterviewInterviewerPicker({
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
        const response = await API.get("/active-interviewers");
        if (!cancelled) {
          setOptions(response?.data?.data || []);
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
      options.map((row) => ({
        id: row.panel_id,
        name: row.interviewer_name,
        label: row.interviewer_name || "—"
      })),
    [options]
  );

  useEffect(() => {
    if (!initialValue?.id || autocompleteOptions.length === 0) {
      return;
    }

    const match = autocompleteOptions.find(
      (option) => String(option.id) === String(initialValue.id)
    );
    if (!match) {
      return;
    }

    setValue((prev) =>
      prev && String(prev.id) === String(match.id) ? prev : match
    );
  }, [initialValue, autocompleteOptions]);

  return (
    <Autocomplete
      size="small"
      disabled={disabled}
      loading={loading}
      options={autocompleteOptions}
      value={value}
      getOptionLabel={(option) => option.label || ""}
      isOptionEqualToValue={(option, selected) =>
        String(option.id) === String(selected.id)
      }
      onChange={(_event, selected) => {
        setValue(selected);
        if (selected) {
          onSelect?.({
            id: selected.id,
            name: selected.name
          });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Interviewer"
          placeholder="Search interviewer…"
          variant="outlined"
        />
      )}
    />
  );
}

export default ScheduleInterviewInterviewerPicker;
