import { useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

import API from "@/api/axios";

const NO_INTERVIEWS_MESSAGE =
  "You have no scheduled interviews available.";

/**
 * Interview Autocomplete for Copilot Conduct Interview.
 * Same data source as InterviewerHome (GET /my-interviews).
 * Autocomplete filters client-side over ATS fields already returned.
 */
function ConductInterviewPicker({
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
        const response = await API.get("/my-interviews");
        const rows = response?.data?.data || [];
        if (!cancelled) {
          setOptions(Array.isArray(rows) ? rows : []);
          if (!Array.isArray(rows) || rows.length === 0) {
            setLoadError(NO_INTERVIEWS_MESSAGE);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setOptions([]);
          setLoadError(
            error?.response?.data?.message ||
              error?.message ||
              NO_INTERVIEWS_MESSAGE
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
        const scheduleId = row.schedule_id;
        const candidateName = row.candidate_name || "";
        const jobTitle = row.job_title || "";
        const roundType = row.round_type || "";
        const dateLabel = row.interview_date
          ? new Date(row.interview_date).toLocaleDateString()
          : "";
        const timeLabel = row.interview_time || "";
        const when = [dateLabel, timeLabel].filter(Boolean).join(" ");

        return {
          id: scheduleId,
          scheduleId,
          candidateName,
          jobTitle,
          roundType,
          interviewDate: dateLabel,
          interviewTime: timeLabel,
          interviewerName: row.interviewer_name || "",
          label: [candidateName, jobTitle, roundType, when]
            .filter(Boolean)
            .join(" — ")
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
            scheduleId: selected.scheduleId,
            candidateName: selected.candidateName,
            jobTitle: selected.jobTitle,
            roundType: selected.roundType,
            interviewDate: selected.interviewDate,
            interviewTime: selected.interviewTime,
            interviewerName: selected.interviewerName,
            label: selected.label
          });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Interview"
          placeholder="Search by candidate, position, round…"
          variant="outlined"
          error={Boolean(loadError)}
          helperText={loadError || undefined}
        />
      )}
    />
  );
}

export default ConductInterviewPicker;
