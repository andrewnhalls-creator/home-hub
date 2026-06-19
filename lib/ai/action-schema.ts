import { z } from "zod";

export const ALLOWED_ACTIONS = [
  "add_shopping_item",
  "update_shopping_item",
  "remove_shopping_item",
  "add_task",
  "update_task",
  "complete_task",
  "add_reminder",
  "update_reminder",
  "clarify",
] as const;

export type AllowedAction = (typeof ALLOWED_ACTIONS)[number];

export const AssistantResultSchema = z.object({
  action: z.enum([
    "add_shopping_item",
    "update_shopping_item",
    "remove_shopping_item",
    "add_task",
    "update_task",
    "complete_task",
    "add_reminder",
    "update_reminder",
    "clarify",
  ]),
  payload: z.object({}).catchall(z.unknown()),
  requiresConfirmation: z.boolean(),
  confidence: z.number().min(0).max(1),
  clarifyingQuestion: z.string().nullable(),
});

export type AssistantResult = z.infer<typeof AssistantResultSchema>;

const DESTRUCTIVE_ACTIONS: AllowedAction[] = ["remove_shopping_item"];

// Pronouns that indicate the model invented a placeholder rather than clarifying
const AMBIGUOUS_PRONOUNS = new Set(["it", "this", "that", "them", "those", "these", "eso", "esto", "ello"]);

function isBulkOperation(result: AssistantResult): boolean {
  const item = result.payload.item;
  if (typeof item !== "string") return false;
  const lower = item.toLowerCase();
  return lower.includes("todo") || lower.includes("all") || lower.includes("todos");
}

function hasAmbiguousPayload(result: AssistantResult): boolean {
  for (const key of ["item", "title"]) {
    const val = result.payload[key];
    if (typeof val === "string" && AMBIGUOUS_PRONOUNS.has(val.toLowerCase().trim())) {
      return true;
    }
  }
  return false;
}

export function enforceBusinessRules(result: AssistantResult): AssistantResult {
  if (DESTRUCTIVE_ACTIONS.includes(result.action as AllowedAction) || isBulkOperation(result)) {
    return { ...result, requiresConfirmation: true };
  }

  // If the model filled in a pronoun instead of asking for clarification, override to clarify
  if (hasAmbiguousPayload(result)) {
    return {
      action: "clarify",
      payload: {},
      requiresConfirmation: false,
      confidence: 0.1,
      clarifyingQuestion: "¿A qué te refieres exactamente? Por favor, sé más específico.",
    };
  }

  return result;
}

export function parseAssistantResult(raw: string): AssistantResult | null {
  let text = raw.trim();

  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  const result = AssistantResultSchema.safeParse(parsed);
  if (!result.success) return null;

  return enforceBusinessRules(result.data);
}
