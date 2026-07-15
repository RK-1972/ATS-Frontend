import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";

import {
  MdAdd,
  MdCloudUpload,
  MdFileDownload,
  MdFileUpload,
  MdFilterList,
  MdSearch
} from "react-icons/md";

function SkillsMasterDataToolbar({
  searchQuery,
  statusFilter,
  skillCategoryFilter,
  skillCategoryOptions,
  onSearchChange,
  onStatusFilterChange,
  onSkillCategoryFilterChange,
  onExport,
  onImport,
  onNew,
  onBulkUpload
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: 1,
        alignItems: { lg: "center" },
        justifyContent: "space-between",
        mb: 1.5
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ flex: 1, minWidth: 0 }}
      >
        <TextField
          size="small"
          placeholder="Search code, name, description, skill category…"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch size={18} />
              </InputAdornment>
            )
          }}
          sx={{ minWidth: { sm: 280 }, flex: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Skill Category</InputLabel>
          <Select
            label="Skill Category"
            value={skillCategoryFilter}
            onChange={(event) => onSkillCategoryFilterChange(event.target.value)}
          >
            <MenuItem value="all">All categories</MenuItem>
            {skillCategoryOptions.map((option) => (
              <MenuItem key={option.code} value={option.code}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            label="Filter"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            startAdornment={
              <MdFilterList
                size={18}
                style={{ marginLeft: 8, marginRight: -4, opacity: 0.6 }}
              />
            }
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Published">Published</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Stack
        direction="row"
        spacing={0.75}
        flexWrap="wrap"
        useFlexGap
        sx={{ flexShrink: 0 }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<MdFileDownload size={18} />}
          onClick={() => onExport("CSV")}
          sx={{ fontWeight: 600 }}
        >
          Export
        </Button>

        <Button
          size="small"
          variant="outlined"
          startIcon={<MdFileUpload size={18} />}
          onClick={onImport}
          sx={{ fontWeight: 600 }}
        >
          Import
        </Button>

        <Button
          size="small"
          variant="outlined"
          startIcon={<MdCloudUpload size={18} />}
          onClick={onBulkUpload}
          sx={{ fontWeight: 600 }}
        >
          Bulk Upload
        </Button>

        <Button
          size="small"
          variant="contained"
          startIcon={<MdAdd size={18} />}
          onClick={onNew}
          sx={{ fontWeight: 600 }}
        >
          New
        </Button>
      </Stack>
    </Box>
  );
}

export default SkillsMasterDataToolbar;
