import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

interface ExpansionRequest {
  selectedText: string;
  fullContext: string;
  contentType: string;
  noteTitle?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openaiApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { selectedText, fullContext, contentType, noteTitle }: ExpansionRequest = await req.json();

    if (!selectedText || !fullContext) {
      throw new Error('Selected text and full context are required');
    }

    console.log('🔍 Content expansion request:', {
      selectedText: selectedText.substring(0, 100),
      contextLength: fullContext.length,
      contentType,
      noteTitle
    });

    // Create a focused prompt for content expansion
    const systemPrompt = `You are an expert content expander. Your task is to provide detailed, educational expansion of selected topics while maintaining perfect contextual relevance.

INSTRUCTIONS:
- Expand ONLY on the selected text topic
- Use the full context to understand the subject matter and maintain consistency
- Provide detailed, educational content that builds upon the selected topic
- Keep the same tone and academic level as the original content
- Focus on depth and clarity rather than breadth
- Use clear paragraph structure and subheadings if appropriate
- Ensure the expansion flows naturally as if it were part of the original content

RESPONSE FORMAT:
- Return ONLY the expanded content in markdown format
- Do NOT include the original selected text
- Do NOT add introductory phrases like "Here's more information about..."
- Make it ready to be inserted directly after the selected text`;

    const userPrompt = `SELECTED TEXT TO EXPAND: "${selectedText}"

FULL CONTEXT:
${fullContext}

CONTENT TYPE: ${contentType}
${noteTitle ? `NOTE TITLE: ${noteTitle}` : ''}

Please provide a detailed expansion of the selected text topic, using the full context to maintain relevance and consistency.`;

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
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const expandedContent = data.choices[0].message.content;

    console.log('✅ Content expansion completed:', {
      originalLength: selectedText.length,
      expandedLength: expandedContent.length
    });

    return new Response(JSON.stringify({ 
      success: true, 
      expandedContent,
      originalText: selectedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Content expansion error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});