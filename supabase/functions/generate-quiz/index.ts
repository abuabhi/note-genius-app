
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface QuizGenerationOptions {
  content: string;
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer')[];
}

interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData: QuizGenerationOptions = await req.json();
    const { content, numberOfQuestions = 5, difficulty = 'medium', topic, questionTypes = ['multiple-choice'] } = requestData;
    
    if (!content) {
      throw new Error("Content is required for quiz generation");
    }
    
    console.log(`Generating quiz: questions=${numberOfQuestions}, difficulty=${difficulty}, topic=${topic || 'not specified'}`);
    
    // Here we would typically use an AI service like OpenAI to generate quiz questions
    // For now, we'll return a placeholder response with mock data
    
    const questions: QuizQuestion[] = Array(numberOfQuestions).fill(0).map((_, index) => {
      return {
        question: `Sample question ${index + 1} about the content`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: "This is an explanation for the correct answer",
        type: 'multiple-choice'
      };
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        quiz: {
          title: topic ? `Quiz on ${topic}` : "Generated Quiz",
          questions,
          difficulty,
          totalQuestions: questions.length
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
