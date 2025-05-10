
import { TokenUsage } from './types.ts';

interface OpenAIResponse {
  enhancedContent: string;
  tokenUsage: TokenUsage;
}

/**
 * Calls the OpenAI API to enhance note content
 * @param prompt The prompt to send to OpenAI
 * @param apiKey OpenAI API key
 * @returns Enhanced content and token usage statistics
 * @throws Error if API call fails
 */
export async function callOpenAI(prompt: string, apiKey: string): Promise<OpenAIResponse> {
  try {
    console.log('Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful study assistant that helps improve notes.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('OpenAI API response received');
    
    if (!data.choices || data.choices.length === 0) {
      console.error('Invalid response from OpenAI:', data);
      throw new Error('Invalid response from OpenAI API');
    }
    
    const enhancedContent = data.choices[0].message.content;
    const tokenUsage: TokenUsage = data.usage;
    
    return {
      enhancedContent,
      tokenUsage
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}
