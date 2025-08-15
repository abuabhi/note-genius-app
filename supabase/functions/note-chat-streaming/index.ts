
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
    const { message, noteContext, noteId, conversationHistory = [], streaming = false } = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create enhanced system prompt with note context
    const systemPrompt = `You are an intelligent AI assistant specialized in helping students learn from their notes. 

Note Details:
- Title: ${noteContext.title}
- Subject: ${noteContext.subject}
- Content: ${noteContext.content || 'No content available'}

Enhanced Content (if available):
- Summary: ${noteContext.enhancedContent?.summary || 'Not available'}
- Key Points: ${noteContext.enhancedContent?.keyPoints || 'Not available'}
- Improved Content: ${noteContext.enhancedContent?.improvedContent || 'Not available'}
- Enriched Content: ${noteContext.enhancedContent?.enrichedContent || 'Not available'}

IMPORTANT CAPABILITIES:
1. Answer questions about the note content with detailed explanations
2. Provide summaries, key points, and study guides
3. Generate practice questions and quizzes
4. Explain complex concepts in simpler terms
5. Create mnemonics and memory aids
6. Suggest study strategies based on the content
7. Provide follow-up questions to deepen understanding

RESPONSE GUIDELINES:
- Be educational and encouraging
- Use examples and analogies when helpful
- Break down complex topics into digestible parts
- Suggest related concepts or areas to explore
- Always relate answers back to the note content
- Be concise but comprehensive

If asked about topics not in the note, politely redirect to the note content while offering to help with what's available.`;

    // Prepare messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Enhanced AI call with additional features
    const aiBody: any = {
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.7,
      stream: streaming,
      functions: [
        {
          name: 'generate_follow_up_questions',
          description: 'Generate relevant follow-up questions based on the response',
          parameters: {
            type: 'object',
            properties: {
              follow_up_questions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of 2-3 relevant follow-up questions'
              }
            }
          }
        }
      ],
      function_call: 'auto',
    };

    if (streaming) {
      // Streaming will be implemented in the front-end for now
      // Return a regular response to simplify the implementation
      aiBody.stream = false;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at the moment.';
    
    let followUpQuestions: string[] = [];
    
    // Extract follow-up questions from function call if available
    if (data.choices[0]?.message?.function_call) {
      try {
        const functionArgs = JSON.parse(data.choices[0].message.function_call.arguments);
        followUpQuestions = functionArgs.follow_up_questions || [];
      } catch (e) {
        console.log('Could not parse function call arguments:', e);
      }
    }

    // Generate default follow-up questions if none were generated
    if (followUpQuestions.length === 0) {
      const contentType = message.toLowerCase();
      if (contentType.includes('what') || contentType.includes('explain')) {
        followUpQuestions = ['Can you give me an example?', 'How does this relate to other concepts?'];
      } else if (contentType.includes('how')) {
        followUpQuestions = ['What are the key steps?', 'Are there any common mistakes?'];
      } else if (contentType.includes('why')) {
        followUpQuestions = ['What are the implications?', 'How can I remember this?'];
      } else {
        followUpQuestions = ['Can you elaborate on this?', 'What should I study next?'];
      }
    }

    const responseData: any = { 
      response: aiResponse,
      followUpQuestions: followUpQuestions.slice(0, 3)
    };

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in note-chat-streaming function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: error.status || 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
