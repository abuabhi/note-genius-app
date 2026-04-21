import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FRONT_MAX = 120;
const BACK_MAX = 300;

interface RawCard { front?: string; back?: string }

function cleanCards(raw: RawCard[], requested: number) {
  const dropped: string[] = [];
  const seenFronts = new Set<string>();
  const out: { front: string; back: string }[] = [];
  for (const c of raw || []) {
    let front = (c.front || '').trim();
    let back = (c.back || '').trim();
    if (!front || !back) { dropped.push('empty'); continue; }
    if (front.length > FRONT_MAX) front = front.slice(0, FRONT_MAX).trim();
    if (back.length > BACK_MAX) back = back.slice(0, BACK_MAX).trim();
    if (front.toLowerCase() === back.toLowerCase()) { dropped.push('identical_front_back'); continue; }
    const key = front.toLowerCase();
    if (seenFronts.has(key)) { dropped.push('duplicate_front'); continue; }
    seenFronts.add(key);
    out.push({ front, back });
    if (out.length >= requested) break;
  }
  return { cards: out, dropped };
}

async function callGateway(noteContent: string, count: number, subject: string | undefined, strict = false) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY missing');

  const systemPrompt = `You are an expert study coach. Create concise, atomic flashcards.
Rules:
- Each "front" is a single clear question (≤${FRONT_MAX} chars).
- Each "back" is a focused, factual answer (≤${BACK_MAX} chars).
- No filler, no "According to the text…", no duplicate questions.
- Front and back must NOT be identical.
- Prefer high-yield concepts a student should remember.${strict ? '\n- Be especially strict on length and uniqueness.' : ''}`;

  const userPrompt = `Generate exactly ${count} flashcards from this ${subject ? subject + ' ' : ''}material:\n\n${noteContent}`;

  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'emit_flashcards',
          description: 'Return validated flashcards.',
          parameters: {
            type: 'object',
            properties: {
              flashcards: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    front: { type: 'string', description: `≤${FRONT_MAX} chars question` },
                    back: { type: 'string', description: `≤${BACK_MAX} chars answer` },
                  },
                  required: ['front', 'back'],
                  additionalProperties: false,
                },
              },
            },
            required: ['flashcards'],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: 'function', function: { name: 'emit_flashcards' } },
    }),
  });

  if (resp.status === 429) throw Object.assign(new Error('Rate limited. Please try again shortly.'), { status: 429 });
  if (resp.status === 402) throw Object.assign(new Error('AI credits exhausted. Add funds in Workspace settings.'), { status: 402 });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI gateway error ${resp.status}: ${t.slice(0, 200)}`);
  }

  const data = await resp.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) throw new Error('AI returned no tool call');
  const parsed = JSON.parse(toolCall.function.arguments);
  return Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { noteContent, count = 5, subject } = await req.json();
    if (!noteContent || typeof noteContent !== 'string' || noteContent.trim().length < 20) {
      return new Response(JSON.stringify({ error: 'noteContent is required (min 20 chars)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const requested = Math.max(1, Math.min(20, Number(count) || 5));

    let raw = await callGateway(noteContent, requested, subject, false);
    let { cards, dropped } = cleanCards(raw, requested);

    // Retry once with stricter prompt if short
    if (cards.length < requested) {
      try {
        const raw2 = await callGateway(noteContent, requested - cards.length, subject, true);
        const seen = new Set(cards.map(c => c.front.toLowerCase()));
        for (const c of raw2) {
          const front = (c.front || '').trim();
          if (front && !seen.has(front.toLowerCase())) {
            const merged = cleanCards([c], 1);
            if (merged.cards.length) { cards.push(merged.cards[0]); seen.add(front.toLowerCase()); }
            else dropped.push(...merged.dropped);
          }
          if (cards.length >= requested) break;
        }
      } catch (e) {
        console.warn('Retry failed:', e instanceof Error ? e.message : e);
      }
    }

    if (cards.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid flashcards could be generated. Try a longer or clearer note.' }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      flashcards: cards,
      requested,
      returned: cards.length,
      dropped: dropped.length,
      partial: cards.length < requested,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('generate-flashcards error:', error);
    const status = error?.status === 429 || error?.status === 402 ? error.status : 500;
    return new Response(JSON.stringify({ error: error?.message || 'Internal server error' }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
