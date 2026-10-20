import { claude, parseJSON } from "../lib/llm.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { passage, question, key, answer, level } = req.body || {};
    if (!passage || !question || !answer) return res.status(400).json({ error: "Missing fields" });

    const system =
      "You are a fair, exacting English teacher marking a rhetoric exam. Reply with JSON only, no markdown fences.";
    const user = `Passage:
${passage}

Question: ${question}

Reference key (the student's answer need not match it word for word; accept other valid, well-evidenced answers):
${key}

Student answer:
${answer}

Mark out of 10. Reward correct identification AND specific evidence quoted from the passage. Deduct for vague, unsupported, or wrong claims. Do not rewrite the student's answer.
JSON shape:
{"score": 0-10 integer, "feedback": "2-4 sentences: what was right, what was missing or wrong"}`;

    const out = parseJSON(await claude({ system, user, max_tokens: 600 }));
    res.status(200).json({ score: Math.min(10, Math.max(0, parseInt(out.score) || 0)), feedback: out.feedback });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
