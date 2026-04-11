/**
 * ShieldX AI Provider — Lightweight abstraction over Google Gemini, Anthropic Claude & OpenAI
 *
 * Uses direct fetch (zero dependencies). Supports:
 *   - Google Gemini (default — free tier, 15 RPM)
 *   - Anthropic Claude (optional paid upgrade)
 *   - OpenAI GPT-4o-mini (optional paid upgrade)
 *
 * Set env vars:
 *   GOOGLE_AI_API_KEY   → Gemini (free, preferred)
 *   ANTHROPIC_API_KEY   → Claude (paid fallback)
 *   OPENAI_API_KEY      → OpenAI (paid fallback)
 */

type Provider = "anthropic" | "gemini" | "openai";

interface AIResponse {
  text: string;
  provider: Provider;
  model: string;
  tokensUsed?: number;
}

function getProvider(): { provider: Provider; apiKey: string } {
  const geminiKey = process.env.GOOGLE_AI_API_KEY;
  if (geminiKey) return { provider: "gemini", apiKey: geminiKey };

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) return { provider: "anthropic", apiKey: anthropicKey };

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) return { provider: "openai", apiKey: openaiKey };

  throw new Error("No AI API key configured. Set GOOGLE_AI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY in your environment.");
}

async function callAnthropic(apiKey: string, systemPrompt: string, userPrompt: string, model = "claude-sonnet-4-20250514"): Promise<AIResponse> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Empty response from Claude");

  return {
    text,
    provider: "anthropic",
    model,
    tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
  };
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string, model = "gemini-2.0-flash"): Promise<AIResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        topP: 0.8,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  return {
    text,
    provider: "gemini",
    model,
    tokensUsed: data.usageMetadata?.totalTokenCount,
  };
}

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string, model = "gpt-4o-mini"): Promise<AIResponse> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenAI");

  return {
    text,
    provider: "openai",
    model,
    tokensUsed: data.usage?.total_tokens,
  };
}

export async function generateAIText(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
  const { provider, apiKey } = getProvider();

  if (provider === "anthropic") {
    return callAnthropic(apiKey, systemPrompt, userPrompt);
  }

  if (provider === "gemini") {
    return callGemini(apiKey, systemPrompt, userPrompt);
  }

  return callOpenAI(apiKey, systemPrompt, userPrompt);
}

export function isAIConfigured(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.OPENAI_API_KEY);
}
