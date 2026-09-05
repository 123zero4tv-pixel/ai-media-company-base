const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

function getConfig() {
  return {
    baseUrl: (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || '',
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 60000)
  };
}

function isConfigured() {
  const config = getConfig();
  return Boolean(config.apiKey && config.model);
}

function extractJson(text) {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }
  throw new Error('LLM returned non-JSON output');
}

async function generateAgentOutput({ role, instruction, input, schema }) {
  const config = getConfig();
  if (!isConfigured()) return { configured: false, output: null };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: `You are the ${role} AI employee in an AI Media Company. ${instruction} Return ONLY valid JSON matching the requested structure. Preserve the evidence taxonomy and never invent sources.` },
          { role: 'user', content: JSON.stringify({ task_input: input || {}, output_structure: schema }) }
        ]
      }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`LLM HTTP ${response.status}: ${await response.text()}`);
    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content;
    if (!text) throw new Error('LLM response contained no message content');
    return { configured: true, output: extractJson(text), model: config.model };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { getConfig, isConfigured, generateAgentOutput };