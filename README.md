# Rhetoric Trainer

Endless rhetoric practice. Each round gives you a fresh passage and one question
(thesis, tone, diction, methods of proof, rhetorical devices, appeals,
methods of development, or structure and the rhetorical triangle).
Your answer is marked out of 10, and difficulty rises as you improve.

## Deploy on Vercel

1. Put this folder in a GitHub repo (or run `npx vercel` inside it).
2. Get a free key at https://build.nvidia.com (it starts with `nvapi-`).
3. In Vercel: Project Settings > Environment Variables, add `LLM_API_KEY` with that key.
4. Redeploy. Done.

### Using a different provider
Any OpenAI-compatible API works. Set `LLM_API_KEY`, `LLM_BASE_URL` and `LLM_MODEL`
(examples are in `.env.example`). To use Anthropic instead, set only `ANTHROPIC_API_KEY`.

The API key stays on the server (in `api/`). It is never sent to the browser.

If the API is unreachable (no key, offline), the game falls back to a built-in
set of passages and lets you self-mark against the answer key.

## Files

- `index.html` the game
- `api/generate.js` creates a new passage, question, and key
- `api/grade.js` marks your answer
- `lib/llm.js` provider helper (NVIDIA, OpenAI-compatible, or Anthropic)
