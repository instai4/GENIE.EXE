// api/gemini.js
// Multi-provider fallback: Grok (xAI) → Groq → Gemini
// Drop this file at /api/gemini.js in your Vercel project.
// Required env vars (add in Vercel dashboard):
//   XAI_API_KEY     — xAI / Grok   (https://console.x.ai)
//   GROQ_API_KEY    — Groq          (https://console.groq.com)
//   GEMINI_API_KEY  — Google Gemini (https://aistudio.google.com/app/apikey)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { systemPrompt, messages, forceGuess } = req.body;

    if (!systemPrompt || !messages) {
      return res.status(400).json({ error: 'Missing systemPrompt or messages.' });
    }

    // ── Build OpenAI-compatible messages (used by Grok + Groq) ──
    const openAiMessages = [
      { role: 'system', content: systemPrompt },
      // messages here are Gemini-format {role, parts:[{text}]}
      // convert them to OpenAI format
      ...messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: Array.isArray(m.parts) ? m.parts.map(p => p.text).join('') : m.content || ''
      }))
    ];

    const temperature = forceGuess ? 0.3 : 0.7;

    // ────────────────────────────────────────────────────────────
    // TIER 1 — GROK (xAI)
    // ────────────────────────────────────────────────────────────
    const XKEY = process.env.XAI_API_KEY;
    if (XKEY) {
      try {
        const r = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${XKEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'grok-3-mini',
            messages: openAiMessages,
            max_tokens: 300,
            temperature,
            response_format: { type: 'json_object' }
          })
        });

        const d = await r.json();
        if (!r.ok) {
          console.log(`[Genie] Grok failed: ${r.status}`, d?.error?.message);
        } else {
          const text = d?.choices?.[0]?.message?.content;
          if (text) {
            const parsed = safeParseJSON(text);
            if (parsed) return res.status(200).json(parsed);
          }
        }
      } catch (e) {
        console.log('[Genie] Grok error:', e.message);
      }
    }

    // ────────────────────────────────────────────────────────────
    // TIER 2 — GROQ (free, fast)
    // ────────────────────────────────────────────────────────────
    const GQKEY = process.env.GROQ_API_KEY;
    if (GQKEY) {
      const groqModels = [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'mixtral-8x7b-32768',
      ];

      for (const model of groqModels) {
        try {
          const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GQKEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: openAiMessages,
              max_tokens: 300,
              temperature,
              response_format: { type: 'json_object' }
            })
          });

          const d = await r.json();
          if (!r.ok) {
            console.log(`[Genie] Groq ${model} failed: ${r.status}`, d?.error?.message);
            continue;
          }

          const text = d?.choices?.[0]?.message?.content;
          if (text) {
            const parsed = safeParseJSON(text);
            if (parsed) return res.status(200).json(parsed);
          }
        } catch (e) {
          console.log(`[Genie] Groq ${model} error:`, e.message);
        }
      }
    }

    // ────────────────────────────────────────────────────────────
    // TIER 3 — GEMINI (Google, free fallback)
    // ────────────────────────────────────────────────────────────
    const GKEY = process.env.GEMINI_API_KEY;
    if (GKEY) {
      const geminiModels = [
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash-8b',
        'gemini-2.5-flash',
      ];

      for (const model of geminiModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GKEY}`;
          const body = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: messages, // already in Gemini format
            generationConfig: {
              temperature,
              maxOutputTokens: 300,
              responseMimeType: 'application/json'
            }
          };

          const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          const d = await r.json();
          if (!r.ok) {
            console.log(`[Genie] Gemini ${model} failed: ${r.status}`, d?.error?.message);
            continue;
          }

          const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = safeParseJSON(text);
            if (parsed) return res.status(200).json(parsed);
          }
        } catch (e) {
          console.log(`[Genie] Gemini ${model} error:`, e.message);
        }
      }
    }

    // All providers exhausted
    return res.status(500).json({ error: 'All AI providers failed. Check your API keys in Vercel env vars.' });

  } catch (e) {
    console.error('[Genie] Handler error:', e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}

// ── Safely parse JSON, stripping markdown fences if present ──
function safeParseJSON(text) {
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}