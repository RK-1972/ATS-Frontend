import type { ConversationDefinition } from "./types";

const definitionsById = new Map<string, ConversationDefinition>();
const definitionsByIntent = new Map<string, ConversationDefinition>();

/**
 * Registry for Conversation Definitions.
 * Future workflows plug in by calling registerConversationDefinition().
 */
export function registerConversationDefinition(
  definition: ConversationDefinition
): void {
  if (!definition?.id || !definition?.intent) {
    throw new Error("ConversationDefinition requires id and intent.");
  }

  if (!Array.isArray(definition.fields) || definition.fields.length === 0) {
    throw new Error("ConversationDefinition requires at least one field.");
  }

  definitionsById.set(definition.id, definition);
  definitionsByIntent.set(definition.intent, definition);
}

export function getConversationDefinitionById(
  id: string
): ConversationDefinition | null {
  return definitionsById.get(id) || null;
}

export function getConversationDefinitionByIntent(
  intent: string
): ConversationDefinition | null {
  return definitionsByIntent.get(intent) || null;
}

export function listConversationDefinitions(): ConversationDefinition[] {
  return Array.from(definitionsById.values());
}
