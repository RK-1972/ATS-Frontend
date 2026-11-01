import { MenuItem, Stack, TextField } from "@mui/material";

import { INTERNAL_SOURCE_BUCKETS } from "./otiDiscoveryFilters";

const defaultFilters = {
  minMatchPct: "",
  maxMatchPct: "",
  skillQuery: "",
  sourceBucket: "all",
  actionStatus: "all",
  minExperience: "",
  maxExperience: "",
  providerKey: "all",
  importStatus: "all",
  retrievalStatus: "all"
};

function OtiResultsFilterBar({ mode = "internal", filters, onChange, providerOptions = [] }) {
  const setField = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  if (mode === "external") {
    return (
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          label="Min match %"
          type="number"
          value={filters.minMatchPct ?? defaultFilters.minMatchPct}
          onChange={(event) => setField("minMatchPct", event.target.value)}
          sx={{ minWidth: 120 }}
        />
        <TextField
          select
          size="small"
          label="Provider"
          value={filters.providerKey ?? "all"}
          onChange={(event) => setField("providerKey", event.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All providers</MenuItem>
          {providerOptions.map((provider) => (
            <MenuItem key={provider} value={provider}>
              {provider}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Import status"
          value={filters.importStatus ?? "all"}
          onChange={(event) => setField("importStatus", event.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="staged">Staged</MenuItem>
          <MenuItem value="import_requested">Import requested</MenuItem>
          <MenuItem value="imported">Imported</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Resume retrieval"
          value={filters.retrievalStatus ?? "all"}
          onChange={(event) => setField("retrievalStatus", event.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="not_requested">Not requested</MenuItem>
          <MenuItem value="in_progress">In progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </TextField>
      </Stack>
    );
  }

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.5 }}>
      <TextField
        size="small"
        label="Min match %"
        type="number"
        value={filters.minMatchPct ?? defaultFilters.minMatchPct}
        onChange={(event) => setField("minMatchPct", event.target.value)}
        sx={{ minWidth: 120 }}
      />
      <TextField
        size="small"
        label="Skill contains"
        value={filters.skillQuery ?? defaultFilters.skillQuery}
        onChange={(event) => setField("skillQuery", event.target.value)}
        sx={{ minWidth: 160 }}
      />
      <TextField
        select
        size="small"
        label="Source type"
        value={filters.sourceBucket ?? "all"}
        onChange={(event) => setField("sourceBucket", event.target.value)}
        sx={{ minWidth: 170 }}
      >
        <MenuItem value="all">All internal</MenuItem>
        <MenuItem value={INTERNAL_SOURCE_BUCKETS.TALENT_POOL}>Talent pool</MenuItem>
        <MenuItem value={INTERNAL_SOURCE_BUCKETS.HISTORICAL}>Historical</MenuItem>
        <MenuItem value={INTERNAL_SOURCE_BUCKETS.RESUME_INDEX}>Resume index</MenuItem>
        <MenuItem value={INTERNAL_SOURCE_BUCKETS.MIXED}>Mixed signals</MenuItem>
      </TextField>
      <TextField
        size="small"
        label="Min exp (yrs)"
        type="number"
        value={filters.minExperience ?? defaultFilters.minExperience}
        onChange={(event) => setField("minExperience", event.target.value)}
        sx={{ minWidth: 120 }}
      />
      <TextField
        select
        size="small"
        label="Recruiter action"
        value={filters.actionStatus ?? "all"}
        onChange={(event) => setField("actionStatus", event.target.value)}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="all">Any</MenuItem>
        <MenuItem value="none">No action</MenuItem>
        <MenuItem value="shortlist">Shortlisted</MenuItem>
        <MenuItem value="dismiss">Dismissed</MenuItem>
        <MenuItem value="request_map">Map requested</MenuItem>
      </TextField>
    </Stack>
  );
}

export { defaultFilters };
export default OtiResultsFilterBar;
