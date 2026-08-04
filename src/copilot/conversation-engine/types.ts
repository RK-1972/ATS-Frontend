/**
 * Conversation Engine — shared types.
 * No workflow-specific business logic lives here.
 */

export type FieldInputType =
  | "candidate"
  | "interviewer"
  | "interview_level"
  | "interview"
  | "requisition"
  | "my_requisition"
  | "recruiter"
  | "date"
  | "time"
  | "text";

export type ConversationFieldDefinition = {
  key: string;
  /** Question shown to the recruiter */
  question: string;
  required?: boolean;
  inputType: FieldInputType;
};

export type ConversationDefinition = {
  id: string;
  /** IntentEngine intent name this definition handles */
  intent: string;
  title: string;
  introMessage?: string;
  fields: ConversationFieldDefinition[];
};

export type ConversationStatus = "active" | "complete" | "cancelled";

export type ConversationSession = {
  sessionId: string;
  definitionId: string;
  intent: string;
  collected: Record<string, unknown>;
  pendingFieldKeys: string[];
  currentFieldKey: string | null;
  status: ConversationStatus;
  introShown: boolean;
};

export type ConversationPrompt =
  | {
      kind: "intro";
      message: string;
    }
  | {
      kind: "question";
      fieldKey: string;
      question: string;
      inputType: FieldInputType;
      /** Previously collected value for this field (editing / back navigation). */
      currentValue?: unknown;
      /** True when the recruiter can move one step backward. */
      canGoBack?: boolean;
    }
  | {
      kind: "complete";
      context: Record<string, unknown>;
    };
