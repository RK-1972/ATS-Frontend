import { useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

import candidateRepository from "@/repositories/candidateRepository";
import { getCandidateDisplayName } from "@/enterprise/candidateWorkspaceUtils";

/**
 * Candidate Autocomplete for Copilot Schedule Interview orchestration.
 *
 * Uses the same candidateRepository.listCandidates service / visibility
 * rules as Candidate Workspace (Talent Pool / My Pool). Not a new search
 * implementation — a Copilot UI shell over the existing ATS list service.
 *
 * Note: ATS does not currently export a standalone shared Candidate Search
 * component; extracting one would require modifying existing pages (forbidden).
 */
function ScheduleInterviewCandidatePicker({
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
        let workspaceView = "pool";
        try {
          const user = JSON.parse(localStorage.getItem("user") || "null");
          workspaceView = user?.role_name === "Recruiter" ? "pipeline" : "pool";
        } catch (_error) {
          workspaceView = "pool";
        }

        const rows = await candidateRepository.listCandidates(workspaceView);
        if (!cancelled) {
          setOptions(Array.isArray(rows) ? rows : []);
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
        id: row.candidate_id,
        candidateCode: row.candidate_code || "",
        candidateName: getCandidateDisplayName(row),
        label: `${row.candidate_code || "—"} - ${getCandidateDisplayName(row)}`,
        mapId: row.map_id ?? null,
        reqId: row.req_id ?? null
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
            candidateCode: selected.candidateCode,
            candidateName: selected.candidateName,
            mapId: selected.mapId,
            reqId: selected.reqId
          });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Candidate"
          placeholder="Search candidate…"
          variant="outlined"
        />
      )}
    />
  );
}

export default ScheduleInterviewCandidatePicker;
