import { useCallback, useEffect, useRef, useState } from "react";



import recruitmentClient from "@/api/clients/recruitmentClient";

import { normalizeExternalLeadRow } from "./otiDiscoveryFilters";

function resolveRunRequisitionCode(summary, payload) {

  return (

    summary?.requisition_code ||

    payload?.run?.requisition_code ||

    payload?.requisition_code ||

    null

  );

}



function extractTalentIntelligencePayload(envelope) {

  if (!envelope || typeof envelope !== "object") {

    return {};

  }



  if (envelope.external_leads || envelope.results || envelope.run || envelope.pagination) {

    return envelope;

  }



  if (envelope.data && typeof envelope.data === "object") {

    return envelope.data;

  }



  return envelope;

}



function normalizeExternalLeadsForUi(rows) {

  return (rows || []).map(normalizeExternalLeadRow);

}



export function useOtiSourcingWorkspace(requisitionCode, entryPoint = "requisition") {

  const isWorkspaceEntry = entryPoint === "workspace";

  const loadGenerationRef = useRef(0);

  const requisitionRef = useRef(requisitionCode);



  const [availability, setAvailability] = useState(null);

  const [queryText, setQueryText] = useState("");

  const [includeExternal, setIncludeExternal] = useState(false);

  const [includeSemantic, setIncludeSemantic] = useState(false);

  const [includeAiAssist, setIncludeAiAssist] = useState(false);

  const [isRunning, setIsRunning] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [runMeta, setRunMeta] = useState(null);

  const [runFailed, setRunFailed] = useState(false);

  const [results, setResults] = useState([]);

  const [externalLeads, setExternalLeads] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [pastRuns, setPastRuns] = useState([]);

  const [error, setError] = useState("");

  const [internalPage, setInternalPage] = useState(1);

  const [internalPageSize, setInternalPageSize] = useState(25);

  const [externalPage, setExternalPage] = useState(1);

  const [externalPageSize, setExternalPageSize] = useState(10);



  const isStaleForRequisition = useCallback((generation, expectedRequisition) => {

    if (generation !== loadGenerationRef.current) {

      return true;

    }



    if (expectedRequisition !== requisitionRef.current) {

      return true;

    }



    return false;

  }, []);



  useEffect(() => {

    requisitionRef.current = requisitionCode;

    loadGenerationRef.current += 1;



    setRunMeta(null);

    setRunFailed(false);

    setResults([]);

    setExternalLeads([]);

    setPagination(null);

    setPastRuns([]);

    setError("");

    setInternalPage(1);

    setExternalPage(1);

    setQueryText("");

  }, [requisitionCode]);



  const loadAvailability = useCallback(async () => {

    const generation = loadGenerationRef.current;

    const reqCode = requisitionCode;



    try {

      const response = await recruitmentClient.getTalentIntelligenceAvailability(

        reqCode ? { requisition_code: reqCode } : {}

      );



      if (isStaleForRequisition(generation, reqCode)) {

        return;

      }



      setAvailability(response?.data || null);

    } catch {

      if (isStaleForRequisition(generation, reqCode)) {

        return;

      }



      setAvailability({ available: false, feature_enabled: false });

    }

  }, [requisitionCode, isStaleForRequisition]);



  const loadPastRuns = useCallback(async () => {

    const generation = loadGenerationRef.current;

    const reqCode = requisitionCode;



    if (!reqCode) {

      if (!isStaleForRequisition(generation, reqCode)) {

        setPastRuns([]);

      }

      return;

    }



    try {

      const response = isWorkspaceEntry

        ? await recruitmentClient.listTalentIntelligenceWorkspaceRuns(reqCode)

        : await recruitmentClient.listTalentIntelligenceRuns(reqCode);



      if (isStaleForRequisition(generation, reqCode)) {

        return;

      }



      setPastRuns(response?.data?.runs || []);

    } catch {

      if (isStaleForRequisition(generation, reqCode)) {

        return;

      }



      setPastRuns([]);

    }

  }, [requisitionCode, isWorkspaceEntry, isStaleForRequisition]);



  const loadRunResults = useCallback(

    async (runId, { page = internalPage, pageSize = internalPageSize, extPage = externalPage, extPageSize = externalPageSize } = {}) => {

      if (!runId) {

        return;

      }



      const generation = loadGenerationRef.current;

      const reqCode = requisitionRef.current;



      setIsRefreshing(true);

      setError("");



      try {

        const summaryResponse = await recruitmentClient.getTalentIntelligenceRun(runId);

        const summary = extractTalentIntelligencePayload(summaryResponse) || null;



        if (isStaleForRequisition(generation, reqCode)) {

          return;

        }



        const runReqCode = resolveRunRequisitionCode(summary, null);

        if (runReqCode && reqCode && runReqCode !== reqCode) {

          return;

        }



        const resultsResponse = await recruitmentClient.getTalentIntelligenceRunResults(runId, {

          page,

          page_size: pageSize,

          external_page: extPage,

          external_page_size: extPageSize

        });



        if (isStaleForRequisition(generation, reqCode)) {

          return;

        }



        let payload = extractTalentIntelligencePayload(resultsResponse);

        const payloadRunReq = resolveRunRequisitionCode(summary, payload);

        if (payloadRunReq && reqCode && payloadRunReq !== reqCode) {

          return;

        }



        const failed = Boolean(payload.run_failed) || summary?.status === "failed";



        const internalPagination = payload.pagination?.internal;

        const requestedPage = page;

        const totalPages = internalPagination?.total_pages || 1;

        const qualifyingTotal = internalPagination?.total ?? 0;



        if (

          !failed &&

          qualifyingTotal > 0 &&

          requestedPage > totalPages &&

          runId

        ) {

          const retryResponse = await recruitmentClient.getTalentIntelligenceRunResults(runId, {

            page: 1,

            page_size: pageSize,

            external_page: extPage,

            external_page_size: extPageSize

          });



          if (isStaleForRequisition(generation, reqCode)) {

            return;

          }



          payload = retryResponse?.data || payload;

          setInternalPage(1);

        }



        if (isStaleForRequisition(generation, reqCode)) {

          return;

        }



        setRunFailed(failed);

        const externalFromApi = failed ? [] : payload.external_leads || [];

        const externalTotal =
          payload.pagination?.external?.total ??
          summary?.external_leads_count ??
          summary?.external_summary?.staged_count ??
          externalFromApi.length;



        setRunMeta({

          ...(payload.run || summary || {}),

          ...(summary || {}),

          requisition_code: payloadRunReq || runReqCode || reqCode,

          limitation_notes: summary?.limitation_notes || payload.run?.limitation_notes,

          external_leads_count: externalTotal

        });

        setResults(failed ? [] : payload.results || []);

        setExternalLeads(normalizeExternalLeadsForUi(externalFromApi));

        setPagination(payload.pagination || null);



        if (failed) {

          setError(payload.error_message || summary?.error_message || "Sourcing run failed.");

        }

      } catch (loadError) {

        if (isStaleForRequisition(generation, reqCode)) {

          return;

        }



        setError(

          loadError.response?.data?.message ||

            loadError.message ||

            "Failed to load sourcing run results."

        );

      } finally {

        if (!isStaleForRequisition(generation, reqCode)) {

          setIsRefreshing(false);

        }

      }

    },

    [externalPage, externalPageSize, internalPage, internalPageSize, isStaleForRequisition]

  );



  const startRun = useCallback(async () => {

    const generation = loadGenerationRef.current;

    const reqCode = requisitionCode;



    if (!reqCode) {

      return;

    }



    setIsRunning(true);

    setError("");

    setRunFailed(false);



    try {

      const startRunRequest = isWorkspaceEntry

        ? recruitmentClient.startTalentIntelligenceWorkspaceRun.bind(recruitmentClient)

        : recruitmentClient.startTalentIntelligenceRun.bind(recruitmentClient);



      const response = await startRunRequest(reqCode, {

        query_text: queryText,

        include_external: includeExternal,

        include_semantic: includeSemantic,

        include_ai_assist: includeAiAssist

      });



      if (isStaleForRequisition(generation, reqCode)) {

        return;

      }



      const data = response?.data || {};

      const completed = String(data.status || "").trim() === "completed";



      if (!completed && data.status === "failed") {

        setRunFailed(true);

        setError(data.error_message || "Sourcing run did not complete successfully.");

        setRunMeta(data);

        return;

      }



      setRunMeta({ ...data, requisition_code: data.requisition_code || reqCode });

      await loadRunResults(data.run_id, {

        page: 1,

        pageSize: internalPageSize,

        extPage: 1,

        extPageSize: externalPageSize

      });

      setInternalPage(1);

      setExternalPage(1);

      await loadPastRuns();

    } catch (runError) {

      if (isStaleForRequisition(generation, reqCode)) {

        return;

      }



      setError(

        runError.response?.data?.message ||

          runError.message ||

          "Failed to start sourcing run."

      );

    } finally {

      if (!isStaleForRequisition(generation, reqCode)) {

        setIsRunning(false);

      }

    }

  }, [

    requisitionCode,

    queryText,

    includeExternal,

    includeSemantic,

    includeAiAssist,

    loadRunResults,

    loadPastRuns,

    internalPageSize,

    externalPageSize,

    isWorkspaceEntry,

    isStaleForRequisition

  ]);



  useEffect(() => {

    loadAvailability();

  }, [loadAvailability]);



  useEffect(() => {

    loadPastRuns();

  }, [loadPastRuns]);



  const refreshCurrentRun = useCallback(async () => {

    if (!runMeta?.run_id) {

      return;

    }



    if (

      runMeta.requisition_code &&

      requisitionRef.current &&

      runMeta.requisition_code !== requisitionRef.current

    ) {

      setRunMeta(null);

      setResults([]);

      setExternalLeads([]);

      setPagination(null);

      return;

    }



    await loadRunResults(runMeta.run_id, {

      page: internalPage,

      pageSize: internalPageSize,

      extPage: externalPage,

      extPageSize: externalPageSize

    });

  }, [

    runMeta?.run_id,

    runMeta?.requisition_code,

    loadRunResults,

    internalPage,

    internalPageSize,

    externalPage,

    externalPageSize

  ]);



  return {

    availability,

    queryText,

    setQueryText,

    includeExternal,

    setIncludeExternal,

    includeSemantic,

    setIncludeSemantic,

    includeAiAssist,

    setIncludeAiAssist,

    isRunning,

    isRefreshing,

    runMeta,

    runFailed,

    results,

    externalLeads,

    pagination,

    pastRuns,

    error,

    internalPage,

    setInternalPage,

    internalPageSize,

    setInternalPageSize,

    externalPage,

    setExternalPage,

    externalPageSize,

    setExternalPageSize,

    loadAvailability,

    loadPastRuns,

    loadRunResults,

    refreshCurrentRun,

    startRun

  };

}


