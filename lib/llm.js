// Works with any OpenAI-compatible API (NVIDIA Build, OpenAI, OpenRouter, Groq, Together...)
// or with Anthropic. Configure with environment variables only.
//
// NVIDIA Build (default):  LLM_API_KEY=nvapi-...
// Another provider:        LLM_API_KEY=...  LLM_BASE_URL=https://api.openai.com/v1  LLM_MODEL=gpt-4o-mini
// Anthropic:               ANTHROPIC_API_KEY=...  (used only if LLM_API_KEY is not set)

export async function claude({ system, user, max_tokens = 1500 }) {
  const key = process.env.LLM_API_KEY || process.env.NVIDIA_API_KEY;

  if (key) {
    const base = (process.env.LLM_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
    const model = process.env.LLM_MODEL || "meta/llama-3.3-70b-instruct";
    const r = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + key },
      body: JSON.stringify({
        model,
        max_tokens,
        temperature: 0.8,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!r.ok) throw new Error("LLM API error " + r.status);
    const d = await r.json();
    return d.choices?.[0]?.message?.content || "";
  }

  if (process.env.ANTHROPIC_API_KEY) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "claude-sonnet-5-5",
        max_tokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!r.ok) throw new Error("Anthropic API error " + r.status);
    const d = await r.json();
    return d.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  }

  throw new Error("No API key set. Add LLM_API_KEY in your environment variables.");
}

export function parseJSON(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON in model reply");
  try {
    return JSON.parse(m[0]);
  } catch {
    // Some models put raw line breaks inside strings; flatten them and retry.
    return JSON.parse(m[0].replace(/\r?\n/g, " "));
  }
}
