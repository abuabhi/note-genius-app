import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🧪 Test Enhancement function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = performance.now();
    const { text, enhancementType = 'summary' } = await req.json();
    
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
2. Present each key point as a standalone bullet (•), written in full sentence format if possible.
3. Do **not** add new interpretations or summaries — only distill and extract what's already there.
4. Do **not** highlight, bold, or color any individual terms.
5. Format each bullet point with proper HTML line breaks and spacing:
   • First key point<br><br>
   • Second key point<br><br>
   • Third key point<br><br>
6. Ensure proper spacing between each bullet for readability.
7. Limit to **8–12 key points** unless more are clearly justified by the content length.
8. Do NOT include any headers or titles - start directly with the bullet points.

Return only the clean, formatted bullet points suitable for direct web rendering (no markdown, no wrapper HTML).`;
        userPrompt = `Extract the key points from this text:\n\n${text}`;
        break;
        
      case 'generate-questions':
        systemPrompt = `You are an AI study assistant that extracts the most important questions and answers from a long educational note.

Your job is to:
- Identify the top 10 most relevant questions a student should be able to answer after reading the content.
- Provide clear, accurate answers directly based on the note.
- Format the questions using bold text and a Mint Green color (#3EB489) suitable for web display.

Follow these rules:

1. Questions must come directly from the content — no guessing or external facts.
2. Provide a **mix of recall, concept, and reasoning questions**.
3. Limit each answer to 2–5 sentences.
4. Do not add headers, summaries, or instructions — return only the formatted Q&A pairs.
5. Format each question using this HTML tag:
   <div style="color:#3EB489; font-weight:bold; margin-top:12px;">QX. Your question here?</div>

Return only the clean, formatted content suitable for direct web rendering.`;
        userPrompt = `Generate study questions from this text:\n\n${text}`;
        break;

      case 'convert-to-markdown':
        systemPrompt = `You are a formatting assistant for a web-based educational platform. Your task is to take long, unstructured raw text and convert it into a cleanly formatted version that is easier to read, scan, and visually follow.

Your formatting rules are:

1. Convert major sections into headings and apply this format:
   <div style="color:#3EB489; font-weight:bold; font-size:1.2em; margin-top:10px;">Heading Text</div>
   This applies your webapp's Green Mint color (#3EB489).

2. Use bullet points (•) for lists and unordered concepts.

3. Use numbered lists (1., 2., 3.) for steps or processes.

4. Add appropriate line breaks between paragraphs, bullets, and headings to visually separate ideas.

5. Apply indentation where needed to show sub-points or hierarchy.

6. Do **not** highlight, bold, or color individual keywords or phrases.

7. Do **not** summarize, rephrase, or remove any content from the original input. Only format it for readability.

8. Return the final result as raw HTML-compatible text (for rendering inside a styled web component). Do not wrap it in HTML or provide markdown.

Only return the structured, formatted output based on the raw text.`;
        userPrompt = `Format this text for better readability:\n\n${text}`;
        break;

      case 'enrich-note':
        systemPrompt = `You are an expert AI content enhancer for a study tool. Your task is to enrich the original content with meaningful, in-context additions to improve clarity, understanding, and depth.

Here's how to perform the enhancement:

1. Expand the original content by **adding 50–70% more content** without changing the core meaning or tone.
2. Insert the additional content **inline**, immediately following the related idea or paragraph.
3. Do not rephrase or rewrite the original content — preserve it as-is.
4. Ensure all additions are **context-aware**, relevant, and educational — examples, definitions, explanations, analogies, or clarifications.
5. Wrap each new block of AI-added content using the following HTML style:
   <div style="background-color:#E6F7F1; border-left:4px solid #3EB489; padding:8px; margin:8px 0;">
     [AI_ENHANCED] Your added content goes here.
   </div>

Return the enhanced content suitable for direct web rendering.`;
        userPrompt = `Enhance this educational content with additional context and explanations:\n\n${text}`;
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
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 2000
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