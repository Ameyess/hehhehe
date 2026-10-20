import { claude, parseJSON } from "../lib/llm.js";

const QUESTIONS = {
  thesis: "Identify the thesis statement. Is it explicit or implicit? Explain how you know.",
  tone: "Identify the tone of this passage using three different words. Support each word with evidence from the text.",
  diction: "Identify the diction used to create a specific mood or voice. Is the voice formal or informal? Cite at least three words or phrases.",
  proof: "Identify at least three different methods of proof used in this passage. Quote or point to each one.",
  devices: "Identify at least three different rhetorical devices used in this passage. Quote each one and explain its effect.",
  appeals: "Identify the rhetorical appeals (ethos, pathos, logos) at work. Which one dominates? Give evidence for each you name.",
  development: "Identify the methods of development used in this passage (for example: definition, comparison/contrast, cause and effect, exemplification, narration, process, problem-solution, classification). Give evidence for each.",
  structure: "Consider how the passage is structured and how balanced the parts of the rhetorical triangle (speaker, audience, message) are. Which part is emphasized, and which is neglected?",
};

const LEVELS = {
  1: "Clear and direct. Devices and appeals are easy to spot. Grade 10 reading level.",
  2: "Moderately subtle. Two or three techniques are layered together. Grade 11 level.",
  3: "Grade 12 level. Mixed techniques, some irony or understatement, thesis may be partly implied.",
  4: "First-year university level. Dense, layered, abstract vocabulary. Thesis often implicit. Tone may shift mid-passage.",
  5: "Advanced. Subtle, sophisticated, with competing tones and techniques that overlap. Thesis implicit or complicated by qualification.",
};

const GENRES = [
  "a speech to a city council", "a graduation address", "a personal essay", "an op-ed",
  "a eulogy", "a political speech", "a magazine column", "a memoir excerpt",
  "a commencement speech", "a letter to the editor", "a TED-style talk", "a closing argument",
];
const TOPICS = [
  "public transit", "memory and aging", "the value of failure", "social media and attention",
  "a family recipe", "immigration and belonging", "climate and local weather", "sports and character",
  "a small town's last shop", "the ethics of technology", "learning a second language", "volunteering",
  "money and work", "night shifts", "libraries", "gardens", "an inherited object", "silence",
  "ambition", "moving away from home",
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    let { skill = "mixed", level = 1 } = req.body || {};
    level = Math.min(5, Math.max(1, parseInt(level) || 1));
    if (skill === "mixed" || !QUESTIONS[skill]) skill = pick(Object.keys(QUESTIONS));

    const system =
      "You write exam material for a high-school and first-year university English course on rhetoric. " +
      "Reply with JSON only, no markdown fences.";
    const user = `Write one original exam passage and answer key.

Skill being tested: ${skill}
Question the student will answer: "${QUESTIONS[skill]}"
Genre: ${pick(GENRES)}
Topic: ${pick(TOPICS)}
Difficulty ${level}/5: ${LEVELS[level]}

Rules:
- 110 to 230 words. Entirely original. Do not quote or closely imitate any famous text.
- No title, no author, no label that gives away the techniques. The passage must read like a real excerpt and must not be tailored to make the answer obvious.
- Make sure the passage genuinely contains what the question asks about, with at least 4 clearly identifiable items (devices, proofs, development methods, etc. as relevant).
- The key must be specific: quote the exact words from the passage for each correct answer.

JSON shape:
{"passage": "...", "key": "a model answer in 80-160 words, quoting the passage"}`;

    const out = parseJSON(await claude({ system, user, max_tokens: 1400 }));
    res.status(200).json({ skill, level, passage: out.passage, question: QUESTIONS[skill], key: out.key });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
