
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface NoteInput {
  title?: string;
  body: string;
  isEnriched?: boolean;
}

interface QuizGenerationOptions {
  content?: string;
  enrichedContent?: string;
  usingEnrichedContent?: boolean;
  notes?: NoteInput[];
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
}

const CHUNK_TARGET = 5000;
const SINGLE_CALL_THRESHOLD = 6000;

function splitIntoChunks(text: string, target = CHUNK_TARGET): string[] {
  if (text.length <= SINGLE_CALL_THRESHOLD) return [text];
  // Split on paragraph boundaries first
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = '';
  for (const p of paragraphs) {
    if ((current + '\n\n' + p).length > target && current.length > 0) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? current + '\n\n' + p : p;
    }
  }
  if (current) chunks.push(current);
  // Fallback: any chunk still too large → hard split on sentences
  const final: string[] = [];
  for (const c of chunks) {
    if (c.length <= target * 1.4) {
      final.push(c);
    } else {
      const sentences = c.split(/(?<=[.!?])\s+/);
      let cur = '';
      for (const s of sentences) {
        if ((cur + ' ' + s).length > target && cur.length > 0) {
          final.push(cur);
          cur = s;
        } else {
          cur = cur ? cur + ' ' + s : s;
        }
      }
      if (cur) final.push(cur);
    }
  }
  return final;
}

function buildPrompt(content: string, n: number, difficulty: string, sectionInfo?: { i: number; total: number }): string {
  const sectionLine = sectionInfo
    ? `This is section ${sectionInfo.i} of ${sectionInfo.total} from a larger note. Focus ONLY on the content of this section.\n\n`
    : '';
  return `${sectionLine}Based on the following content, generate ${n} multiple-choice quiz questions at ${difficulty} difficulty level.

Content:
${content}

Please generate questions that:
1. Test understanding of key concepts from the content
2. Are at ${difficulty} difficulty level
3. Have 4 distinct, plausible answer options each
4. Include brief explanations for the correct answers
5. Are varied in question type (comprehension, application, analysis)

LENGTH LIMITS (strict):
- Each question ≤ 200 characters
- Each option ≤ 80 characters
- Each explanation ≤ 250 characters
- Options must NOT repeat the question text and must NOT all be identical.

IMPORTANT: Vary the position of the correct answer across questions. Distribute correct answers roughly evenly across indices 0, 1, 2, and 3 — do NOT default to index 0.

Format your response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["First option", "Second option", "Third option", "Fourth option"],
      "correctAnswer": 2,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure each question is clear, the correct answer index is accurate (0-3), and explanations are helpful but concise.`;
}

