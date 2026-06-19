import type { AssistantResult } from "@/lib/ai/action-schema";
import { ALLOWED_ACTIONS } from "@/lib/ai/action-schema";
import { callGroq } from "@/lib/ai/providers/groq";
import { callCloudflare } from "@/lib/ai/providers/cloudflare";
import { callOpenRouter } from "@/lib/ai/providers/openrouter";
import { callGemini } from "@/lib/ai/providers/gemini";

const DEFAULT_PROVIDER_ORDER = "groq,cloudflare,openrouter,gemini";

export function buildSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `You are the Home Hub command parser. Convert the user request into exactly one allowed JSON action.

Today's date: ${today}

LANGUAGE: Write any text values (e.g. clarifyingQuestion) in Spanish (Spain). Keep JSON property names in English.

ALLOWED ACTIONS:
${ALLOWED_ACTIONS.map((a) => `- ${a}`).join("\n")}

ACTION PAYLOAD SHAPES:
- add_shopping_item: { "item": string, "quantity": number|null, "notes": string|null }
- update_shopping_item: { "item": string, "updates": { "quantity"?: number, "notes"?: string } }
- remove_shopping_item: { "item": string }
- add_task: { "title": string, "description": string|null, "frequency": string|null, "next_due_date": string|null }
- update_task: { "title": string, "updates": object }
- complete_task: { "title": string }
- add_reminder: { "title": string, "due_at": string|null }
- update_reminder: { "title": string, "updates": object }
- clarify: {}

RULES:
1. Output valid JSON only. No markdown. No code fences. No explanations.
2. Use action "clarify" if the request is missing required information or is ambiguous.
3. Set requiresConfirmation: true for remove_shopping_item or any bulk or destructive action.
4. Set confidence between 0.0 and 1.0. Use "clarify" if confidence would be below 0.5.
5. Set clarifyingQuestion in Spanish (Spain) if action is "clarify", otherwise null.
6. Never invent data that is not present in the user request.
7. For due_at and next_due_date use ISO 8601 format (e.g. "2026-06-20T10:00:00").
8. If the user uses a pronoun (it, this, that, them, those, eso, esto) without a clear referent, use "clarify" and ask what they mean. Never use a pronoun as the value of "item" or "title".

OUTPUT FORMAT (exactly this JSON shape, nothing else):
{"action":"...","payload":{},"requiresConfirmation":false,"confidence":0.95,"clarifyingQuestion":null}`;
}

type ProviderFn = (
  systemPrompt: string,
  message: string,
  signal: AbortSignal,
) => Promise<AssistantResult | null>;

const PROVIDERS: Record<string, ProviderFn> = {
  groq: callGroq,
  cloudflare: callCloudflare,
  openrouter: callOpenRouter,
  gemini: callGemini,
};

export interface RouterResult {
  provider: string;
  result: AssistantResult;
}

export async function routeToProvider(message: string): Promise<RouterResult | null> {
  const order = (process.env.AI_PROVIDER_ORDER ?? DEFAULT_PROVIDER_ORDER)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS ?? "10000", 10);
  const systemPrompt = buildSystemPrompt();

  for (const provider of order) {
    const fn = PROVIDERS[provider];
    if (!fn) continue;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await fn(systemPrompt, message, controller.signal);
      if (result) {
        clearTimeout(timer);
        return { provider, result };
      }
    } catch {
      // Provider failed; try next
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}
