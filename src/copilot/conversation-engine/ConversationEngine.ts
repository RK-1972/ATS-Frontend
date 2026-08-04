import {
  getConversationDefinitionById,
  getConversationDefinitionByIntent
} from "./ConversationRegistry";
import type {
  ConversationDefinition,
  ConversationFieldDefinition,
  ConversationPrompt,
  ConversationSession
} from "./types";

function createSessionId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isValuePresent(value: unknown): boolean {
  if (value == null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "object") {
    const record = value as { id?: unknown; value?: unknown };
    if (record.id != null && String(record.id).trim() !== "") {
      return true;
    }
    if (record.value != null && String(record.value).trim() !== "") {
      return true;
    }
  }

  return true;
}

function buildPendingKeys(
  definition: ConversationDefinition,
  collected: Record<string, unknown>
): string[] {
  return definition.fields
    .filter((field) => field.required !== false)
    .filter((field) => !isValuePresent(collected[field.key]))
    .map((field) => field.key);
}

function getField(
  definition: ConversationDefinition,
  key: string | null
): ConversationFieldDefinition | null {
  if (!key) {
    return null;
  }

  return definition.fields.find((field) => field.key === key) || null;
}

function fieldKeys(definition: ConversationDefinition): string[] {
  return definition.fields.map((field) => field.key);
}

function fieldIndex(
  definition: ConversationDefinition,
  key: string | null
): number {
  if (!key) {
    return -1;
  }

  return fieldKeys(definition).indexOf(key);
}

/**
 * After answering a field, advance to the next missing required field after it.
 * Already-answered later fields are skipped (not re-asked).
 */
function nextFieldAfterAnswer(
  definition: ConversationDefinition,
  collected: Record<string, unknown>,
  answeredKey: string
): string | null {
  const pending = new Set(buildPendingKeys(definition, collected));
  const keys = fieldKeys(definition);
  const answeredIdx = keys.indexOf(answeredKey);

  for (let i = answeredIdx + 1; i < keys.length; i += 1) {
    if (pending.has(keys[i])) {
      return keys[i];
    }
  }

  // No later gaps — if anything earlier is somehow missing, surface it.
  return buildPendingKeys(definition, collected)[0] || null;
}

/**
 * Generic Conversation Engine.
 *
 * Owns session lifecycle and question sequencing from a Conversation Definition.
 * Does not navigate, call ATS APIs, or execute workflows.
 */
