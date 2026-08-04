import { registerConversationDefinition } from "../ConversationRegistry";
import type { ConversationDefinition } from "../types";

/**
 * Schedule Interview — first Conversation Definition (reference implementation).
 *
 * Business rule (ATS): one candidate → one active requisition.
 * Therefore requisition is never asked here; the Workflow Orchestrator resolves
 * it via existing ATS profile/mapping APIs.
 */
export const SCHEDULE_INTERVIEW_CONVERSATION: ConversationDefinition = {
  id: "schedule_interview",
  intent: "SCHEDULE_INTERVIEW",
  title: "Schedule Interview",
  introMessage: "Certainly.",
  fields: [
    {
      key: "candidate",
      question: "Which candidate would you like to schedule an interview for?",
      required: true,
      inputType: "candidate"
    },
    {
      key: "interviewer",
      question: "Who would you like to assign as the interviewer?",
      required: true,
      inputType: "interviewer"
    },
    {
      key: "interviewLevel",
      question: "Which interview level would you like to schedule?",
      required: true,
      inputType: "interview_level"
    },
    {
      key: "interviewDate",
      question: "When would you like to schedule the interview? (Date)",
      required: true,
      inputType: "date"
    },
    {
      key: "interviewTime",
      question: "What time should the interview start?",
      required: true,
      inputType: "time"
    }
  ]
};

export function registerScheduleInterviewConversation(): void {
  registerConversationDefinition(SCHEDULE_INTERVIEW_CONVERSATION);
}
