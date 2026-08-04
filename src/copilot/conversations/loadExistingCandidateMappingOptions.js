import candidateRepository from "@/repositories/candidateRepository";

/**
 * Read mapping options for a candidate using the EXISTING ATS profile load.
 * Does not modify the repository or invent eligibility rules.
 *
 * Limitation: candidate-full-details exposes the active mapping the workspace
 * already uses (typically one). Multi-mapping lists are not available without
 * a new ATS API — see orchestrator docs in the Copilot response.
 */
export async function loadExistingCandidateMappingOptions(candidateId) {
  if (!candidateId) {
    return [];
  }

  const profile = await candidateRepository.loadCandidateProfile(candidateId);
  const mapping = profile?.mapping || {};

  const mapId = mapping.map_id ?? null;
  const reqId = mapping.req_id ?? null;

  if (!mapId || !reqId) {
    return [];
  }

  const requisitionCode =
    mapping.req_code || mapping.requisition_code || String(reqId);

  return [
    {
      mapId,
      reqId,
      requisitionCode,
      label: String(requisitionCode)
    }
  ];
}
