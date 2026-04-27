import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FRONT_MAX = 120;
const BACK_MAX = 300;
const CHUNK_TARGET = 1500;        // target chars per section
const CHUNK_HARD_MAX = 2000;      // split if larger
const CHUNK_MIN = 300;            // merge if smaller
const NOTE_HARD_CAP = 30000;      // total chars sent to model across all chunks

interface RawCard { front?: string; back?: string; section_index?: number }
interface CleanCard { front: string; back: string; section_index?: number }
interface Section { index: number; label: string; text: string; allocation: number }

// ---------- chunking ----------
function splitOnSentences(text: string, maxLen: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
  const out: string[] = [];
  let buf = '';
  for (const s of sentences) {
    if ((buf + ' ' + s).trim().length > maxLen && buf) {
      out.push(buf.trim());
      buf = s;
    } else {
      buf = buf ? buf + ' ' + s : s;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function chunkNote(content: string): { label: string; text: string }[] {
  const text = content.trim();
  if (!text) return [];

  // Split on markdown headings first; fall back to blank-line paragraphs.
  const headingRegex = /(^|\n)(#{1,6}\s+[^\n]+)/g;
  const parts: { label: string; text: string }[] = [];

  if (headingRegex.test(text)) {
    headingRegex.lastIndex = 0;
    const matches = [...text.matchAll(headingRegex)];
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const start = m.index! + (m[1] ? m[1].length : 0);
      const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
      const block = text.slice(start, end).trim();
      if (!block) continue;
      const firstNl = block.indexOf('\n');
      const label = (firstNl === -1 ? block : block.slice(0, firstNl)).replace(/^#+\s*/, '').slice(0, 80);
      const body = firstNl === -1 ? '' : block.slice(firstNl + 1).trim();
      parts.push({ label: label || `Section ${parts.length + 1}`, text: body || label });
    }
    // any pre-heading preface
    const firstHeadAt = matches[0].index! + (matches[0][1] ? matches[0][1].length : 0);
    const preface = text.slice(0, firstHeadAt).trim();
    if (preface) parts.unshift({ label: 'Intro', text: preface });
  } else {
    const paragraphs = text.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
    for (const p of paragraphs) {
      parts.push({ label: p.split(/\s+/).slice(0, 6).join(' ').slice(0, 60), text: p });
    }
  }

  // Split oversized parts on sentences.
  const split: { label: string; text: string }[] = [];
  for (const p of parts) {
    if (p.text.length <= CHUNK_HARD_MAX) {
      split.push(p);
    } else {
      const pieces = splitOnSentences(p.text, CHUNK_TARGET);
      pieces.forEach((pc, i) => split.push({ label: `${p.label} (${i + 1}/${pieces.length})`, text: pc }));
    }
  }

  // Merge tiny adjacent chunks.
  const merged: { label: string; text: string }[] = [];
  for (const p of split) {
    const last = merged[merged.length - 1];
    if (last && last.text.length < CHUNK_MIN && (last.text.length + p.text.length) <= CHUNK_TARGET) {
      last.text = last.text + '\n\n' + p.text;
      last.label = last.label + ' + ' + p.label;
    } else {
      merged.push({ ...p });
    }
  }

  return merged.length ? merged : [{ label: 'Note', text }];
}

// ---------- allocation ----------
function allocateCards(chunks: { label: string; text: string }[], requested: number): { sections: Section[]; partialCoverage: boolean } {
  const n = chunks.length;
  if (requested >= n) {
    // Proportional by length, floor 1 each.
    const total = chunks.reduce((s, c) => s + c.text.length, 0) || 1;
    const raw = chunks.map(c => Math.max(1, Math.floor((c.text.length / total) * requested)));
    let sum = raw.reduce((a, b) => a + b, 0);
    // Adjust to match requested exactly.
    let i = 0;
    while (sum < requested) { raw[i % n]++; sum++; i++; }
    while (sum > requested) {
      // Reduce from the largest allocation that is > 1.
      let idx = 0, max = 0;
      for (let k = 0; k < n; k++) if (raw[k] > 1 && raw[k] > max) { max = raw[k]; idx = k; }
      if (raw[idx] <= 1) break;
      raw[idx]--; sum--;
    }
    return {
      sections: chunks.map((c, k) => ({ index: k + 1, label: c.label, text: c.text, allocation: raw[k] })),
      partialCoverage: false,
    };
  }
  // Fewer cards than sections — sample evenly.
  const sections: Section[] = [];
  for (let k = 0; k < requested; k++) {
    const pick = Math.floor((k * n) / requested);
    sections.push({ index: sections.length + 1, label: chunks[pick].label, text: chunks[pick].text, allocation: 1 });
  }
  return { sections, partialCoverage: true };
}

// ---------- cleaning ----------
function cleanCards(raw: RawCard[], requested: number, existingFronts: Set<string> = new Set()) {
  const dropped: string[] = [];
  const out: CleanCard[] = [];
  for (const c of raw || []) {
    let front = (c.front || '').trim();
    let back = (c.back || '').trim();
    if (!front || !back) { dropped.push('empty'); continue; }
    if (front.length > FRONT_MAX) front = front.slice(0, FRONT_MAX).trim();
    if (back.length > BACK_MAX) back = back.slice(0, BACK_MAX).trim();
    if (front.toLowerCase() === back.toLowerCase()) { dropped.push('identical_front_back'); continue; }
    const key = front.toLowerCase();
    if (existingFronts.has(key)) { dropped.push('duplicate_front'); continue; }
    existingFronts.add(key);
    out.push({ front, back, section_index: typeof c.section_index === 'number' ? c.section_index : undefined });
    if (out.length >= requested) break;
  }
  return { cards: out, dropped };
}

// ---------- LLM call ----------
function buildSectionedPrompt(sections: Section[], subject?: string) {
  const totalCards = sections.reduce((s, x) => s + x.allocation, 0);
  const allocLines = sections.map(s => `- SECTION ${s.index}: ${s.allocation} card${s.allocation === 1 ? '' : 's'}`).join('\n');
  const body = sections.map(s => `SECTION ${s.index} — ${s.label}\n${s.text}`).join('\n\n---\n\n');
  return `Generate exactly ${totalCards} flashcards from this ${subject ? subject + ' ' : ''}material.

The material is divided into ${sections.length} sections. You MUST produce cards from EVERY section so the full note is covered:
${allocLines}

For each card, set "section_index" to the integer matching the SECTION it came from. Do not skip a section.

${body}`;
}

async function callGateway(opts: {
  sections: Section[];
  subject?: string;
  strict?: boolean;
}): Promise<RawCard[]> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY missing');

  const totalCards = opts.sections.reduce((s, x) => s + x.allocation, 0);
  const systemPrompt = `You are an expert study coach. Create concise, atomic flashcards.
Rules:
- Each "front" is a single clear question (≤${FRONT_MAX} chars).
- Each "back" is a focused, factual answer (≤${BACK_MAX} chars).
- Questions must read as professional exam prompts: precise, self-contained, and free of filler.
- NEVER reference the source document ("According to the text…", "In the note above…", etc.).
- NEVER insert ellipses ("...") inside a question or answer; finish complete sentences.
- Front and back must NOT be identical, and no two fronts may duplicate each other.
- Prefer high-yield concepts a student should remember.
- COVERAGE IS REQUIRED: produce the exact per-section quota; never omit a section.
- Always set "section_index" to the source section's number.${opts.strict ? '\n- Be especially strict on length, uniqueness, and per-section quotas.' : ''}`;

  const userPrompt = buildSectionedPrompt(opts.sections, opts.subject);

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
          description: `Return exactly ${totalCards} validated flashcards covering every section.`,
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
                    section_index: { type: 'integer', description: 'Source section number (1-based).' },
                  },
                  required: ['front', 'back', 'section_index'],
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

// ---------- main ----------
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { count = 5, subject, enrichedContent } = body;
    // Prefer the AI-enriched version of the note when supplied — it produces
    // higher-quality, more precise flashcards than raw user-entered content.
    const noteContent: string =
      typeof enrichedContent === 'string' && enrichedContent.trim().length >= 20
        ? enrichedContent
        : (body.noteContent ?? '');
    if (!noteContent || typeof noteContent !== 'string' || noteContent.trim().length < 20) {
      return new Response(JSON.stringify({ error: 'noteContent is required (min 20 chars)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const requested = Math.max(1, Math.min(20, Number(count) || 5));

    // 1. Chunk and allocate.
    let chunks = chunkNote(noteContent);

    // Hard cap total payload — truncate longest chunks first.
    let truncated = false;
    let total = chunks.reduce((s, c) => s + c.text.length, 0);
    if (total > NOTE_HARD_CAP) {
      truncated = true;
      const perChunk = Math.max(400, Math.floor(NOTE_HARD_CAP / chunks.length));
      chunks = chunks.map(c => c.text.length > perChunk ? { ...c, text: c.text.slice(0, perChunk) } : c);
    }

    const { sections, partialCoverage } = allocateCards(chunks, requested);

    // 2. Initial generation.
    const seenFronts = new Set<string>();
    let raw = await callGateway({ sections, subject, strict: false });
    let { cards, dropped } = cleanCards(raw, requested, seenFronts);

    // 3. Coverage check — top up missing sections.
    const coveredSet = new Set(cards.map(c => c.section_index).filter((x): x is number => typeof x === 'number'));
    const missing = sections.filter(s => !coveredSet.has(s.index));
    if (missing.length && cards.length < requested) {
      try {
        const topUpSections = missing.map(s => ({ ...s, allocation: Math.max(1, s.allocation) }));
        const raw2 = await callGateway({ sections: topUpSections, subject, strict: true });
        const need = requested - cards.length;
        const cleaned = cleanCards(raw2, need, seenFronts);
        cards.push(...cleaned.cards);
        dropped.push(...cleaned.dropped);
      } catch (e) {
        console.warn('Coverage top-up failed:', e instanceof Error ? e.message : e);
      }
    }

    // 4. Generic short-fall retry (legacy behaviour) if still under requested.
    if (cards.length < requested) {
      try {
        const need = requested - cards.length;
        // Re-allocate the shortfall across all sections evenly.
        const fillSections = sections.map(s => ({ ...s, allocation: 1 })).slice(0, need);
        const raw3 = await callGateway({ sections: fillSections, subject, strict: true });
        const cleaned = cleanCards(raw3, need, seenFronts);
        cards.push(...cleaned.cards);
        dropped.push(...cleaned.dropped);
      } catch (e) {
        console.warn('Final retry failed:', e instanceof Error ? e.message : e);
      }
    }

    if (cards.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid flashcards could be generated. Try a longer or clearer note.' }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sectionsCovered = new Set(cards.map(c => c.section_index).filter((x): x is number => typeof x === 'number')).size;

    // Drop section_index from response payload.
    const outCards = cards.map(({ front, back }) => ({ front, back }));

    return new Response(JSON.stringify({
      flashcards: outCards,
      requested,
      returned: outCards.length,
      dropped: dropped.length,
      partial: outCards.length < requested,
      coverage: { sections: sections.length, sectionsCovered },
      partial_coverage: partialCoverage || sectionsCovered < sections.length,
      truncated,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('generate-flashcards error:', error);
    const status = error?.status === 429 || error?.status === 402 ? error.status : 500;
    return new Response(JSON.stringify({ error: error?.message || 'Internal server error' }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
