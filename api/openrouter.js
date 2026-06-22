// PLAATSING: leg dit bestand neer als  api/openrouter.js  in de ROOT van je project
// (naast je src/ map — NIET erin). Vercel detecteert /api automatisch als serverless functions.
//
// ENV VARS instellen in Vercel → Settings → Environment Variables:
//   OPENROUTER_API_KEY  = jouw OpenRouter key  (zonder "VITE_" prefix!)
//   ALLOWED_ORIGIN       = https://career-assistent.vercel.app
//
// Verwijder daarna de VITE_OPENROUTER_API_KEY overal — die is niet meer nodig.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Alleen POST requests toegestaan." });
  }

  // Basisbeveiliging: alleen requests van je eigen domein worden doorgelaten.
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  if (allowedOrigin) {
    const origin = req.headers.origin || req.headers.referer || "";
    if (!origin.includes(allowedOrigin)) {
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server mist OPENROUTER_API_KEY env var." });
  }

  const { messages, maxTokens, jsonMode } = req.body || {};
  if (!messages) {
    return res.status(400).json({ error: "messages ontbreekt in request body." });
  }

  const body = {
    model: "meta-llama/llama-3.3-70b-instruct:free",
    messages,
    max_tokens: maxTokens || 1000,
    temperature: 0.7,
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": allowedOrigin || "https://career-assistent.vercel.app",
        "X-Title": "Career Assistant App",
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error?.message || "OpenRouter fout." });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Onbekende serverfout." });
  }
}