export function createConversationEngine() {
  let session: ConversationSession | null = null;

  function getDefinition(): ConversationDefinition | null {
    if (!session) {
      return null;
    }

    return getConversationDefinitionById(session.definitionId);
  }

  function syncSessionFromCollected(
    definition: ConversationDefinition,
    collected: Record<string, unknown>,
    introShown: boolean
  ): ConversationSession {
    const pendingFieldKeys = buildPendingKeys(definition, collected);
    const currentFieldKey = pendingFieldKeys[0] || null;
    const status = currentFieldKey ? "active" : "complete";

    return {
      sessionId: session?.sessionId || createSessionId(),
      definitionId: definition.id,
      intent: definition.intent,
      collected: { ...collected },
      pendingFieldKeys,
      currentFieldKey,
      status,
      introShown
    };
  }

  function canGoBackFromSession(
    definition: ConversationDefinition,
    currentFieldKey: string | null
  ): boolean {
    return fieldIndex(definition, currentFieldKey) > 0;
  }

  function start(input: {
    intent?: string;
    definitionId?: string;
    seed?: Record<string, unknown>;
  }): ConversationPrompt | null {
    const definition = input.definitionId
      ? getConversationDefinitionById(input.definitionId)
      : input.intent
        ? getConversationDefinitionByIntent(input.intent)
        : null;

    if (!definition) {
      return null;
    }

    const collected = { ...(input.seed || {}) };
    session = syncSessionFromCollected(definition, collected, false);

    if (definition.introMessage && session.status === "active") {
      return {
        kind: "intro",
        message: definition.introMessage
      };
    }

    return getPrompt();
  }

  function acknowledgeIntro(): ConversationPrompt | null {
    if (!session) {
      return null;
    }

    const definition = getDefinition();
    if (!definition) {
      return null;
    }

    session = {
      ...session,
      introShown: true
    };

    return getPrompt();
  }

  function getPrompt(): ConversationPrompt | null {
    if (!session) {
      return null;
    }

    const definition = getDefinition();
    if (!definition) {
      return null;
    }

    if (
      definition.introMessage &&
      !session.introShown &&
      session.status === "active"
    ) {
      return {
        kind: "intro",
        message: definition.introMessage
      };
    }

    if (session.status === "complete") {
      return {
        kind: "complete",
        context: { ...session.collected }
      };
    }

    const field = getField(definition, session.currentFieldKey);
    if (!field) {
      return {
        kind: "complete",
        context: { ...session.collected }
      };
    }

    const currentValue = session.collected[field.key];

    return {
      kind: "question",
      fieldKey: field.key,
      question: field.question,
      inputType: field.inputType,
      currentValue: isValuePresent(currentValue) ? currentValue : undefined,
      canGoBack: canGoBackFromSession(definition, session.currentFieldKey)
    };
  }

  function answer(fieldKey: string, value: unknown): ConversationPrompt | null {
    if (!session || session.status !== "active") {
      return null;
    }

    if (session.currentFieldKey && fieldKey !== session.currentFieldKey) {
      return getPrompt();
    }

    const definition = getDefinition();
    if (!definition) {
      return null;
    }

    const collected = {
      ...session.collected,
      [fieldKey]: value
    };

    const pendingFieldKeys = buildPendingKeys(definition, collected);
    const currentFieldKey = nextFieldAfterAnswer(
      definition,
      collected,
      fieldKey
    );
    const status = currentFieldKey ? "active" : "complete";

    session = {
      sessionId: session.sessionId,
      definitionId: definition.id,
      intent: definition.intent,
      collected,
      pendingFieldKeys,
      currentFieldKey,
      status,
      introShown: true
    };

    return getPrompt();
  }

  /**
   * Move the active step pointer one field backward.
   * Collected answers are preserved so controls can stay pre-populated.
   *
   * From a completed session (e.g. Review Card), returns to the last field
   * without restarting or clearing collected state.
   */
  function back(): ConversationPrompt | null {
    if (!session) {
      return null;
    }

    const definition = getDefinition();
    if (!definition) {
      return null;
    }

    const keys = fieldKeys(definition);
    if (keys.length === 0) {
      return null;
    }

    if (session.status === "complete") {
      const previousKey = keys[keys.length - 1];
      session = {
        ...session,
        currentFieldKey: previousKey,
        pendingFieldKeys: buildPendingKeys(definition, session.collected),
        status: "active"
      };
      return getPrompt();
    }

    if (session.status !== "active") {
      return null;
    }

    const idx = fieldIndex(definition, session.currentFieldKey);
    if (idx <= 0) {
      return getPrompt();
    }

    const previousKey = keys[idx - 1];

    session = {
      ...session,
      currentFieldKey: previousKey,
      pendingFieldKeys: buildPendingKeys(definition, session.collected),
      status: "active"
    };

    return getPrompt();
  }

  function canGoBack(): boolean {
    if (!session) {
      return false;
    }

    const definition = getDefinition();
    if (!definition) {
      return false;
    }

    if (session.status === "complete") {
      return fieldKeys(definition).length > 0;
    }

    if (session.status !== "active") {
      return false;
    }

    return canGoBackFromSession(definition, session.currentFieldKey);
  }

  function cancel(): void {
    if (session) {
      session = {
        ...session,
        status: "cancelled",
        currentFieldKey: null,
        pendingFieldKeys: []
      };
    }
  }

  function reset(): void {
    session = null;
  }

  function getSession(): ConversationSession | null {
    return session ? { ...session, collected: { ...session.collected } } : null;
  }

  return {
    start,
    acknowledgeIntro,
    getPrompt,
    answer,
    back,
    canGoBack,
    cancel,
    reset,
    getSession
  };
}

export type ConversationEngine = ReturnType<typeof createConversationEngine>;
