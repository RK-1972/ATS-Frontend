import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  downloadReportFile,
  executeReportQuery,
  exportReport,
  fetchReportDatasetMetadata,
  fetchStandardReportDefinition
} from "../pages/reports/standardReportsApi";

const DEFAULT_PAGE_SIZE = 25;

function createParameterFilterRow(fieldCode, defaultOperator) {
  return {
    id: `param-${fieldCode}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fieldCode,
    operator: defaultOperator || "equals",
    value: "",
    valueEnd: ""
  };
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

function buildQueryPayloadFromState(definition, parameterFilters, fieldMap, page, pageSize) {
  const baseDefinition = definition?.definition || {};
  const activeFilters = [
    ...(baseDefinition.filters || []),
    ...parameterFilters
      .map((filterRow) => {
        const fieldMeta = fieldMap.get(filterRow.fieldCode);
        const operator = filterRow.operator;

        if (!fieldMeta || !isFilterComplete(filterRow, fieldMeta, operator)) {
          return null;
        }

        return {
          field: filterRow.fieldCode,
          operator,
          value: buildFilterValue(filterRow, fieldMeta, operator)
        };
      })
      .filter(Boolean)
  ];

  if (baseDefinition.result_mode === "aggregate") {
    return {
      dataset: definition?.dataset_code,
      dimensions: baseDefinition.dimensions || [],
      measures: baseDefinition.measures || [],
      filters: activeFilters,
      sort: baseDefinition.sort || [],
      page,
      pageSize
    };
  }

  return {
    dataset: definition?.dataset_code,
    fields: baseDefinition.fields || [],
    filters: activeFilters,
    sort: baseDefinition.sort || [],
    groupBy: baseDefinition.group_by || baseDefinition.groupBy || [],
    page,
    pageSize
  };
}

export function useStandardReport(reportCode) {
  const [definition, setDefinition] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [parameterFilters, setParameterFilters] = useState([]);
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

  const queryConfigRef = useRef(null);
  const parameterFiltersRef = useRef([]);

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

  useEffect(() => {
    parameterFiltersRef.current = parameterFilters;
  }, [parameterFilters]);

  const loadDefinition = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initializeReport() {
      setLoading(true);
      setError(null);
      setGenerateError(null);
      setHasGenerated(false);
      setResults(null);

      try {
        const reportDefinition = await fetchStandardReportDefinition(reportCode);
        if (cancelled) {
          return;
        }

        const datasetMetadata = await fetchReportDatasetMetadata(reportDefinition.dataset_code);
        if (cancelled) {
          return;
        }

        const parameterRows = (reportDefinition.definition?.parameter_filters || []).map(
          (param) => createParameterFilterRow(param.field_code, param.default_operator)
        );

        const fieldLookup = new Map();
        (datasetMetadata?.fields || []).forEach((field) => fieldLookup.set(field.code, field));

        const initialPayload = buildQueryPayloadFromState(
          reportDefinition,
          parameterRows,
          fieldLookup,
          1,
          DEFAULT_PAGE_SIZE
        );

        setDefinition(reportDefinition);
        setMetadata(datasetMetadata);
        setParameterFilters(parameterRows);
        parameterFiltersRef.current = parameterRows;
        setLoading(false);
        setGenerating(true);

        const data = await executeReportQuery(initialPayload);
        if (cancelled) {
          return;
        }

        queryConfigRef.current = initialPayload;
        setResults(data);
        setHasGenerated(true);
        setPagination({
          page: data?.pagination?.page || 1,
          pageSize: data?.pagination?.page_size || DEFAULT_PAGE_SIZE,
          totalCount: data?.pagination?.total_count || 0
        });
      } catch (loadError) {
        if (!cancelled) {
          setDefinition(null);
          setMetadata(null);
          setError(loadError.message || "Failed to load standard report.");
          setLoading(false);
        }
      } finally {
        if (!cancelled) {
          setGenerating(false);
        }
      }
    }

    initializeReport();

    return () => {
      cancelled = true;
    };
  }, [reportCode, reloadToken]);

  const buildQueryPayload = useCallback(
    (page = pagination.page, pageSize = pagination.pageSize) =>
      buildQueryPayloadFromState(
        definition,
        parameterFiltersRef.current,
        fieldMap,
        page,
        pageSize
      ),
    [definition, fieldMap, pagination.page, pagination.pageSize]
  );

  const runReport = useCallback(
    async (nextPage, nextPageSize) => {
      if (!definition) {
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
        queryConfigRef.current = payload;
        setResults(data);
        setHasGenerated(true);
        setPagination({
          page: data?.pagination?.page || page,
          pageSize: data?.pagination?.page_size || pageSize,
          totalCount: data?.pagination?.total_count || 0
        });
      } catch (runError) {
        setGenerateError(runError.message || "Failed to run standard report.");
      } finally {
        setGenerating(false);
      }
    },
    [definition, buildQueryPayload, pagination.page, pagination.pageSize]
  );

  const handlePageChange = useCallback(
    (page, pageSize) => {
      setPagination((current) => ({
        ...current,
        page,
        pageSize: pageSize || current.pageSize
      }));
      runReport(page, pageSize);
    },
    [runReport]
  );

  const handleUpdateParameter = useCallback((filterId, updates) => {
    setParameterFilters((current) => {
      const next = current.map((filter) =>
        filter.id === filterId ? { ...filter, ...updates } : filter
      );
      parameterFiltersRef.current = next;
      return next;
    });
  }, []);

  const handleApplyParameters = useCallback(() => {
    setPagination((current) => ({ ...current, page: 1 }));
    runReport(1, pagination.pageSize);
  }, [runReport, pagination.pageSize]);

  const clearParameterFilters = useCallback(() => {
    const parameterRows = (definition?.definition?.parameter_filters || []).map((param) =>
      createParameterFilterRow(param.field_code, param.default_operator)
    );
    setParameterFilters(parameterRows);
    parameterFiltersRef.current = parameterRows;
    setPagination((current) => ({ ...current, page: 1 }));
    runReport(1, pagination.pageSize);
  }, [definition, runReport, pagination.pageSize]);

  const buildExportPayload = useCallback(
    (format) => {
      const queryPayload = buildQueryPayload(1, pagination.pageSize);

      if (definition?.definition?.result_mode === "aggregate") {
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
    [buildQueryPayload, pagination.pageSize, definition]
  );

  const handleExport = useCallback(
    async (format) => {
      if (!hasGenerated || !queryConfigRef.current) {
        setExportError("Run the report before downloading.");
        return;
      }

      setExporting(true);
      setExportError(null);

      try {
        const payload = buildExportPayload(format);
        const file = await exportReport(payload);
        downloadReportFile(file);
      } catch (exportFailure) {
        setExportError(exportFailure.message || "Failed to export report.");
      } finally {
        setExporting(false);
      }
    },
    [hasGenerated, buildExportPayload]
  );

  const buildBuilderPrefill = useCallback(() => {
    if (!definition) {
      return null;
    }

    const baseDefinition = definition.definition || {};
    const activeFilters = parameterFilters
      .map((filterRow) => {
        const fieldMeta = fieldMap.get(filterRow.fieldCode);
        const operator = filterRow.operator;

        if (!fieldMeta || !isFilterComplete(filterRow, fieldMeta, operator)) {
          return null;
        }

        return {
          field: filterRow.fieldCode,
          operator,
          value: buildFilterValue(filterRow, fieldMeta, operator)
        };
      })
      .filter(Boolean);

    return {
      dataset: definition.dataset_code,
      result_mode: baseDefinition.result_mode || "detail",
      fields: baseDefinition.fields || [],
      dimensions: baseDefinition.dimensions || [],
      measures: baseDefinition.measures || [],
      filters: [...(baseDefinition.filters || []), ...activeFilters],
      sort: baseDefinition.sort || [],
      groupBy: baseDefinition.group_by || baseDefinition.groupBy || [],
      visualization: definition.visualization || null
    };
  }, [definition, parameterFilters, fieldMap]);

  return {
    definition,
    metadata,
    loading,
    error,
    parameterFilters,
    fieldMap,
    filterMetaMap,
    results,
    generating,
    generateError,
    hasGenerated,
    exporting,
    exportError,
    pagination,
    loadDefinition,
    handleUpdateParameter,
    handleApplyParameters,
    clearParameterFilters,
    handlePageChange,
    handleExport,
    buildBuilderPrefill
  };
}

export default useStandardReport;
