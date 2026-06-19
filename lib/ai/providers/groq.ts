import type { AssistantResult } from "@/lib/ai/action-schema";
import { parseAssistantResult } from "@/lib/ai/action-schema";

export async function callGroq(
  systemPrompt: string,
  message: string,
  signal: AbortSignal,
): Promise<AssistantResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
  if (!apiKey) return null;

  const maxTokens = parseInt(process.env.AI_MAX_OUTPUT_TOKENS ?? "512", 10);

  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
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
