import { registerConversationDefinition } from "../ConversationRegistry";
import type { ConversationDefinition } from "../types";

/**
 * Assign Recruiter to Requisition — transactional Conversation Definition.
 *
 * Collects requisition + recruiter only. Confirmation and ATS execution are
 * handled by the Copilot UX + Workflow Orchestrator (not by this definition).
 */
export const ASSIGN_RECRUITER_CONVERSATION: ConversationDefinition = {
  id: "assign_recruiter",
  intent: "ASSIGN_RECRUITER",
  title: "Assign Recruiter",
  fields: [
    {
      key: "requisition",
      question: "Which requisition would you like to assign?",
      required: true,
      inputType: "requisition"
    },
    {
      key: "recruiter",
      question: "Which recruiter would you like to assign?",
      required: true,
      inputType: "recruiter"
    }
  ]
};

export function registerAssignRecruiterConversation(): void {
  registerConversationDefinition(ASSIGN_RECRUITER_CONVERSATION);
}
