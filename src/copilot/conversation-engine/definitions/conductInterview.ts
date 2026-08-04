import { registerConversationDefinition } from "../ConversationRegistry";
import type { ConversationDefinition } from "../types";

/**
 * Conduct Interview — review Conversation Definition.
 *
 * Collects the assigned interview only. Navigation into the existing
 * Interviewer Workspace is handled by the Workflow Orchestrator.
 */
export const CONDUCT_INTERVIEW_CONVERSATION: ConversationDefinition = {
  id: "conduct_interview",
  intent: "CONDUCT_INTERVIEW",
  title: "Conduct Interview",
  fields: [
    {
      key: "interview",
      question: "Which interview would you like to conduct?",
      required: true,
      inputType: "interview"
    }
  ]
};

export function registerConductInterviewConversation(): void {
  registerConversationDefinition(CONDUCT_INTERVIEW_CONVERSATION);
}
