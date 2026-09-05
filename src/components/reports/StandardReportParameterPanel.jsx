import { Grid, Stack, Typography } from "@mui/material";

import useReportFilterLookups from "../../hooks/useReportFilterLookups";
import ReportFilterValueInput from "./ReportFilterValueInput";
import { formatStandardReportOperatorLabel } from "./standardReportParameterUtils";
import { EnterpriseSurface } from "../enterprise";

function StandardReportParameterPanel({
  definition,
  parameterFilters,
  fieldMap,
  onUpdateParameter
}) {
  const parameterMeta = (definition?.definition?.parameter_filters || []).reduce((map, param) => {
    map.set(param.field_code, param);
    return map;
  }, new Map());

  const lookups = useReportFilterLookups();

  if (!parameterFilters.length) {
    return null;
  }

  return (
    <EnterpriseSurface sx={{ p: 2 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          display: "block",
          mb: 1.5
        }}
      >
        Report Parameters
      </Typography>

      <Grid container spacing={1.5}>
        {parameterFilters.map((filterRow) => {
          const paramMeta = parameterMeta.get(filterRow.fieldCode);
          const fieldMeta = fieldMap.get(filterRow.fieldCode);
          const label = paramMeta?.label || fieldMeta?.label || filterRow.fieldCode;
          const operatorLabel = formatStandardReportOperatorLabel(filterRow.operator);

          return (
            <Grid key={filterRow.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={1}>
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={600}>
                    {label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {operatorLabel}
                  </Typography>
                </Stack>

                <ReportFilterValueInput
                  filterRow={filterRow}
                  fieldMeta={fieldMeta}
                  lookups={lookups}
                  onChange={(updates) => onUpdateParameter(filterRow.id, updates)}
                />
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </EnterpriseSurface>
  );
}

export default StandardReportParameterPanel;