async function callOpenAI(prompt: string, apiKey: string): Promise<any[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. Generate high-quality multiple-choice quiz questions that test understanding and application of concepts. Questions must read as professional exam prompts: precise, self-contained, and free of filler. NEVER reference the source document ("According to the text…", "In the note above…", etc.). NEVER insert ellipses ("...") inside a question, option, or explanation — always write complete sentences. Always respond with valid JSON only. Ensure export-safe formatting.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const generatedContent = data.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(generatedContent);
  } catch {
    const m = generatedContent.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('OpenAI response was not valid JSON');
    parsed = JSON.parse(m[0]);
  }
  if (!parsed || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid response format from AI');
  }
  return parsed.questions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: QuizGenerationOptions = await req.json();
    const {
      numberOfQuestions: requestedQuestions = 5,
      difficulty = 'medium',
      topic,
      enrichedContent,
      usingEnrichedContent,
      notes,
    } = requestData;

    // Build a per-note structure so we can both report sources and chunk per note
    let workNotes: NoteInput[] = [];
    let usedSource = { enriched: 0, original: 0 };

    if (Array.isArray(notes) && notes.length > 0) {
      workNotes = notes
        .map(n => ({
          title: (n.title || '').toString(),
          body: (n.body || '').toString(),
          isEnriched: !!n.isEnriched,
        }))
        .filter(n => n.body.trim().length > 0);
      usedSource.enriched = workNotes.filter(n => n.isEnriched).length;
      usedSource.original = workNotes.length - usedSource.enriched;
    } else {
      // Backward-compatible single-content path
      const content =
        typeof enrichedContent === 'string' && enrichedContent.trim().length >= 20
          ? enrichedContent
          : requestData.content;
      if (!content) throw new Error("Content is required for quiz generation");
      workNotes = [{ title: topic || '', body: content, isEnriched: !!enrichedContent || !!usingEnrichedContent }];
      if (workNotes[0].isEnriched) usedSource.enriched = 1;
      else usedSource.original = 1;
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error("OpenAI API key not configured");

    // Chunk every note independently to guarantee full coverage
    type Chunk = { text: string; weight: number };
    const allChunks: Chunk[] = [];
    for (const n of workNotes) {
      const body = n.title ? `${n.title}\n\n${n.body}` : n.body;
      const pieces = splitIntoChunks(body);
      for (const p of pieces) allChunks.push({ text: p, weight: p.length });
    }

    // Auto-bump count so every chunk gets at least 1 question (coverage guarantee)
    const effectiveCount = Math.max(requestedQuestions, allChunks.length);

    // Distribute questions proportionally to chunk size, min 1 per chunk
    const totalWeight = allChunks.reduce((s, c) => s + c.weight, 0) || 1;
    const allocations = allChunks.map(c => Math.max(1, Math.round((c.weight / totalWeight) * effectiveCount)));
    // Adjust to sum exactly to effectiveCount
    let sum = allocations.reduce((a, b) => a + b, 0);
    while (sum > effectiveCount) {
      const idx = allocations.indexOf(Math.max(...allocations));
      if (allocations[idx] <= 1) break;
      allocations[idx]--;
      sum--;
    }
    while (sum < effectiveCount) {
      const idx = allocations.indexOf(Math.min(...allocations));
      allocations[idx]++;
      sum++;
    }

    console.log(`Generating quiz: requested=${requestedQuestions}, effective=${effectiveCount}, chunks=${allChunks.length}, source=${JSON.stringify(usedSource)}`);

    // Run chunk generations in parallel
    const total = allChunks.length;
    const results = await Promise.all(
      allChunks.map((c, i) => {
        const prompt = buildPrompt(c.text, allocations[i], difficulty, total > 1 ? { i: i + 1, total } : undefined);
        return callOpenAI(prompt, openAIApiKey).catch(err => {
          console.error(`Chunk ${i + 1}/${total} failed:`, err);
          return [];
        });
      })
    );

    const merged = results.flat();

    // Validate + de-dupe
    const Q_MAX = 200, OPT_MAX = 80, EXP_MAX = 250;
    const seen = new Set<string>();
    const validated = merged
      .map((q: any) => {
        if (!q || !q.question || !Array.isArray(q.options)) return null;
        const question = String(q.question).trim().slice(0, Q_MAX);
        const options = q.options.map((o: any) => String(o ?? '').trim().slice(0, OPT_MAX)).filter(Boolean);
        const explanation = q.explanation ? String(q.explanation).trim().slice(0, EXP_MAX) : undefined;
        if (!question || options.length < 2) return null;
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= options.length) return null;
        if (new Set(options.map((o: string) => o.toLowerCase())).size < 2) return null;
        if (options.some((o: string) => o.toLowerCase() === question.toLowerCase())) return null;
        const key = question.toLowerCase();
        if (seen.has(key)) return null;
        seen.add(key);
        return { question, options, correctAnswer: q.correctAnswer, explanation };
      })
      .filter(Boolean)
      .slice(0, effectiveCount);

    if (validated.length === 0) {
      throw new Error('No valid questions could be generated from the content');
    }

    console.log(`Successfully generated ${validated.length} questions`);

    return new Response(
      JSON.stringify({
        success: true,
        quiz: {
          title: topic ? `Quiz on ${topic}` : "Generated Quiz",
          questions: validated,
          difficulty,
          totalQuestions: validated.length,
        },
        usedSource,
        requestedQuestions,
        effectiveQuestions: effectiveCount,
        chunksUsed: total,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
