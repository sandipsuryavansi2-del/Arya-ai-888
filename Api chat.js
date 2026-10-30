// Vercel serverless function. Keep AI_API_KEY in Vercel Environment Variables only.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      endpoint: "/api/chat",
      configured: Boolean(process.env.AI_API_KEY),
      provider: process.env.AI_PROVIDER || "openai",
      note: "GET checks endpoint configuration only; POST sends a prompt to the configured AI provider."
    });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }
  if (!process.env.AI_API_KEY) {
    return res.status(503).json({
      error: "AI is not configured yet. In Vercel → Project Settings → Environment Variables, add AI_API_KEY, AI_PROVIDER and AI_MODEL, then redeploy."
    });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const message = String(body.message || "").trim();
    if (!message) return res.status(400).json({ error: "Please enter a message." });
    if (message.length > 12000) return res.status(413).json({ error: "Message is too long (maximum 12,000 characters)." });

    const provider = String(process.env.AI_PROVIDER || "openai").toLowerCase();
    const model = process.env.AI_MODEL || (provider === "openai" ? "gpt-4o-mini" : "llama-3.3-70b-versatile");
    let endpoint;
    if (provider === "groq") endpoint = "https://api.groq.com/openai/v1/chat/completions";
    else if (provider === "openai") endpoint = "https://api.openai.com/v1/chat/completions";
    else if (provider === "openrouter") endpoint = "https://openrouter.ai/api/v1/chat/completions";
    else return res.status(400).json({ error: "Unsupported AI_PROVIDER. Use groq, openai, or openrouter." });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are Aryan AI Cloud, a helpful, honest assistant. Explain clearly and never claim to have performed actions you did not perform." },
          { role: "user", content: message }
        ],
        temperature: 0.6
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error?.message || data?.message || `AI provider returned HTTP ${response.status}`;
      return res.status(response.status === 429 ? 429 : 502).json({ error: `AI provider error: ${detail}` });
    }
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) return res.status(502).json({ error: "The AI provider returned no text response." });
    return res.status(200).json({ reply, model });
  } catch (error) {
    return res.status(500).json({ error: "Server error while contacting AI provider. Check Vercel Function Logs." });
  }
}
