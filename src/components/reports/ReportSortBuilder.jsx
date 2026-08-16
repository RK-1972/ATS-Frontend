import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

function ReportSortBuilder({
  sortRules,
  sortableFields,
  onAddSort,
  onUpdateSort,
  onRemoveSort
}) {
  return (
    <Box sx={{ minWidth: 0, maxWidth: "100%", width: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: "uppercase"
          }}
        >
          Sort
        </Typography>
        <IconButton
          size="small"
          onClick={onAddSort}
          aria-label="Add sort rule"
          sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
        >
          <AddOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      {sortRules.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
          Default dataset ordering will be used.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {sortRules.map((sortRule) => (
            <Stack
              key={sortRule.id}
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ minWidth: 0, maxWidth: "100%", width: "100%" }}
            >
              <FormControl size="small" sx={{ flex: "1 1 200px", minWidth: 0 }}>
                <InputLabel id={`sort-field-${sortRule.id}`}>Field</InputLabel>
                <Select
                  labelId={`sort-field-${sortRule.id}`}
                  label="Field"
                  value={sortRule.fieldCode || ""}
                  onChange={(event) =>
                    onUpdateSort(sortRule.id, { fieldCode: event.target.value })
                  }
                  aria-label="Sort field"
                >
                  {sortableFields.map((field) => (
                    <MenuItem key={field.code} value={field.code}>
                      {field.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ flex: "0 1 140px", minWidth: 0 }}>
                <InputLabel id={`sort-direction-${sortRule.id}`}>Direction</InputLabel>
                <Select
                  labelId={`sort-direction-${sortRule.id}`}
                  label="Direction"
                  value={sortRule.direction}
                  onChange={(event) =>
                    onUpdateSort(sortRule.id, { direction: event.target.value })
                  }
                  aria-label="Sort direction"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>

              <IconButton
                size="small"
                onClick={() => onRemoveSort(sortRule.id)}
                aria-label="Remove sort rule"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default ReportSortBuilder;
