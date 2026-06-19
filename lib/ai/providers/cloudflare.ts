import type { AssistantResult } from "@/lib/ai/action-schema";
import { parseAssistantResult } from "@/lib/ai/action-schema";

export async function callCloudflare(
  systemPrompt: string,
  message: string,
  signal: AbortSignal,
): Promise<AssistantResult | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const model = process.env.CLOUDFLARE_AI_MODEL ?? "@cf/meta/llama-3.1-8b-instruct";
  if (!accountId || !apiToken) return null;

  let res: Response;
  try {
    res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
        }),
      },
    );
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  const text: string = data?.result?.response ?? "";
  if (!text) return null;

  return parseAssistantResult(text);
}
