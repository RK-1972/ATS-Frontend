/**
 * WAVE 2 — DISABLED (Enterprise Recovery Sprint)
 * Preserved for future Wave 2 work. Not imported by the active workspace page.
 */
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip
} from "@mui/material";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import BookmarkOutlinedIcon from "@mui/icons-material/BookmarkOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import {
  CommandBar,
  SearchBar
} from "@/components/enterprise";
import {
  loadSavedViews,
  persistSavedViews
} from "@/enterprise/recruiterSelectors.wave2";

function RecruiterContextToolbar({
  recruiterUi,
  setRecruiterUi,
  requisitionCount,
  pipelineCount,
  statusOptions = [],
  pipelineStages = []
}) {
  const savedViews = loadSavedViews();
  const hasActiveFilters = recruiterUi.statusFilter !== "all"
    || recruiterUi.stageFilter !== "all"
    || recruiterUi.kpiFilter
    || recruiterUi.searchQuery;

  const handleSaveView = () => {
    const name = window.prompt("Name this view:");
    if (!name?.trim()) return;

    const view = {
      id: `view-${Date.now()}`,
      name: name.trim(),
      activeTab: recruiterUi.activeTab,
      statusFilter: recruiterUi.statusFilter,
      stageFilter: recruiterUi.stageFilter,
      searchQuery: recruiterUi.searchQuery
    };

    const nextViews = [...savedViews.filter((item) => item.name !== view.name), view];
    persistSavedViews(nextViews);
    setRecruiterUi({ savedViewId: view.id });
  };

  const handleApplyView = (viewId) => {
    const view = savedViews.find((item) => item.id === viewId);
    if (!view) {
      setRecruiterUi({ savedViewId: null });
      return;
    }

    setRecruiterUi({
      savedViewId: view.id,
      activeTab: view.activeTab || "requisitions",
      statusFilter: view.statusFilter || "all",
      stageFilter: view.stageFilter || "all",
      searchQuery: view.searchQuery || "",
      kpiFilter: null
    });
  };

  const handleClearFilters = () => {
    setRecruiterUi({
      statusFilter: "all",
      stageFilter: "all",
      kpiFilter: null,
      searchQuery: "",
      savedViewId: null
    });
  };

  return (
    <CommandBar
      left={(
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <ToggleButtonGroup
            size="small"
            exclusive
            value={recruiterUi.activeTab}
            onChange={(_, value) => {
              if (value) {
                setRecruiterUi({ activeTab: value, kpiFilter: null });
              }
            }}
          >
            <ToggleButton value="requisitions">
              Requisitions ({requisitionCount})
            </ToggleButton>
            <ToggleButton value="pipeline">
              Pipeline ({pipelineCount})
            </ToggleButton>
          </ToggleButtonGroup>

          {recruiterUi.activeTab === "requisitions" && (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="recruiter-status-filter">Status</InputLabel>
              <Select
                labelId="recruiter-status-filter"
                label="Status"
                value={recruiterUi.statusFilter}
                onChange={(event) => setRecruiterUi({
                  statusFilter: event.target.value,
                  kpiFilter: null
                })}
              >
                <MenuItem value="all">All statuses</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {recruiterUi.activeTab === "pipeline" && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="recruiter-stage-filter">Stage</InputLabel>
              <Select
                labelId="recruiter-stage-filter"
                label="Stage"
                value={recruiterUi.stageFilter}
                onChange={(event) => setRecruiterUi({
                  stageFilter: event.target.value,
                  kpiFilter: null
                })}
              >
                <MenuItem value="all">All stages</MenuItem>
                {pipelineStages.map((stage) => (
                  <MenuItem key={stage} value={stage}>{stage}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {savedViews.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="recruiter-saved-view">Saved view</InputLabel>
              <Select
                labelId="recruiter-saved-view"
                label="Saved view"
                value={recruiterUi.savedViewId || ""}
                onChange={(event) => handleApplyView(event.target.value || null)}
              >
                <MenuItem value="">None</MenuItem>
                {savedViews.map((view) => (
                  <MenuItem key={view.id} value={view.id}>{view.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {hasActiveFilters && (
            <Chip
              size="small"
              label="Filters active"
              onDelete={handleClearFilters}
              deleteIcon={<ClearOutlinedIcon />}
            />
          )}
        </Stack>
      )}
      right={(
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Tooltip title="Save current filters as a view">
            <IconButton size="small" onClick={handleSaveView} aria-label="Save view">
              <BookmarkAddOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {recruiterUi.savedViewId && (
            <BookmarkOutlinedIcon color="primary" sx={{ fontSize: 18 }} />
          )}
          <SearchBar
            value={recruiterUi.searchQuery}
            onChange={(event) => setRecruiterUi({
              searchQuery: event.target.value,
              kpiFilter: null
            })}
            placeholder="Search requisitions or candidates…"
          />
          {hasActiveFilters && (
            <Button size="small" onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </Stack>
      )}
    />
  );
}

export default RecruiterContextToolbar;
