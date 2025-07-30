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

// Token estimation function (rough approximation: 1 token ≈ 4 characters)
const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Content chunking function for large content
const chunkContent = (content: string, maxChunkSize: number = 12000): string[] => {
  if (content.length <= maxChunkSize) {
    return [content];
  }
  
  const chunks: string[] = [];
  let currentPosition = 0;
  
  while (currentPosition < content.length) {
    let chunkEnd = Math.min(currentPosition + maxChunkSize, content.length);
    
    // Try to break at paragraph or sentence boundaries
    if (chunkEnd < content.length) {
      const lastParagraph = content.lastIndexOf('\n\n', chunkEnd);
      const lastSentence = content.lastIndexOf('.', chunkEnd);
      const lastSpace = content.lastIndexOf(' ', chunkEnd);
      
      if (lastParagraph > currentPosition + maxChunkSize * 0.7) {
        chunkEnd = lastParagraph + 2;
      } else if (lastSentence > currentPosition + maxChunkSize * 0.7) {
        chunkEnd = lastSentence + 1;
      } else if (lastSpace > currentPosition + maxChunkSize * 0.8) {
        chunkEnd = lastSpace;
      }
    }
    
    chunks.push(content.substring(currentPosition, chunkEnd).trim());
    currentPosition = chunkEnd;
  }
  
  return chunks;
};

// Process content in chunks for large content
const processInChunks = async (chunks: string[], prompt: string, title: string): Promise<string> => {
  const results: string[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkPrompt = chunks.length > 1 
      ? `${prompt}\n\n[Part ${i + 1} of ${chunks.length}]\n\nTitle: ${title || 'Untitled'}\n\nContent:\n${chunks[i]}`
      : `${prompt}\n\nTitle: ${title || 'Untitled'}\n\nContent:\n${chunks[i]}`;
    
    const estimatedTokens = estimateTokens(chunkPrompt);
    const maxTokens = Math.min(1500, Math.max(300, 4000 - estimatedTokens));
    
    console.log(`🔍 Processing chunk ${i + 1}/${chunks.length}, estimated input tokens: ${estimatedTokens}, max output tokens: ${maxTokens}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert educational assistant. Provide clear, concise responses. If processing multiple parts, ensure consistency with previous parts.' 
          },
          { 
            role: 'user', 
            content: chunkPrompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error for chunk ${i + 1}:`, errorText);
      
      // If token limit exceeded, try with smaller chunk
      if (response.status === 400 && errorText.includes('token')) {
        console.log(`🔄 Retrying chunk ${i + 1} with reduced content...`);
        const reducedChunk = chunks[i].substring(0, Math.floor(chunks[i].length * 0.7));
        const retryPrompt = `${prompt}\n\n[Part ${i + 1} of ${chunks.length} - Reduced]\n\nTitle: ${title || 'Untitled'}\n\nContent:\n${reducedChunk}`;
        
        const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert educational assistant. Provide clear, concise responses.' },
              { role: 'user', content: retryPrompt }
            ],
            max_tokens: 800,
            temperature: 0.3,
            top_p: 0.9,
          }),
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          results.push(retryData.choices[0].message.content);
          continue;
        }
      }
      
      throw new Error(`OpenAI API error for chunk ${i + 1}: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    results.push(data.choices[0].message.content);
  }
  
  // Combine results
  if (results.length === 1) {
    return results[0];
  }
  
  // For multiple chunks, combine intelligently
  return results.join('\n\n---\n\n');
};

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
  'convert-to-markdown': 'markdown_content_generated_at',
  'enrich-note': 'enriched_content_generated_at'
};

const statusFieldMapping = {
  'summarize': 'summary_status',
  'extract-key-points': 'key_points_status',
  'generate-questions': 'questions_status',
  'convert-to-markdown': 'markdown_content_status',
  'enrich-note': 'enriched_status'
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

    // Handle large content with chunking
    console.log('🤖 Processing content...');
    const startTime = Date.now();
    
    const estimatedTokens = estimateTokens(content);
    console.log(`📊 Estimated input tokens: ${estimatedTokens}`);
    
    let enhancedContent: string;
    
    // Use chunking for large content (>3000 estimated tokens ≈ 12000 characters)
    if (estimatedTokens > 3000) {
      console.log('📦 Large content detected, using chunking approach...');
      const chunks = chunkContent(content);
      console.log(`🔄 Split into ${chunks.length} chunks`);
      enhancedContent = await processInChunks(chunks, prompt, title);
    } else {
      // Process normally for smaller content
      console.log('⚡ Processing normally for smaller content...');
      const maxTokens = Math.min(1500, Math.max(300, 4000 - estimatedTokens));
      
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
              content: 'You are an expert educational assistant. Provide clear, concise responses quickly.' 
            },
            { 
              role: 'user', 
              content: `${prompt}\n\nTitle: ${title || 'Untitled'}\n\nContent:\n${content}` 
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.3,
          top_p: 0.9,
        }),
      });

      if (!openAIResponse.ok) {
        const error = await openAIResponse.text();
        console.error('❌ OpenAI API error:', error);
        
        // If token limit exceeded on normal content, try chunking as fallback
        if (openAIResponse.status === 400 && error.includes('token')) {
          console.log('🔄 Token limit exceeded, falling back to chunking...');
          const chunks = chunkContent(content, 8000); // Smaller chunks for fallback
          enhancedContent = await processInChunks(chunks, prompt, title);
        } else {
          throw new Error(`OpenAI API error: ${openAIResponse.status} - ${error}`);
        }
      } else {
        const openAIData = await openAIResponse.json();
        enhancedContent = openAIData.choices[0].message.content;
      }
    }

    const apiCallTime = Date.now() - startTime;
    console.log(`⏱️ Content processing took: ${apiCallTime}ms`);
    
    console.log('✅ Generated enhanced content');
    console.log(`📊 Enhanced content length: ${enhancedContent.length}`);

    // Update database
    const dbField = dbFieldMapping[enhancementType];
    const timestampField = timestampFieldMapping[enhancementType];
    const statusField = statusFieldMapping[enhancementType];
    
    if (!dbField || !timestampField || !statusField) {
      throw new Error(`No database mapping for enhancement type: ${enhancementType}`);
    }

    console.log(`💾 Updating database field: ${dbField} and status: ${statusField}`);
    const dbStartTime = Date.now();
    
    const updateData = {
      [dbField]: enhancedContent,
      [timestampField]: new Date().toISOString(),
      [statusField]: 'completed',
      updated_at: new Date().toISOString()
    };
    
    console.log(`📊 Update data:`, { 
      contentField: dbField, 
      statusField, 
      statusValue: 'completed',
      contentLength: enhancedContent.length 
    });

    const { error: updateError } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId);

    const dbUpdateTime = Date.now() - dbStartTime;
    console.log(`⏱️ Database update took: ${dbUpdateTime}ms`);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('✅ Database updated successfully');
    
    const totalTime = Date.now() - startTime;
    console.log(`🏁 Total processing time: ${totalTime}ms (API: ${apiCallTime}ms, DB: ${dbUpdateTime}ms)`);

    return new Response(JSON.stringify({ 
      success: true, 
      data: enhancedContent,
      enhancementType,
      noteId,
      performance: {
        totalTime,
        apiTime: apiCallTime,
        dbTime: dbUpdateTime
      }
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