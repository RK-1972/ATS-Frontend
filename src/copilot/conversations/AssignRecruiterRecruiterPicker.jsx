import { useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

import recruitmentRepository from "@/repositories/recruitmentRepository";

/**
 * Recruiter Autocomplete for Copilot Assign Recruiter.
 * Same list source as RecruiterAssignmentPanel
 * (recruitmentRepository.listFormRecruiters → GET …/form-options/recruiters).
 */
function AssignRecruiterRecruiterPicker({
  onSelect,
  disabled = false,
  initialValue = null
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const rows = await recruitmentRepository.listFormRecruiters();
        if (!cancelled) {
          setOptions(Array.isArray(rows) ? rows : []);
        }
      } catch (error) {
        if (!cancelled) {
          setOptions([]);
          setLoadError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load recruiters."
          );
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
        employeeCode: row.employee_code,
        fullName: row.full_name || "",
        label: row.full_name
          ? `${row.full_name} (${row.employee_code})`
          : String(row.employee_code || "—")
      })),
    [options]
  );

  useEffect(() => {
    if (!initialValue?.employeeCode || autocompleteOptions.length === 0) {
      return;
    }

    const match = autocompleteOptions.find(
      (option) =>
        String(option.employeeCode) === String(initialValue.employeeCode)
    );
    if (!match) {
      return;
    }

    setValue((prev) =>
      prev && String(prev.employeeCode) === String(match.employeeCode)
        ? prev
        : match
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
        String(option.employeeCode) === String(selected.employeeCode)
      }
      onChange={(_event, selected) => {
        setValue(selected);
        if (selected) {
          onSelect?.({
            employeeCode: selected.employeeCode,
            fullName: selected.fullName,
            label: selected.label
          });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Recruiter"
          placeholder="Search recruiter…"
          variant="outlined"
          error={Boolean(loadError)}
          helperText={loadError || undefined}
        />
      )}
    />
  );
}

export default AssignRecruiterRecruiterPicker;
