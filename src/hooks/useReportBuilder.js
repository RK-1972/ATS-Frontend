import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  executeReportQuery,
  exportReport as exportReportFile,
  downloadReportFile,
  fetchReportDatasetMetadata,
  fetchReportDatasets
} from "../pages/reports/reportBuilderApi";

const DEFAULT_PAGE_SIZE = 25;

function createFilterRow() {
  return {
    id: `filter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldCode: "",
    operator: "",
    value: "",
    valueEnd: ""
  };
}

function createSortRow() {
  return {
    id: `sort-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldCode: "",
    direction: "asc"
  };
}

function getDefaultFieldCodes(fields = []) {
  return fields.filter((field) => field.default_visible).map((field) => field.code);
}

function buildFilterValue(filterRow, fieldMeta, operator) {
  if (operator === "between") {
    return [filterRow.value, filterRow.valueEnd];
  }

  if (operator === "in") {
    if (Array.isArray(filterRow.value)) {
      return filterRow.value;
    }

    return String(filterRow.value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (fieldMeta?.data_type === "number") {
    return filterRow.value === "" ? null : Number(filterRow.value);
  }

  if (fieldMeta?.data_type === "enum" && fieldMeta.code === "is_active") {
    return filterRow.value === "true" || filterRow.value === true;
  }

  return filterRow.value;
}

function isFilterComplete(filterRow, fieldMeta, operator) {
  if (!filterRow.fieldCode || !operator) {
    return false;
  }

  if (operator === "between") {
    return Boolean(filterRow.value) && Boolean(filterRow.valueEnd);
  }

  if (operator === "in") {
    const values = buildFilterValue(filterRow, fieldMeta, operator);
    return Array.isArray(values) && values.length > 0;
  }

  return filterRow.value !== "" && filterRow.value !== null && filterRow.value !== undefined;
}

function createFilterRowFromApi(filter) {
  const operator = filter.operator || "equals";
  const isBetween = operator === "between";
  const isIn = operator === "in";

  return {
    id: `filter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldCode: filter.field,
    operator,
    value: isBetween
      ? filter.value?.[0] ?? ""
      : isIn
        ? filter.value || []
        : filter.value ?? "",
    valueEnd: isBetween ? filter.value?.[1] ?? "" : ""
  };
}

function createSortRowFromApi(sortItem) {
  return {
    id: `sort-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldCode: sortItem.field,
    direction: sortItem.direction || "asc"
  };
}

function createDimensionRowFromApi(dimension) {
  return {
    id: `dimension-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldCode: dimension.field,
    grain: dimension.grain || ""
  };
}

function createMeasureRowFromApi(measure) {
  return {
    id: `measure-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldCode: measure.field,
    aggregation: measure.aggregation || "",
    alias: measure.alias || ""
  };
}

function createDimensionRow() {
  return {
    id: `dimension-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldCode: "",
    grain: ""
  };
}

function createMeasureRow() {
  return {
    id: `measure-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fieldCode: "",
    aggregation: "",
    alias: ""
  };
}

export function useReportBuilder(options = {}) {
  const [datasets, setDatasets] = useState([]);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [datasetsError, setDatasetsError] = useState(null);

  const [selectedDatasetCode, setSelectedDatasetCode] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState(null);

  const [selectedFieldCodes, setSelectedFieldCodes] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortRules, setSortRules] = useState([]);
  const [groupByCodes, setGroupByCodes] = useState([]);
  const [resultMode, setResultMode] = useState("detail");
  const [dimensions, setDimensions] = useState([]);
  const [measures, setMeasures] = useState([]);

  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0
  });

  const builderConfigRef = useRef(null);
  const initialPrefillRef = useRef(options.initialPrefill || null);
  const prefillAppliedRef = useRef(false);

  const fieldMap = useMemo(() => {
    const map = new Map();
    (metadata?.fields || []).forEach((field) => map.set(field.code, field));
    return map;
  }, [metadata]);

  const filterMetaMap = useMemo(() => {
    const map = new Map();
    (metadata?.filters || []).forEach((filter) => map.set(filter.field_code, filter));
    return map;
  }, [metadata]);

  const sortableFields = useMemo(
    () => (metadata?.fields || []).filter((field) => field.sortable),
    [metadata]
  );

  const groupableFields = useMemo(
    () => (metadata?.fields || []).filter((field) => field.groupable),
    [metadata]
  );

  const dimensionFields = useMemo(
    () => (metadata?.fields || []).filter((field) => field.dimension_eligible),
    [metadata]
  );

  const measureFields = useMemo(
    () => (metadata?.fields || []).filter((field) => field.measure_eligible),
    [metadata]
  );

  const dateGrains = useMemo(
    () => metadata?.semantic?.date_grains || ["DAY", "WEEK", "MONTH", "QUARTER", "YEAR"],
    [metadata]
  );

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.code === selectedDatasetCode) || null,
    [datasets, selectedDatasetCode]
  );

  const applyDefaultConfiguration = useCallback((nextMetadata) => {
    setSelectedFieldCodes(getDefaultFieldCodes(nextMetadata?.fields || []));
    setFilters([]);
    setSortRules([]);
    setGroupByCodes([]);
    setResultMode("detail");
    setDimensions([]);
    setMeasures([]);
    setResults(null);
    setGenerateError(null);
    setHasGenerated(false);
    setPagination({ page: 1, pageSize: DEFAULT_PAGE_SIZE, totalCount: 0 });
    builderConfigRef.current = null;
  }, []);

  const applyConfiguration = useCallback((config, nextMetadata) => {
    if (!config?.dataset) {
      applyDefaultConfiguration(nextMetadata);
      return;
    }

    setSelectedDatasetCode(config.dataset);
    setResultMode(config.result_mode === "aggregate" ? "aggregate" : "detail");
    setSelectedFieldCodes(Array.isArray(config.fields) ? config.fields : []);
    setDimensions(
      Array.isArray(config.dimensions) ? config.dimensions.map(createDimensionRowFromApi) : []
    );
    setMeasures(Array.isArray(config.measures) ? config.measures.map(createMeasureRowFromApi) : []);
    setFilters(
      Array.isArray(config.filters) ? config.filters.map(createFilterRowFromApi) : []
    );
    setSortRules(Array.isArray(config.sort) ? config.sort.map(createSortRowFromApi) : []);
    setGroupByCodes(Array.isArray(config.groupBy) ? config.groupBy : []);
    setResults(null);
    setGenerateError(null);
    setHasGenerated(false);
    setPagination({ page: 1, pageSize: DEFAULT_PAGE_SIZE, totalCount: 0 });
    builderConfigRef.current = null;
  }, [applyDefaultConfiguration]);

  const loadDatasets = useCallback(async () => {
    setDatasetsLoading(true);
    setDatasetsError(null);
    setMetadataLoading(true);
    setMetadataError(null);

    try {
      const data = await fetchReportDatasets();
      const nextDatasets = data?.datasets || [];
      setDatasets(nextDatasets);

      if (nextDatasets.length > 0) {
        const initialCode = nextDatasets[0].code;
        setSelectedDatasetCode(initialCode);

        const metadataResponse = await fetchReportDatasetMetadata(initialCode);
        setMetadata(metadataResponse);
        applyDefaultConfiguration(metadataResponse);
      } else {
        setMetadata(null);
      }
    } catch (error) {
      setMetadata(null);
      setDatasetsError(error.message || "Failed to load report datasets.");
    } finally {
      setDatasetsLoading(false);
      setMetadataLoading(false);
    }
  }, [applyDefaultConfiguration]);

  const loadMetadata = useCallback(
    async (datasetCode) => {
      if (!datasetCode) {
        setMetadata(null);
        return;
      }

      setMetadataLoading(true);
      setMetadataError(null);

      try {
        const data = await fetchReportDatasetMetadata(datasetCode);
        setMetadata(data);
        applyDefaultConfiguration(data);
      } catch (error) {
        setMetadata(null);
        setMetadataError(error.message || "Failed to load report metadata.");
      } finally {
        setMetadataLoading(false);
      }
    },
    [applyDefaultConfiguration]
  );

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const data = await fetchReportDatasets();
        if (cancelled) {
          return;
        }

        const nextDatasets = data?.datasets || [];
        setDatasets(nextDatasets);

        if (nextDatasets.length > 0) {
          const prefill = initialPrefillRef.current;
          const initialCode =
            prefill?.dataset && nextDatasets.some((item) => item.code === prefill.dataset)
              ? prefill.dataset
              : nextDatasets[0].code;
          setSelectedDatasetCode(initialCode);

          const metadataResponse = await fetchReportDatasetMetadata(initialCode);
          if (cancelled) {
            return;
          }

          setMetadata(metadataResponse);

          if (prefill && !prefillAppliedRef.current) {
            prefillAppliedRef.current = true;
            applyConfiguration(prefill, metadataResponse);
          } else {
            applyDefaultConfiguration(metadataResponse);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setDatasetsError(error.message || "Failed to load report datasets.");
        }
      } finally {
        if (!cancelled) {
          setDatasetsLoading(false);
          setMetadataLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [applyDefaultConfiguration, applyConfiguration]);

  const handleDatasetChange = useCallback(
    async (datasetCode) => {
      setSelectedDatasetCode(datasetCode);
      await loadMetadata(datasetCode);
    },
    [loadMetadata]
  );

  const handleAddField = useCallback((fieldCode) => {
    setSelectedFieldCodes((current) =>
      current.includes(fieldCode) ? current : [...current, fieldCode]
    );
  }, []);

  const handleRemoveField = useCallback((fieldCode) => {
    setSelectedFieldCodes((current) => current.filter((code) => code !== fieldCode));
    setGroupByCodes((current) => current.filter((code) => code !== fieldCode));
  }, []);

  const handleAddFilter = useCallback(() => {
    setFilters((current) => [...current, createFilterRow()]);
  }, []);

  const handleUpdateFilter = useCallback((filterId, updates) => {
    setFilters((current) =>
      current.map((filter) => (filter.id === filterId ? { ...filter, ...updates } : filter))
    );
  }, []);

  const handleRemoveFilter = useCallback((filterId) => {
    setFilters((current) => current.filter((filter) => filter.id !== filterId));
  }, []);

  const handleAddSort = useCallback(() => {
    setSortRules((current) => [...current, createSortRow()]);
  }, []);

  const handleUpdateSort = useCallback((sortId, updates) => {
    setSortRules((current) =>
      current.map((sort) => (sort.id === sortId ? { ...sort, ...updates } : sort))
    );
  }, []);

  const handleRemoveSort = useCallback((sortId) => {
    setSortRules((current) => current.filter((sort) => sort.id !== sortId));
  }, []);

  const handleToggleGroupField = useCallback((fieldCode) => {
    setGroupByCodes((current) =>
      current.includes(fieldCode)
        ? current.filter((code) => code !== fieldCode)
        : [...current, fieldCode]
    );
  }, []);

  const handleAddDimension = useCallback(() => {
    setDimensions((current) => [...current, createDimensionRow()]);
  }, []);

  const handleUpdateDimension = useCallback((dimensionId, updates) => {
    setDimensions((current) =>
      current.map((dimension) =>
        dimension.id === dimensionId ? { ...dimension, ...updates } : dimension
      )
    );
  }, []);

  const handleRemoveDimension = useCallback((dimensionId) => {
    setDimensions((current) => current.filter((dimension) => dimension.id !== dimensionId));
  }, []);

  const handleAddMeasure = useCallback(() => {
    setMeasures((current) => [...current, createMeasureRow()]);
  }, []);

  const handleUpdateMeasure = useCallback((measureId, updates) => {
    setMeasures((current) =>
      current.map((measure) => (measure.id === measureId ? { ...measure, ...updates } : measure))
    );
  }, []);

  const handleRemoveMeasure = useCallback((measureId) => {
    setMeasures((current) => current.filter((measure) => measure.id !== measureId));
  }, []);

  const buildFilterPayload = useCallback(
    () =>
      filters
        .map((filterRow) => {
          const filterMeta = filterMetaMap.get(filterRow.fieldCode);
          const fieldMeta = fieldMap.get(filterRow.fieldCode);
          const operator = filterRow.operator;

          if (!filterMeta || !fieldMeta || !isFilterComplete(filterRow, fieldMeta, operator)) {
            return null;
          }

          return {
            field: filterRow.fieldCode,
            operator,
            value: buildFilterValue(filterRow, fieldMeta, operator)
          };
        })
        .filter(Boolean),
    [filters, filterMetaMap, fieldMap]
  );

  const buildQueryPayload = useCallback(
    (page = pagination.page, pageSize = pagination.pageSize) => {
      const filterPayload = buildFilterPayload();
      const sortPayload = sortRules
        .filter((sort) => sort.fieldCode)
        .map((sort) => ({
          field: sort.fieldCode,
          direction: sort.direction
        }));

      if (resultMode === "aggregate") {
        return {
          dataset: selectedDatasetCode,
          dimensions: dimensions
            .filter((dimension) => dimension.fieldCode)
            .map((dimension) => ({
              field: dimension.fieldCode,
              ...(dimension.grain ? { grain: dimension.grain } : {})
            })),
          measures: measures
            .filter((measure) => measure.fieldCode && measure.aggregation)
            .map((measure) => ({
              field: measure.fieldCode,
              aggregation: measure.aggregation,
              ...(measure.alias ? { alias: measure.alias } : {})
            })),
          filters: filterPayload,
          sort: sortPayload,
          page,
          pageSize
        };
      }

      return {
        dataset: selectedDatasetCode,
        fields: selectedFieldCodes,
        filters: filterPayload,
        sort: sortPayload,
        groupBy: groupByCodes,
        page,
        pageSize
      };
    },
    [
      resultMode,
      selectedDatasetCode,
      selectedFieldCodes,
      dimensions,
      measures,
      buildFilterPayload,
      sortRules,
      groupByCodes,
      pagination.page,
      pagination.pageSize
    ]
  );

  const validateBuilder = useCallback(() => {
    if (!selectedDatasetCode) {
      return "Select a dataset to generate a report.";
    }

    if (resultMode === "aggregate") {
      if (measures.filter((measure) => measure.fieldCode && measure.aggregation).length === 0) {
        return "Select at least one measure.";
      }

      for (const measure of measures) {
        if (!measure.fieldCode && !measure.aggregation) {
          continue;
        }

        const fieldMeta = fieldMap.get(measure.fieldCode);
        if (!fieldMeta || !fieldMeta.measure_eligible) {
          return "One or more measures use invalid fields.";
        }

        if (!measure.aggregation) {
          return "Select an aggregation for each measure.";
        }
      }

      for (const dimension of dimensions) {
        if (!dimension.fieldCode) {
          continue;
        }

        const fieldMeta = fieldMap.get(dimension.fieldCode);
        if (!fieldMeta || !fieldMeta.dimension_eligible) {
          return "One or more dimensions use invalid fields.";
        }
      }
    } else if (selectedFieldCodes.length === 0) {
      return "Select at least one field.";
    }

    for (const filterRow of filters) {
      if (!filterRow.fieldCode && !filterRow.operator && filterRow.value === "") {
        continue;
      }

      const fieldMeta = fieldMap.get(filterRow.fieldCode);
      const filterMeta = filterMetaMap.get(filterRow.fieldCode);

      if (!fieldMeta || !filterMeta) {
        return "One or more filters use invalid fields.";
      }

      if (!filterRow.operator) {
        return "Select an operator for each filter.";
      }

      if (!isFilterComplete(filterRow, fieldMeta, filterRow.operator)) {
        return "Complete all filter values before generating.";
      }
    }

    if (resultMode === "detail" && groupByCodes.length > 0) {
      for (const fieldCode of selectedFieldCodes) {
        if (!groupByCodes.includes(fieldCode)) {
          return "All selected fields must be included in group by when grouping is enabled.";
        }
      }
    }

    return null;
  }, [
    selectedDatasetCode,
    resultMode,
    selectedFieldCodes,
    measures,
    dimensions,
    filters,
    fieldMap,
    filterMetaMap,
    groupByCodes
  ]);

  const generateReport = useCallback(
    async (nextPage, nextPageSize) => {
      const validationMessage = validateBuilder();

      if (validationMessage) {
        setGenerateError(validationMessage);
        return;
      }

      const page = nextPage ?? pagination.page;
      const pageSize = nextPageSize ?? pagination.pageSize;
      const payload = buildQueryPayload(page, pageSize);

      setGenerating(true);
      setGenerateError(null);
      setExportError(null);

      try {
        const data = await executeReportQuery(payload);
        builderConfigRef.current = payload;
        setResults(data);
        setHasGenerated(true);
        setPagination({
          page: data?.pagination?.page || page,
          pageSize: data?.pagination?.page_size || pageSize,
          totalCount: data?.pagination?.total_count || 0
        });
      } catch (error) {
        setGenerateError(error.message || "Failed to generate report.");
      } finally {
        setGenerating(false);
      }
    },
    [validateBuilder, buildQueryPayload, pagination.page, pagination.pageSize]
  );

  const handlePageChange = useCallback(
    (page, pageSize) => {
      setPagination((current) => ({
        ...current,
        page,
        pageSize: pageSize || current.pageSize
      }));
      generateReport(page, pageSize);
    },
    [generateReport]
  );

  const resetBuilder = useCallback(() => {
    applyDefaultConfiguration(metadata);
  }, [applyDefaultConfiguration, metadata]);

  const buildExportPayload = useCallback(
    (format) => {
      const queryPayload = buildQueryPayload(1, pagination.pageSize);

      if (resultMode === "aggregate") {
        return {
          format,
          dataset: queryPayload.dataset,
          dimensions: queryPayload.dimensions,
          measures: queryPayload.measures,
          filters: queryPayload.filters,
          sort: queryPayload.sort
        };
      }

      return {
        format,
        dataset: queryPayload.dataset,
        fields: queryPayload.fields,
        filters: queryPayload.filters,
        sort: queryPayload.sort,
        groupBy: queryPayload.groupBy
      };
    },
    [buildQueryPayload, pagination.pageSize, resultMode]
  );

  const exportReport = useCallback(
    async (format) => {
      if (!hasGenerated || !builderConfigRef.current) {
        setExportError("Generate a report before downloading.");
        return;
      }

      const validationMessage = validateBuilder();

      if (validationMessage) {
        setExportError(validationMessage);
        return;
      }

      setExporting(true);
      setExportError(null);

      try {
        const payload = buildExportPayload(format);
        const file = await exportReportFile(payload);
        downloadReportFile(file);
      } catch (error) {
        setExportError(error.message || "Failed to export report.");
      } finally {
        setExporting(false);
      }
    },
    [hasGenerated, validateBuilder, buildExportPayload]
  );

  const clearExportError = useCallback(() => {
    setExportError(null);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  return {
    datasets,
    datasetsLoading,
    datasetsError,
    selectedDatasetCode,
    selectedDataset,
    metadata,
    metadataLoading,
    metadataError,
    selectedFieldCodes,
    filters,
    sortRules,
    groupByCodes,
    resultMode,
    dimensions,
    measures,
    dimensionFields,
    measureFields,
    dateGrains,
    results,
    generating,
    generateError,
    hasGenerated,
    exporting,
    exportError,
    pagination,
    fieldMap,
    filterMetaMap,
    sortableFields,
    groupableFields,
    loadDatasets,
    handleDatasetChange,
    handleAddField,
    handleRemoveField,
    handleAddFilter,
    handleUpdateFilter,
    handleRemoveFilter,
    handleAddSort,
    handleUpdateSort,
    handleRemoveSort,
    handleToggleGroupField,
    setResultMode,
    handleAddDimension,
    handleUpdateDimension,
    handleRemoveDimension,
    handleAddMeasure,
    handleUpdateMeasure,
    handleRemoveMeasure,
    generateReport,
    exportReport,
    handlePageChange,
    resetBuilder,
    clearFilters,
    clearExportError,
    validateBuilder
  };
}

export default useReportBuilder;
