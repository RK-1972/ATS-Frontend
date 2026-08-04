import { useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

import candidateRepository from "@/repositories/candidateRepository";

/**
 * Requisition Autocomplete for Copilot Map Candidate.
 * Same list source as CandidateAssignmentDialog
 * (candidateRepository.getMyRequisitions → GET /my-requisitions).
 */
function MapCandidateRequisitionPicker({
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
        const rows = await candidateRepository.getMyRequisitions();
        if (!cancelled) {
          setOptions(Array.isArray(rows) ? rows : []);
        }
      } catch (error) {
        if (!cancelled) {
          setOptions([]);
          setLoadError(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load requisitions."
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
      options.map((row) => {
        const reqCode = row.req_code || row.requisition_code || "";
        const jobTitle = row.job_title || row.position_title || "";
        return {
          id: row.req_id,
          reqCode,
          jobTitle,
          label: [reqCode, jobTitle].filter(Boolean).join(" — ") || "—"
        };
      }),
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
            reqCode: selected.reqCode,
            jobTitle: selected.jobTitle,
            label: selected.label
          });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Requisition"
          placeholder="Search requisition…"
          variant="outlined"
          error={Boolean(loadError)}
          helperText={loadError || undefined}
        />
      )}
    />
  );
}

export default MapCandidateRequisitionPicker;
