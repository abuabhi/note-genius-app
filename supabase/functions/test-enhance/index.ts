import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  console.log('🧪 Test Enhancement function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = performance.now();
    const { text, enhancementType = 'summary', noteId, userId } = await req.json();
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Get authenticated user ID if not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user && !error) {
          currentUserId = user.id;
        }
      }
    }
    
    console.log('📝 Input received:', {
      length: text?.length || 0,
      preview: text?.substring(0, 100) || 'No text',
      enhancementType
    });

    if (!text || typeof text !== 'string') {
      throw new Error('Text input is required');
    }

    if (text.length > 100000) {
      throw new Error('Text too long. Maximum 100,000 characters allowed.');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('🔑 OpenAI API Key found, making request...');

    let systemPrompt = '';
    let userPrompt = '';

    // Handle different enhancement types
    switch (enhancementType) {
      case 'extract-key-points':
        systemPrompt = `You are an AI assistant for a structured learning web platform. Your task is to extract the **most important key points** from a long block of unstructured educational content.

Follow these rules:

1. Extract the **essential insights** or facts from the text — one per line.
2. Present each key point as a standalone bullet using the • character, written in full sentence format if possible.
3. Do **not** add new interpretations or summaries — only distill and extract what's already there.
4. Do **not** highlight, bold, or color any individual terms.
5. Format each bullet point on its own line with a single newline between points.
6. Limit to **8–12 key points** unless more are clearly justified by the content length.
7. Do NOT include any headers, titles, or HTML formatting - return only plain text.

Example format:
• First key point
• Second key point
• Third key point

Return only plain text with bullet points, no HTML or markdown formatting.`;
        userPrompt = `Extract the key points from this text:\n\n${text}`;
        break;
        
      case 'generate-questions':
        systemPrompt = `You are an AI study assistant that extracts the most important questions and answers from a long educational note.

Your job is to:
- Identify the top 10 most relevant questions a student should be able to answer after reading the content.
- Provide clear, accurate answers directly based on the note.
- Format as plain text with simple numbering.

Follow these rules:

1. Questions must come directly from the content — no guessing or external facts.
2. Provide a **mix of recall, concept, and reasoning questions**.
3. Limit each answer to 2–5 sentences.
4. Do not add headers, summaries, or instructions — return only the Q&A pairs.
5. Format each question-answer pair as:
   Q1. Your question here?
   Answer: Your answer here.
   
   Q2. Your next question?
   Answer: Your answer here.

Return only plain text with simple numbering, no HTML or markdown formatting.`;
        userPrompt = `Generate study questions from this text:\n\n${text}`;
        break;

      case 'convert-to-markdown':
        systemPrompt = `You are a formatting assistant for a web-based educational platform. Your task is to take long, unstructured raw text and convert it into a cleanly formatted version that is easier to read, scan, and visually follow.

Your formatting rules are:

1. Convert major sections into headings using markdown format:
   # Main Heading
   ## Sub Heading
   ### Minor Heading

2. Use bullet points (•) for lists and unordered concepts.

3. Use numbered lists (1., 2., 3.) for steps or processes.

4. Add appropriate line breaks between paragraphs, bullets, and headings to visually separate ideas.

5. Apply indentation where needed to show sub-points or hierarchy.

6. Do **not** highlight, bold, or color individual keywords or phrases.

7. Do **not** summarize, rephrase, or remove any content from the original input. Only format it for readability.

8. Return clean markdown text with proper line breaks and structure.

Return only plain text with markdown formatting, no HTML.`;
        userPrompt = `Format this text for better readability:\n\n${text}`;
        break;

      case 'enrich-note':
        systemPrompt = `You are an expert AI content enhancer for a study tool. Your mission is to significantly expand educational content while preserving ALL original text exactly as written.

CRITICAL REQUIREMENTS:
1. **PRESERVE ORIGINAL CONTENT**: Never modify, rephrase, or remove any original text. The original content must remain 100% intact.
2. **EXPANSION TARGET**: Add 60-80% more content (if original is 1000 words, result should be 1600-1800 words).
3. **STRATEGIC PLACEMENT**: After each major concept, paragraph, or idea in the original text, add comprehensive enhancements.

ENHANCEMENT TYPES TO ADD:
- Detailed explanations and context
- Real-world examples and applications  
- Background information and history
- Step-by-step breakdowns of complex concepts
- Memory aids and study tips
- Connections to related topics
- Practical implications and use cases

FORMATTING:
- Wrap all AI-added content with: [AI_ENHANCED] your enhancement here [/AI_ENHANCED]
- Use natural paragraph breaks between original and enhanced content
- Ensure enhanced sections flow naturally with the original text

EXAMPLE:
Original: "Photosynthesis is the process plants use to make food."
Enhanced: "Photosynthesis is the process plants use to make food.

[AI_ENHANCED] This remarkable biological process occurs primarily in the chloroplasts of plant cells, where chlorophyll captures light energy from the sun. The process can be broken down into two main stages: the light-dependent reactions (photo stage) and the Calvin cycle (synthesis stage). During photosynthesis, plants convert carbon dioxide from the air and water from the soil into glucose (sugar) and oxygen. This process is fundamental to life on Earth, as it produces the oxygen we breathe and forms the base of most food chains. The chemical equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. [/AI_ENHANCED]"

Remember: The goal is substantial content expansion while keeping every word of the original text unchanged.`;
        userPrompt = `Enhance this educational content with substantial additional context and explanations. Original content length: ${text.length} characters. Target: Increase by 60-80%.\n\nContent:\n${text}`;
        break;
        
      default: // 'summary' or any other type
        systemPrompt = `You are an expert summarizer for educational content. Your task is to generate a clear, concise, and accurate summary from a long note (up to 10,000 words). The summary must preserve all key ideas, structure, and tone. Use simple academic language suitable for students and professionals.

Return the summary in a structured JSON format with the following keys:

{
  "summary_title": "<one-line title capturing the main theme>",
  "summary_overview": "<100–200 word paragraph giving a bird's-eye view of the topic>",
  "key_points": [
    "<first core point or idea>",
    "<second core point or idea>",
    "... (up to 8-10 total)"
  ],
  "notable_terms": [
    {"term": "Example Term", "definition": "Simple definition of the term"},
    "... (up to 5 optional)"
  ],
  "quote_or_stat": "<Include one compelling quote or statistic if found. If not, return 'N/A'>"
}

Respond ONLY with valid JSON. No other text.`;
        userPrompt = `Please summarize this text:\n\n${text}`;
    }

    const apiStartTime = performance.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: enhancementType === 'enrich-note' ? 'gpt-4o' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: enhancementType === 'enrich-note' ? 8000 : 2000
      }),
    });

    const apiTime = performance.now() - apiStartTime;
    console.log('📡 OpenAI API response:', {
      status: response.status,
      apiTime: `${apiTime.toFixed(0)}ms`
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✨ OpenAI response received:', {
      contentLength: content?.length || 0,
      tokensUsed: data.usage?.total_tokens || 0
    });

    // Handle response based on enhancement type
    let parsedResult;
    if (['extract-key-points', 'generate-questions', 'convert-to-markdown', 'enrich-note'].includes(enhancementType)) {
      // These return direct HTML content, not JSON
      parsedResult = content;
    } else {
      // Summary still returns JSON
      try {
        parsedResult = JSON.parse(content);
        // Basic validation - just check if we have some content
        if (!parsedResult || typeof parsedResult !== 'object') {
          throw new Error('Invalid response structure');
        }
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    }

    const totalTime = performance.now() - startTime;
    
    console.log('✅ Enhancement completed successfully:', {
      processingTime: `${apiTime.toFixed(0)}ms`,
      totalTime: `${totalTime.toFixed(0)}ms`,
      tokensUsed: data.usage?.total_tokens || 0
    });

    // Track AI enrichment usage if we have the required info
    if (currentUserId && noteId) {
      try {
        const currentDate = new Date();
        const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const { error: usageError } = await supabase
          .from('note_enrichment_usage')
          .insert({
            user_id: currentUserId,
            note_id: noteId,
            enhancement_type: enhancementType,
            tokens_used: data.usage?.total_tokens || 0,
            month_year: monthYear,
            llm_provider: 'openai'
          });
          
        if (usageError) {
          console.error('❌ Failed to record usage:', usageError);
        } else {
          console.log('✅ Usage tracked successfully');
        }
      } catch (trackingError) {
        console.error('❌ Error tracking usage:', trackingError);
      }
    } else {
      console.warn('⚠️ Cannot track usage - missing userId or noteId');
    }

    return new Response(JSON.stringify({
      success: true,
      result: parsedResult,
      processing_time: apiTime,
      total_time: totalTime,
      tokens_used: data.usage?.total_tokens || 0,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Test Enhancement error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});