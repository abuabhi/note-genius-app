import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const enhancementPrompts = {
  'summarize': 'Provide a concise summary of the following content, highlighting the main points and key information:',
  'extract-key-points': 'Extract the key points from the following content as a bullet-point list. Focus on the most important information:',
  'generate-questions': 'Generate 5-8 study questions based on the following content. Make them varied (multiple choice, short answer, essay) and educational:',
  'convert-to-markdown': 'Convert the following content to well-formatted markdown. Improve structure with headers, bullet points, and formatting:',
  'enrich-note': 'Enhance and expand the following content with additional context, explanations, and related information:'
};

const dbFieldMapping = {
  'summarize': 'summary',
  'extract-key-points': 'key_points', 
  'generate-questions': 'questions_content',
  'convert-to-markdown': 'markdown_content',
  'enrich-note': 'enriched_content'
};

const timestampFieldMapping = {
  'summarize': 'summary_generated_at',
  'extract-key-points': 'key_points_generated_at',
  'generate-questions': 'questions_generated_at', 
  'convert-to-markdown': 'markdown_generated_at',
  'enrich-note': 'enriched_generated_at'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Simple enhance note function called');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { noteId, content, enhancementType, title } = await req.json();
    
    if (!noteId || !content || !enhancementType) {
      throw new Error('Missing required parameters: noteId, content, enhancementType');
    }

    console.log(`📝 Processing ${enhancementType} for note ${noteId}`);
    console.log(`📄 Content length: ${content.length}`);

    const prompt = enhancementPrompts[enhancementType];
    if (!prompt) {
      throw new Error(`Unknown enhancement type: ${enhancementType}`);
    }

    // Call OpenAI API
    console.log('🤖 Calling OpenAI API...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert educational assistant. Provide clear, well-structured responses that help with learning and studying.' 
          },
          { 
            role: 'user', 
            content: `${prompt}\n\nTitle: ${title || 'Untitled'}\n\nContent:\n${content}` 
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('❌ OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const enhancedContent = openAIData.choices[0].message.content;
    
    console.log('✅ Generated enhanced content');
    console.log(`📊 Enhanced content length: ${enhancedContent.length}`);

    // Update database
    const dbField = dbFieldMapping[enhancementType];
    const timestampField = timestampFieldMapping[enhancementType];
    
    if (!dbField || !timestampField) {
      throw new Error(`No database mapping for enhancement type: ${enhancementType}`);
    }

    console.log(`💾 Updating database field: ${dbField}`);
    
    const updateData = {
      [dbField]: enhancedContent,
      [timestampField]: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('✅ Database updated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      data: enhancedContent,
      enhancementType,
      noteId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in simple-enhance-note function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});