import { registerConversationDefinition } from "../ConversationRegistry";
import type { ConversationDefinition } from "../types";

/**
 * Map Candidate to Requisition — transactional Conversation Definition.
 *
 * Collects candidate + requisition only. Confirmation and ATS execution are
 * handled by the Copilot UX + Workflow Orchestrator.
 */
export const MAP_CANDIDATE_CONVERSATION: ConversationDefinition = {
  id: "map_candidate",
  intent: "MAP_CANDIDATE",
  title: "Map Candidate to Requisition",
  fields: [
    {
      key: "candidate",
      question: "Which candidate would you like to map?",
      required: true,
      inputType: "candidate"
    },
    {
      key: "requisition",
      question: "Which requisition would you like to map the candidate to?",
      required: true,
      /** Same list as CandidateAssignmentDialog (GET /my-requisitions). */
      inputType: "my_requisition"
    }
  ]
};

export function registerMapCandidateConversation(): void {
  registerConversationDefinition(MAP_CANDIDATE_CONVERSATION);
}
