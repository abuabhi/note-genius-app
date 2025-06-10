
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, noteContext, noteId } = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create system prompt with note context
    const systemPrompt = `You are a helpful AI assistant that can only answer questions about the specific note provided below. 

Note Details:
- Title: ${noteContext.title}
- Subject: ${noteContext.subject}
- Content: ${noteContext.content || 'No content available'}

Enhanced Content (if available):
- Summary: ${noteContext.enhancedContent?.summary || 'Not available'}
- Key Points: ${noteContext.enhancedContent?.keyPoints || 'Not available'}
- Improved Content: ${noteContext.enhancedContent?.improvedContent || 'Not available'}
- Enriched Content: ${noteContext.enhancedContent?.enrichedContent || 'Not available'}

IMPORTANT RULES:
1. Only answer questions related to the content of this specific note
2. If asked about topics not covered in the note, politely redirect to the note content
3. Be helpful and educational in your responses
4. Keep responses concise but informative
5. If the note content is limited, acknowledge this limitation

If someone asks about something not in the note, respond with something like: "I can only help with questions about the content in this note. Based on what's here, I can discuss [mention relevant topics from the note]."`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at the moment.'

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error in note-chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
