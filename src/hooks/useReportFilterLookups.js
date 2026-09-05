import { useCallback, useEffect, useMemo, useState } from "react";

import masterDataClient from "../api/clients/masterDataClient";
import reportsClient from "../api/clients/reportsClient";
import { getPublishedRecords } from "../enterprise/masterDataHelpers";
import { FILTER_VALUE_SOURCE } from "../components/reports/reportFilterValueSources";

function mapMasterNameOptions(records) {
  return records.map((record) => ({
    value: record.name,
    label: record.name,
    code: record.code
  }));
}

function mapMasterGradeOptions(records) {
  return records.map((record) => ({
    value: record.code,
    label: `${record.code} — ${record.name}`,
    code: record.code,
    name: record.name
  }));
}

function mapRecruiterOptions(rows) {
  return (rows || []).map((row) => ({
    value: row.employee_code,
    label: row.full_name
      ? `${row.full_name} (${row.employee_code})`
      : String(row.employee_code || "—"),
    employeeCode: row.employee_code,
    fullName: row.full_name || ""
  }));
}

function mapHiringManagerOptions(rows) {
  return (rows || []).map((row) => {
    const name = row.hiring_manager_name || "";
    return {
      value: name,
      label: name || String(row.hiring_manager_code || "—"),
      hiringManagerId: row.hiring_manager_id,
      hiringManagerCode: row.hiring_manager_code
    };
  });
}

export function useReportFilterLookups() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [optionsBySource, setOptionsBySource] = useState({});
  const [sourceErrors, setSourceErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    const loadLookups = async () => {
      setLoading(true);
      setError("");
      setSourceErrors({});

      const nextOptions = {};
      const nextSourceErrors = {};
      const tasks = [];

      tasks.push(
        masterDataClient
          .getAll()
          .then((bundle) => {
            nextOptions[FILTER_VALUE_SOURCE.MASTER_DEPARTMENTS] = mapMasterNameOptions(
              getPublishedRecords(bundle, "departments")
            );
            nextOptions[FILTER_VALUE_SOURCE.MASTER_DESIGNATIONS] = mapMasterNameOptions(
              getPublishedRecords(bundle, "designations")
            );
            nextOptions[FILTER_VALUE_SOURCE.MASTER_GRADES] = mapMasterGradeOptions(
              getPublishedRecords(bundle, "grades")
            );
            nextOptions[FILTER_VALUE_SOURCE.MASTER_WORK_LOCATIONS] = mapMasterNameOptions(
              getPublishedRecords(bundle, "work_locations")
            );
            nextOptions[FILTER_VALUE_SOURCE.MASTER_BUSINESS_UNITS] = mapMasterNameOptions(
              getPublishedRecords(bundle, "business_units")
            );
            nextOptions[FILTER_VALUE_SOURCE.MASTER_EMPLOYMENT_TYPES] = mapMasterNameOptions(
              getPublishedRecords(bundle, "employment_types")
            );
          })
          .catch((loadError) => {
            nextSourceErrors[FILTER_VALUE_SOURCE.MASTER_DEPARTMENTS] =
              loadError?.response?.data?.message ||
              loadError?.message ||
              "Unable to load master data.";
          })
      );

      tasks.push(
        reportsClient
          .listFilterRecruiters()
          .then((response) => {
            if (!response?.success) {
              throw new Error(response?.message || "Unable to load recruiters.");
            }

            nextOptions[FILTER_VALUE_SOURCE.API_RECRUITERS] = mapRecruiterOptions(
              response?.data?.recruiters
            );
          })
          .catch((loadError) => {
            nextSourceErrors[FILTER_VALUE_SOURCE.API_RECRUITERS] =
              loadError?.response?.data?.message ||
              loadError?.message ||
              "Unable to load recruiters.";
          })
      );

      tasks.push(
        reportsClient
          .listFilterHiringManagers()
          .then((response) => {
            if (!response?.success) {
              throw new Error(response?.message || "Unable to load hiring managers.");
            }

            nextOptions[FILTER_VALUE_SOURCE.API_HIRING_MANAGERS] = mapHiringManagerOptions(
              response?.data?.hiring_managers
            );
          })
          .catch((loadError) => {
            nextSourceErrors[FILTER_VALUE_SOURCE.API_HIRING_MANAGERS] =
              loadError?.response?.data?.message ||
              loadError?.message ||
              "Unable to load hiring managers.";
          })
      );

      try {
        await Promise.all(tasks);
        if (!cancelled) {
          setOptionsBySource(nextOptions);
          setSourceErrors(nextSourceErrors);

          const failedSources = Object.keys(nextSourceErrors);
          if (failedSources.length === tasks.length) {
            setError("Unable to load filter lookup data.");
          } else if (failedSources.length > 0) {
            setError("");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  const getOptionsForSource = useCallback(
    (source) => optionsBySource[source] || [],
    [optionsBySource]
  );

  const getSourceError = useCallback(
    (source) => sourceErrors[source] || "",
    [sourceErrors]
  );

  const enumOptions = useMemo(
    () => ({
      fromValues(values) {
        return (values || []).map((value) => ({
          value,
          label: value
        }));
      }
    }),
    []
  );

  return {
    loading,
    error,
    getOptionsForSource,
    getSourceError,
    enumOptions
  };
}

export default useReportFilterLookups;
