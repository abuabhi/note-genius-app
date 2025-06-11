
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
    const { message, noteContext, noteId, conversationHistory = [], enhancedFeatures = false } = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create enhanced system prompt with strict topic enforcement
    const systemPrompt = `You are an intelligent AI assistant specialized in helping students learn from their notes. You MUST stay strictly within the boundaries of the provided note content.

STRICT TOPIC BOUNDARY RULES:
🚫 DO NOT answer questions unrelated to the note content
🚫 DO NOT provide information about topics not covered in the note
🚫 DO NOT answer general knowledge questions outside the note scope
🚫 DO NOT help with homework/assignments not directly related to this note

Note Details:
- Title: ${noteContext.title}
- Subject: ${noteContext.subject}
- Content: ${noteContext.content || 'No content available'}

Enhanced Content (if available):
- Summary: ${noteContext.enhancedContent?.summary || 'Not available'}
- Key Points: ${noteContext.enhancedContent?.keyPoints || 'Not available'}
- Improved Content: ${noteContext.enhancedContent?.improvedContent || 'Not available'}
- Enriched Content: ${noteContext.enhancedContent?.enrichedContent || 'Not available'}

TOPIC ENFORCEMENT INSTRUCTIONS:
1. FIRST, analyze if the user's question relates to the note content above
2. If the question is about topics NOT covered in this note, use one of these polite rejection patterns:

For off-topic questions, respond with:
"I'm like a laser-focused study buddy for ${noteContext.subject} - I can only help with questions about '${noteContext.title}'. Let's dive into this material instead! What would you like to know about [mention specific topic from the note]?"

OR:

"Oops! I'm your dedicated assistant for this ${noteContext.subject} note. I can't help with [briefly mention their off-topic question], but I'm amazing at explaining [mention specific concept from the note]. What aspect of this material interests you?"

OR:

"I'm specialized in helping you master the content in '${noteContext.title}'. Got any questions about [mention 1-2 specific topics from the note content]?"

3. ALWAYS suggest 2-3 specific questions they COULD ask about the note content
4. If the question IS related to the note, answer it thoroughly using the note content

IMPORTANT CAPABILITIES (only for note-related questions):
1. Answer questions about the note content with detailed explanations
2. Provide summaries, key points, and study guides based on the note
3. Generate practice questions and quizzes from the note material
4. Explain complex concepts from the note in simpler terms
5. Create mnemonics and memory aids for note content
6. Suggest study strategies based on the note content
7. Provide follow-up questions to deepen understanding of the note

RESPONSE GUIDELINES:
- Be educational and encouraging when discussing note content
- Use examples and analogies from the note when helpful
- Break down complex topics from the note into digestible parts
- Always relate answers back to the specific note content
- Be concise but comprehensive for note-related questions
- For off-topic questions, be polite but firm in redirecting to the note content

Remember: Your expertise is LIMITED to the content provided in this specific note. Stay focused!`;

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
    };

    // For enhanced features, use function calling to generate follow-up questions
    if (enhancedFeatures) {
      aiBody.functions = [
        {
          name: 'generate_follow_up_questions',
          description: 'Generate relevant follow-up questions based on the response (only for note-related topics)',
          parameters: {
            type: 'object',
            properties: {
              follow_up_questions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of 2-3 relevant follow-up questions about the note content'
              }
            }
          }
        }
      ];
      aiBody.function_call = 'auto';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiBody),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at the moment.'
    
    let followUpQuestions: string[] = [];
    
    // Extract follow-up questions from function call if available
    if (enhancedFeatures && data.choices[0]?.message?.function_call) {
      try {
        const functionArgs = JSON.parse(data.choices[0].message.function_call.arguments);
        followUpQuestions = functionArgs.follow_up_questions || [];
      } catch (e) {
        console.log('Could not parse function call arguments');
      }
    }

    // Generate default follow-up questions if none were generated and response seems on-topic
    if (enhancedFeatures && followUpQuestions.length === 0 && !aiResponse.includes("I'm like a laser-focused") && !aiResponse.includes("Oops!") && !aiResponse.includes("I'm specialized")) {
      const contentType = message.toLowerCase();
      const noteSubject = noteContext.subject?.toLowerCase() || 'this topic';
      
      if (contentType.includes('what') || contentType.includes('explain')) {
        followUpQuestions = [`Can you give me an example from this ${noteSubject} note?`, 'How does this relate to other concepts in the note?'];
      } else if (contentType.includes('how')) {
        followUpQuestions = ['What are the key steps mentioned in the note?', 'Are there any important details I should remember?'];
      } else if (contentType.includes('why')) {
        followUpQuestions = ['What are the implications mentioned in the note?', 'How can I better understand this concept?'];
      } else {
        followUpQuestions = ['Can you elaborate on this from the note?', 'What should I focus on next in this material?'];
      }
    }

    const responseData: any = { response: aiResponse };
    
    if (enhancedFeatures) {
      responseData.followUpQuestions = followUpQuestions.slice(0, 2); // Limit to 2 questions
    }

    return new Response(
      JSON.stringify(responseData),
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
