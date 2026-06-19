import type { AssistantResult } from "@/lib/ai/action-schema";
import { parseAssistantResult } from "@/lib/ai/action-schema";

export async function callGemini(
  systemPrompt: string,
  message: string,
  signal: AbortSignal,
): Promise<AssistantResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  if (!apiKey) return null;

  const maxTokens = parseInt(process.env.AI_MAX_OUTPUT_TOKENS ?? "512", 10);

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            {
              role: "model",
              parts: [
                {
                  text: '{"action":"clarify","payload":{},"requiresConfirmation":false,"confidence":1,"clarifyingQuestion":null}',
                },
              ],
            },
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: maxTokens,
          },
        }),
      },
    );
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) return null;

  return parseAssistantResult(text);
}
