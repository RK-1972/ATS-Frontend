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

export function useReportBuilder() {
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

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.code === selectedDatasetCode) || null,
    [datasets, selectedDatasetCode]
  );

  const applyDefaultConfiguration = useCallback((nextMetadata) => {
    setSelectedFieldCodes(getDefaultFieldCodes(nextMetadata?.fields || []));
    setFilters([]);
    setSortRules([]);
    setGroupByCodes([]);
    setResults(null);
    setGenerateError(null);
    setHasGenerated(false);
    setPagination({ page: 1, pageSize: DEFAULT_PAGE_SIZE, totalCount: 0 });
    builderConfigRef.current = null;
  }, []);

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
          const initialCode = nextDatasets[0].code;
          setSelectedDatasetCode(initialCode);

          const metadataResponse = await fetchReportDatasetMetadata(initialCode);
          if (cancelled) {
            return;
          }

          setMetadata(metadataResponse);
          applyDefaultConfiguration(metadataResponse);
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
  }, [applyDefaultConfiguration]);

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

  const buildQueryPayload = useCallback(
    (page = pagination.page, pageSize = pagination.pageSize) => {
      const payload = {
        dataset: selectedDatasetCode,
        fields: selectedFieldCodes,
        filters: filters
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
        sort: sortRules
          .filter((sort) => sort.fieldCode)
          .map((sort) => ({
            field: sort.fieldCode,
            direction: sort.direction
          })),
        groupBy: groupByCodes,
        page,
        pageSize
      };

      return payload;
    },
    [
      selectedDatasetCode,
      selectedFieldCodes,
      filters,
      sortRules,
      groupByCodes,
      pagination.page,
      pagination.pageSize,
      filterMetaMap,
      fieldMap
    ]
  );

  const validateBuilder = useCallback(() => {
    if (!selectedDatasetCode) {
      return "Select a dataset to generate a report.";
    }

    if (selectedFieldCodes.length === 0) {
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

    if (groupByCodes.length > 0) {
      for (const fieldCode of selectedFieldCodes) {
        if (!groupByCodes.includes(fieldCode)) {
          return "All selected fields must be included in group by when grouping is enabled.";
        }
      }
    }

    return null;
  }, [selectedDatasetCode, selectedFieldCodes, filters, fieldMap, filterMetaMap, groupByCodes]);

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

      return {
        format,
        dataset: queryPayload.dataset,
        fields: queryPayload.fields,
        filters: queryPayload.filters,
        sort: queryPayload.sort,
        groupBy: queryPayload.groupBy
      };
    },
    [buildQueryPayload, pagination.pageSize]
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
