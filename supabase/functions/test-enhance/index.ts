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
    const { text } = await req.json();
    
    console.log('📝 Input received:', {
      length: text?.length || 0,
      preview: text?.substring(0, 100) || 'No text'
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

    const systemPrompt = `You are an expert summarizer for educational content. Your task is to generate a clear, concise, and accurate summary from a long note (up to 10,000 words). The summary must preserve all key ideas, structure, and tone. Use simple academic language suitable for students and professionals.

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
          { role: 'user', content: `Please summarize this text:\n\n${text}` }
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

    // Parse the JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    // Validate the structure
    const requiredFields = ['summary_title', 'summary_overview', 'key_points', 'notable_terms', 'quote_or_stat'];
    for (const field of requiredFields) {
      if (!(field in parsedResult)) {
        throw new Error(`Missing required field: ${field}`);
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