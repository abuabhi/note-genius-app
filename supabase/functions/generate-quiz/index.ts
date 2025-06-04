
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface QuizGenerationOptions {
  content: string;
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
    const { content, numberOfQuestions = 5, difficulty = 'medium', topic } = requestData;
    
    if (!content) {
      throw new Error("Content is required for quiz generation");
    }
    
    console.log(`Generating quiz: questions=${numberOfQuestions}, difficulty=${difficulty}, topic=${topic || 'not specified'}`);
    
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
3. Have 4 answer options each
4. Include brief explanations for the correct answers
5. Are varied in question type (comprehension, application, analysis)

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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Generate high-quality quiz questions that test understanding and application of concepts. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
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
    
    // Validate and clean the questions
    const validatedQuestions = parsedQuestions.questions
      .filter((q: any) => {
        return q.question && 
               Array.isArray(q.options) && 
               q.options.length >= 2 && 
               typeof q.correctAnswer === 'number' && 
               q.correctAnswer >= 0 && 
               q.correctAnswer < q.options.length;
      })
      .slice(0, numberOfQuestions); // Ensure we don't exceed requested number
    
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
        error: error.message || 'Internal server error',
        details: error.stack || 'No stack trace available'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
