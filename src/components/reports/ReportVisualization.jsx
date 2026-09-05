import { useMemo } from "react";

import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

import { EmptyState, LoadingState } from "../enterprise";
import {
  REPORT_CHART_COLORS,
  REPORT_CHART_THEME,
  formatCategoryLabel,
  formatMeasureValue,
  sortRowsByStageOrder
} from "./reportVisualizationTokens";

function buildChartSeries(rows, categoryField, valueField, categoryDataType) {
  const categories = rows.map((row) =>
    formatCategoryLabel(row[categoryField], categoryDataType)
  );
  const values = rows.map((row) => Number(row[valueField] ?? 0));

  return { categories, values };
}

function ReportKpi({ title, value, subtitle }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        minWidth: 160
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          display: "block"
        }}
      >
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
        {formatMeasureValue(value)}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: 13 }}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}

function ReportVisualization({
  config,
  results,
  loading = false,
  error = null
}) {
  const prepared = useMemo(() => {
    if (!results?.rows?.length || !config) {
      return null;
    }

    const categoryField =
      config.category_field || results?.visualization?.category_field || null;
    const valueField =
      config.value_field || results?.visualization?.value_field || null;

    if (!valueField) {
      return null;
    }

    let rows = results.rows;

    if (config.stage_order && categoryField) {
      rows = sortRowsByStageOrder(rows, categoryField);
    }

    const categoryColumn = results.columns?.find((column) => column.code === categoryField);
    const categoryDataType = categoryColumn?.data_type || "text";

    if (!categoryField) {
      const total = rows.reduce(
        (sum, row) => sum + Number(row[valueField] ?? 0),
        0
      );

      return {
        mode: "kpi",
        total,
        title: config.title || "Total"
      };
    }

    return {
      mode: "chart",
      ...buildChartSeries(rows, categoryField, valueField, categoryDataType),
      chartType: String(config.type || "bar").toLowerCase(),
      layout: config.layout || "vertical",
      title: config.title || ""
    };
  }, [results, config]);

  if (loading) {
    return (
      <Box sx={{ minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingState message="Loading visualization…" size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <EmptyState
        module="reports"
        title="Unable to render visualization"
        description={error}
      />
    );
  }

  if (!prepared) {
    return (
      <EmptyState
        module="reports"
        title="No data to visualize"
        description="Adjust filters or parameters to populate this chart."
      />
    );
  }

  if (prepared.mode === "kpi") {
    return (
      <ReportKpi
        title={prepared.title}
        value={prepared.total}
        subtitle={config?.subtitle || null}
      />
    );
  }

  const chartHeight = Math.min(Math.max(prepared.categories.length * 28, 240), 420);
  const isHorizontal =
    prepared.layout === "horizontal" ||
    prepared.chartType === "horizontal_bar" ||
    (prepared.chartType === "bar" && prepared.layout === "horizontal");

  if (prepared.chartType === "line") {
    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        {prepared.title ? (
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            {prepared.title}
          </Typography>
        ) : null}
        <LineChart
          height={320}
          margin={{ left: 56, right: 16, top: 16, bottom: 56 }}
          xAxis={[
            {
              scaleType: "point",
              data: prepared.categories,
              tickLabelStyle: { fontSize: 11 }
            }
          ]}
          yAxis={[{ tickLabelStyle: { fontSize: 11 } }]}
          series={[
            {
              data: prepared.values,
              label: config?.value_label || "Count",
              color: REPORT_CHART_THEME.primary,
              showMark: true
            }
          ]}
          grid={{ horizontal: true }}
          sx={{
            "& .MuiChartsGrid-line": { stroke: REPORT_CHART_THEME.grid }
          }}
        />
      </Box>
    );
  }

  if (prepared.chartType === "donut") {
    const pieData = prepared.categories.map((label, index) => ({
      id: index,
      label,
      value: prepared.values[index] ?? 0
    }));

    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        {prepared.title ? (
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            {prepared.title}
          </Typography>
        ) : null}
        <PieChart
          height={320}
          series={[
            {
              data: pieData,
              innerRadius: 56,
              paddingAngle: 2,
              cornerRadius: 4
            }
          ]}
          colors={REPORT_CHART_COLORS}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {prepared.title ? (
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          {prepared.title}
        </Typography>
      ) : null}
      <BarChart
        height={isHorizontal ? chartHeight : 320}
        layout={isHorizontal ? "horizontal" : "vertical"}
        margin={
          isHorizontal
            ? { left: 120, right: 16, top: 16, bottom: 24 }
            : { left: 48, right: 16, top: 16, bottom: 72 }
        }
        xAxis={
          isHorizontal
            ? [{ tickLabelStyle: { fontSize: 11 } }]
            : [
                {
                  scaleType: "band",
                  data: prepared.categories,
                  tickLabelStyle: { fontSize: 11 },
                  tickLabelInterval: () => true
                }
              ]
        }
        yAxis={
          isHorizontal
            ? [
                {
                  scaleType: "band",
                  data: prepared.categories,
                  tickLabelStyle: { fontSize: 11 }
                }
              ]
            : [{ tickLabelStyle: { fontSize: 11 } }]
        }
        series={[
          {
            data: prepared.values,
            label: config?.value_label || "Count",
            color: REPORT_CHART_THEME.primary
          }
        ]}
        grid={isHorizontal ? { vertical: true } : { horizontal: true }}
        sx={{
          "& .MuiChartsGrid-line": { stroke: REPORT_CHART_THEME.grid }
        }}
      />
    </Box>
  );
}

export default ReportVisualization;
