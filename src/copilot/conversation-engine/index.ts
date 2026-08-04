import { registerScheduleInterviewConversation } from "./definitions/scheduleInterview";
import { registerAssignRecruiterConversation } from "./definitions/assignRecruiter";
import { registerMapCandidateConversation } from "./definitions/mapCandidate";
import { registerConductInterviewConversation } from "./definitions/conductInterview";

export type {
  ConversationDefinition,
  ConversationFieldDefinition,
  ConversationPrompt,
  ConversationSession,
  FieldInputType
} from "./types";

export {
  registerConversationDefinition,
  getConversationDefinitionById,
  getConversationDefinitionByIntent,
  listConversationDefinitions
} from "./ConversationRegistry";

export {
  createConversationEngine
} from "./ConversationEngine";
export type { ConversationEngine } from "./ConversationEngine";

export { SCHEDULE_INTERVIEW_CONVERSATION } from "./definitions/scheduleInterview";
export { ASSIGN_RECRUITER_CONVERSATION } from "./definitions/assignRecruiter";
export { MAP_CANDIDATE_CONVERSATION } from "./definitions/mapCandidate";
export { CONDUCT_INTERVIEW_CONVERSATION } from "./definitions/conductInterview";

/** Register built-in conversational workflows once. */
let bootstrapped = false;

export function bootstrapConversationEngine(): void {
  if (bootstrapped) {
    return;
  }

  registerScheduleInterviewConversation();
  registerAssignRecruiterConversation();
  registerMapCandidateConversation();
  registerConductInterviewConversation();
  bootstrapped = true;
}
