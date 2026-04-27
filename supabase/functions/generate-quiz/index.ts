
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface QuizGenerationOptions {
  content: string;
  /** Optional AI-enriched version of the note content. Preferred over `content` when present. */
  enrichedContent?: string;
  /** Hint that the supplied content is already the enriched version (set by callers that pre-resolve). */
  usingEnrichedContent?: boolean;
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData: QuizGenerationOptions = await req.json();
    const { numberOfQuestions = 5, difficulty = 'medium', topic, enrichedContent, usingEnrichedContent } = requestData;
    // Prefer the AI-enriched version of the note when supplied — it produces
    // higher-quality, more precise quiz questions than raw user-entered content.
    const content =
      typeof enrichedContent === 'string' && enrichedContent.trim().length >= 20
        ? enrichedContent
        : requestData.content;

    if (!content) {
      throw new Error("Content is required for quiz generation");
    }

    console.log(`Generating quiz: questions=${numberOfQuestions}, difficulty=${difficulty}, topic=${topic || 'not specified'}, enriched=${!!enrichedContent || !!usingEnrichedContent}`);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }
    
    const prompt = `Based on the following content, generate ${numberOfQuestions} multiple-choice quiz questions at ${difficulty} difficulty level.

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

Format your response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure each question is clear, the correct answer index is accurate (0-3), and explanations are helpful but concise.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14', // Standardized model
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Generate high-quality multiple-choice quiz questions that test understanding and application of concepts. Questions must read as professional exam prompts: precise, self-contained, and free of filler. NEVER reference the source document ("According to the text…", "In the note above…", etc.). NEVER insert ellipses ("...") inside a question, option, or explanation — always write complete sentences. Always respond with valid JSON only. Ensure export-safe formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Standardized temperature for consistency
        top_p: 0.9,       // Standardized top_p
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Raw OpenAI response:', generatedContent);
    
    // Parse the JSON response
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('OpenAI response was not valid JSON');
      }
    }
    
    if (!parsedQuestions || !Array.isArray(parsedQuestions.questions)) {
      throw new Error('Invalid response format from AI');
    }
    
    // Validate, length-cap, and clean the questions
    const Q_MAX = 200, OPT_MAX = 80, EXP_MAX = 250;
    const seenQuestions = new Set<string>();
    const validatedQuestions = parsedQuestions.questions
      .map((q: any) => {
        if (!q || !q.question || !Array.isArray(q.options)) return null;
        const question = String(q.question).trim().slice(0, Q_MAX);
        const options = q.options.map((o: any) => String(o ?? '').trim().slice(0, OPT_MAX)).filter(Boolean);
        const explanation = q.explanation ? String(q.explanation).trim().slice(0, EXP_MAX) : undefined;
        if (!question || options.length < 2) return null;
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= options.length) return null;
        // Drop if all options identical
        if (new Set(options.map((o: string) => o.toLowerCase())).size < 2) return null;
        // Drop if any option is the full question
        if (options.some((o: string) => o.toLowerCase() === question.toLowerCase())) return null;
        // Drop duplicate questions
        const key = question.toLowerCase();
        if (seenQuestions.has(key)) return null;
        seenQuestions.add(key);
        return { question, options, correctAnswer: q.correctAnswer, explanation };
      })
      .filter(Boolean)
      .slice(0, numberOfQuestions);
    
    if (validatedQuestions.length === 0) {
      throw new Error('No valid questions could be generated from the content');
    }
    
    console.log(`Successfully generated ${validatedQuestions.length} questions`);
    
    return new Response(
      JSON.stringify({
        success: true,
        quiz: {
          title: topic ? `Quiz on ${topic}` : "Generated Quiz",
          questions: validatedQuestions,
          difficulty,
          totalQuestions: validatedQuestions.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
