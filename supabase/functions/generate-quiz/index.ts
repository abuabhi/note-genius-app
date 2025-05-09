import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://esm.sh/openai@4.1.0"

// Define CORS headers directly in this file instead of importing
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const openai = new OpenAI({
  apiKey: openAiKey
})

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { content, count = 5 } = await req.json()

    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Trim and validate content
    const cleanContent = content.trim()
    if (cleanContent.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Content is too short' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate quiz questions using OpenAI
    const maxQuestions = Math.min(10, Math.max(1, count))

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that creates quiz questions from educational content. Create ${maxQuestions} multiple-choice quiz questions based on the provided text. Each question should have 4 answer options with EXACTLY ONE correct answer. Format your response as a JSON array where each object has this structure:
          {
            "question": "The question text here",
            "options": [
              {"text": "First option (correct one)", "correct": true},
              {"text": "Second option", "correct": false},
              {"text": "Third option", "correct": false},
              {"text": "Fourth option", "correct": false}
            ],
            "explanation": "Brief explanation of why the correct answer is correct"
          }`
        },
        {
          role: "user", 
          content: cleanContent
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || ""
    
    try {
      // Parse the JSON response
      const jsonResponse = JSON.parse(responseText)
      
      // Format the questions to match our expected format
      const questions = jsonResponse.questions || []
      const formattedQuestions = questions.map((q: any) => {
        // Find the correct option
        const correctOption = q.options.find((opt: any) => opt.correct)
        
        // Map the other options as distractors
        const distractors = q.options
          .filter((opt: any) => !opt.correct)
          .map((opt: any) => opt.text)
        
        return {
          question: q.question,
          explanation: q.explanation || "",
          options: [
            { content: correctOption?.text || "", isCorrect: true },
            ...distractors.map((d: string) => ({ content: d, isCorrect: false }))
          ]
        }
      })
      
      return new Response(
        JSON.stringify(formattedQuestions),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (jsonError) {
      console.error("Error parsing JSON from OpenAI:", jsonError)
      
      return new Response(
        JSON.stringify({ error: "Failed to generate valid quiz questions" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
