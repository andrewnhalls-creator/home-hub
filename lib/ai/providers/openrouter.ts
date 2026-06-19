import type { AssistantResult } from "@/lib/ai/action-schema";
import { parseAssistantResult } from "@/lib/ai/action-schema";

export async function callOpenRouter(
  systemPrompt: string,
  message: string,
  signal: AbortSignal,
): Promise<AssistantResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.1-8b-instruct";
  if (!apiKey) return null;

  const maxTokens = parseInt(process.env.AI_MAX_OUTPUT_TOKENS ?? "512", 10);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (process.env.OPENROUTER_SITE_URL) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }
  if (process.env.OPENROUTER_APP_NAME) {
    headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
  }

  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal,
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
        max_tokens: maxTokens,
        temperature: 0.2,
      }),
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) return null;

  return parseAssistantResult(text);
}
