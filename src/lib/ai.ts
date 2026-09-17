/** Groq. Free tier needs no credit card and gates only on rate limits
 *  (30 req/min), which a personal app never approaches. Every call is
 *  best-effort: if the key is missing or the API is rate limited, the
 *  caller falls back rather than surfacing an error. */
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function groq(
  system: string,
  user: string,
  maxTokens = 600
): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" ? text.trim() : null;
  } catch {
    return null;
  }
}

export const POLISH_SYSTEM =
  "You tidy up short personal notes. Fix spelling, grammar and clarity. " +
  "Keep the author's own voice, meaning and level of detail - never add " +
  "ideas they didn't write, never add encouragement or commentary, never " +
  "make it longer than it needs to be. Reply with the corrected text only, " +
  "no preamble, no quotes.";

export const PATTERN_SYSTEM =
  "You analyse a person's own notes about a habit they are trying to keep. " +
  "Identify concrete, observable patterns in when and why they slip - times " +
  "of day, days of week, recurring triggers or moods they themselves " +
  "mention. Be specific and factual, grounded only in what they wrote. " +
  "Three short bullet points maximum, plain text, no markdown headers. " +
  "If there is genuinely not enough information, say so plainly in one " +
  "sentence instead of guessing. You are not a therapist: describe " +
  "patterns, do not diagnose, and do not give medical or clinical advice.";
