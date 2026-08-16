import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography
} from "@mui/material";

function ReportDatasetSelector({
  datasets,
  selectedDatasetCode,
  onChange,
  loading,
  description
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          display: "block",
          mb: 1
        }}
      >
        Dataset
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={40} />
      ) : (
        <FormControl fullWidth size="small">
          <InputLabel id="report-dataset-label">Dataset</InputLabel>
          <Select
            labelId="report-dataset-label"
            label="Dataset"
            value={selectedDatasetCode || ""}
            onChange={(event) => onChange(event.target.value)}
            aria-label="Select report dataset"
          >
            {datasets.map((dataset) => (
              <MenuItem key={dataset.code} value={dataset.code}>
                {dataset.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: 13 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}

export default ReportDatasetSelector;
