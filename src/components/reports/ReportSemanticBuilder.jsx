import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

function ReportResultModeToggle({ value, onChange }) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_event, nextValue) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
      sx={{ mb: 1.5 }}
    >
      <ToggleButton value="detail" sx={{ textTransform: "none", fontWeight: 600 }}>
        Detail
      </ToggleButton>
      <ToggleButton value="aggregate" sx={{ textTransform: "none", fontWeight: 600 }}>
        Aggregate
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

function ReportSemanticBuilder({
  resultMode,
  onResultModeChange,
  dimensions,
  measures,
  dimensionFields,
  measureFields,
  dateGrains,
  onAddDimension,
  onUpdateDimension,
  onRemoveDimension,
  onAddMeasure,
  onUpdateMeasure,
  onRemoveMeasure
}) {
  return (
    <Stack spacing={2}>
      <ReportResultModeToggle value={resultMode} onChange={onResultModeChange} />

      {resultMode === "aggregate" ? (
        <>
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.6 }}>
                DIMENSIONS
              </Typography>
              <IconButton size="small" onClick={onAddDimension} aria-label="Add dimension">
                <AddOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={1}>
              {dimensions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                  Optional. Add dimensions to group aggregate results.
                </Typography>
              ) : null}

              {dimensions.map((dimension) => {
                const fieldMeta = dimensionFields.find((field) => field.code === dimension.fieldCode);

                return (
                  <Stack key={dimension.id} direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Dimension</InputLabel>
                      <Select
                        label="Dimension"
                        value={dimension.fieldCode}
                        onChange={(event) =>
                          onUpdateDimension(dimension.id, {
                            fieldCode: event.target.value,
                            grain: ""
                          })
                        }
                      >
                        {dimensionFields.map((field) => (
                          <MenuItem key={field.code} value={field.code}>
                            {field.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {fieldMeta?.supports_date_grain ? (
                      <FormControl size="small" fullWidth>
                        <InputLabel>Date Grain</InputLabel>
                        <Select
                          label="Date Grain"
                          value={dimension.grain || ""}
                          onChange={(event) =>
                            onUpdateDimension(dimension.id, { grain: event.target.value })
                          }
                        >
                          <MenuItem value="">None</MenuItem>
                          {dateGrains.map((grain) => (
                            <MenuItem key={grain} value={grain}>
                              {grain}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : null}

                    <IconButton
                      size="small"
                      onClick={() => onRemoveDimension(dimension.id)}
                      aria-label="Remove dimension"
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                );
              })}
            </Stack>
          </Box>

          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.6 }}>
                MEASURES
              </Typography>
              <IconButton size="small" onClick={onAddMeasure} aria-label="Add measure">
                <AddOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={1}>
              {measures.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                  Add at least one measure to generate an aggregate report.
                </Typography>
              ) : null}

              {measures.map((measure) => {
                const fieldMeta = measureFields.find((field) => field.code === measure.fieldCode);
                const aggregations = fieldMeta?.supported_aggregations || [];

                return (
                  <Stack key={measure.id} direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Measure Field</InputLabel>
                      <Select
                        label="Measure Field"
                        value={measure.fieldCode}
                        onChange={(event) =>
                          onUpdateMeasure(measure.id, {
                            fieldCode: event.target.value,
                            aggregation: ""
                          })
                        }
                      >
                        {measureFields.map((field) => (
                          <MenuItem key={field.code} value={field.code}>
                            {field.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <InputLabel>Aggregation</InputLabel>
                      <Select
                        label="Aggregation"
                        value={measure.aggregation}
                        onChange={(event) =>
                          onUpdateMeasure(measure.id, { aggregation: event.target.value })
                        }
                      >
                        {aggregations.map((aggregation) => (
                          <MenuItem key={aggregation} value={aggregation}>
                            {aggregation}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      size="small"
                      fullWidth
                      label="Alias (optional)"
                      value={measure.alias}
                      onChange={(event) =>
                        onUpdateMeasure(measure.id, { alias: event.target.value })
                      }
                    />

                    <IconButton
                      size="small"
                      onClick={() => onRemoveMeasure(measure.id)}
                      aria-label="Remove measure"
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </>
      ) : null}
    </Stack>
  );
}

export default ReportSemanticBuilder;
