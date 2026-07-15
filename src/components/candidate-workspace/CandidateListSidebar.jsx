import {
  Box,
  Button,
  Chip,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  LinearProgress,
  Avatar,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";

import { SearchBar, LoadingState, EmptyState } from "@/components/enterprise";
import {
  calculateProfileCompletion,
  getCandidateDisplayName
} from "@/enterprise/candidateWorkspaceUtils";

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "mapped", label: "Mapped" },
  { key: "active", label: "Active" },
  { key: "screen", label: "To be screened" }
];

function CandidateListContent({

  candidates = [],
  selectedId,


  workspaceView,
  onWorkspaceViewChange,


  searchQuery,
  onSearchChange,

    statusFilter,
  onStatusFilterChange,

  onSelect,
  onNewCandidate,

  isLoading = false

}) {
  const theme = useTheme();
  const { typography } = theme.tokens;

  return (
    <>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography sx={{ ...typography.sectionTitle, fontSize: 15, mb: 1.5 }}>
          Candidates
        </Typography>

        <ToggleButtonGroup
        value={workspaceView}
        exclusive
        fullWidth
        size="small"
        onChange={(event, value) => {
          if (value) {
            onWorkspaceViewChange(value);
          }
        }}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="pool">
          Talent Pool
        </ToggleButton>

        <ToggleButton value="pipeline">
          My Pipeline
        </ToggleButton>
      </ToggleButtonGroup>

        <Button
          variant="contained"
          fullWidth
          startIcon={<AddOutlinedIcon />}
          onClick={onNewCandidate}
          sx={{ mb: 1.5 }}
        >
          New Candidate
        </Button>

        <SearchBar
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name, code, email"
          size="small"
          width="100%"
        />

        <Stack direction="row" alignItems="center" spacing={0.5} mt={1.5} flexWrap="wrap" useFlexGap>
          <FilterListOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          {FILTER_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              size="small"
              variant={statusFilter === option.key ? "filled" : "outlined"}
              color={statusFilter === option.key ? "primary" : "default"}
              onClick={() => onStatusFilterChange(option.key)}
              sx={{ height: 26 }}
            />
          ))}
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {isLoading ? (
          <LoadingState message="Loading candidates..." />
        ) : candidates.length === 0 ? (
          <EmptyState
            title="No candidates found"
            description="Try adjusting search or filters, or register a new candidate."
            actionLabel="New Candidate"
            onAction={onNewCandidate}
          />
        ) : (
          <List disablePadding dense>
            {candidates.map((row) => {
              const completion = calculateProfileCompletion(row);
              const isSelected = String(row.candidate_id) === String(selectedId);

              return (
                <ListItemButton
                  key={row.candidate_id}
                  selected={isSelected}
                  onClick={() => onSelect(row.candidate_id)}
                  sx={{
                    py: 1,
                    px: 2,
                    alignItems: "flex-start",
                    borderBottom: 1,
                    borderColor: "divider"
                  }}
                >
                  <Stack direction="row" spacing={1.25} width="100%">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        fontSize: 13
                      }}
                    >
                      {(row.first_name?.[0] || "?").toUpperCase()}
                    </Avatar>

                    <Box minWidth={0} flex={1}>
                      <ListItemText
                        primary={getCandidateDisplayName(row)}
                        secondary={row.candidate_code || `ID ${row.candidate_id}`}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: typography.secondary.fontSize,
                          noWrap: true
                        }}
                        secondaryTypographyProps={{
                          fontSize: typography.caption.fontSize
                        }}
                      />

                      <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                        <LinearProgress
                          variant="determinate"
                          value={completion}
                          sx={{ flex: 1, height: 3, borderRadius: 2 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 26 }}>
                          {completion}%
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </>
  );
}
function CandidateListSidebar({
  candidates = [],
  selectedId,

  workspaceView,
  onWorkspaceViewChange,

  searchQuery,
  onSearchChange,

  statusFilter,
  onStatusFilterChange,

  onSelect,
  onNewCandidate,

  isLoading = false,
  mobileOpen = false,
  onMobileClose
}) {
  const theme = useTheme();
  const { layout } = theme.tokens;

  const sidebarShell = {
    width: layout.sidebarWidth || 300,
    maxWidth: layout.sidebarWidth || 300,
    borderRight: 1,
    borderColor: "divider",
    bgcolor: "background.paper",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    flexShrink: 0
  };

  const contentProps = {
  candidates,
  selectedId,

  workspaceView,
  onWorkspaceViewChange,

  searchQuery,
  onSearchChange,

  statusFilter,
  onStatusFilterChange,

  onSelect: (id) => {
    onSelect(id);
    onMobileClose?.();
  },

  onNewCandidate,
  isLoading
};

  return (
    <>
      <Box sx={{ ...sidebarShell, display: { xs: "none", md: "flex" } }}>
        <CandidateListContent {...contentProps} />
      </Box>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{ display: { md: "none" } }}
        PaperProps={{
          sx: { width: Math.min(320, layout.sidebarWidth || 300) }
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <CandidateListContent {...contentProps} />
        </Box>
      </Drawer>
    </>
  );
}

export default CandidateListSidebar;
