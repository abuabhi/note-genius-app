
import type { TokenUsage } from './types.ts';

export const callOpenAI = async (prompt: string, apiKey: string): Promise<{ enhancedContent: string; tokenUsage?: TokenUsage }> => {
  console.log('Calling OpenAI API...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    let enhancedContent = data.choices[0].message.content;
    
    // Post-processing: Ensure improve-clarity responses have proper markers
    if (prompt.includes('improve-clarity') || prompt.includes('CRITICAL MARKING REQUIREMENT')) {
      enhancedContent = ensureEnhancementMarkers(enhancedContent);
    }

    console.log('OpenAI API response received');
    
    const tokenUsage = data.usage ? {
      promptTokens: data.usage.prompt_tokens || 0,
      completionTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0
    } : undefined;

    return {
      enhancedContent,
      tokenUsage
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

/**
 * Ensures that improved content has proper enhancement markers
 * This is a fallback in case the AI doesn't follow the marking instructions
 */
function ensureEnhancementMarkers(content: string): string {
  // If content already has markers, return as-is
  if (content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]')) {
    return content;
  }
  
  // Split content into lines to identify original vs enhanced content
  const lines = content.split('\n');
  let processedContent = '';
  let inEnhancedSection = false;
  let originalContentEnded = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect if we're starting enhanced content (headers, detailed explanations, etc.)
    const isEnhancedContent = line.startsWith('##') || 
                             line.startsWith('###') ||
                             (line.startsWith('**') && line.includes('**')) ||
                             line.includes('Study Tip') ||
                             line.includes('Real-World') ||
                             line.includes('Applications') ||
                             line.includes('Understanding') ||
                             (originalContentEnded && line.length > 50);
    
    // If this looks like original content and we haven't marked it as ended
    if (!originalContentEnded && !isEnhancedContent && line.length > 0 && line.length < 200) {
      processedContent += lines[i] + '\n';
      // Mark that original content has ended after the first substantial paragraph
      if (i > 0 && lines[i + 1] && lines[i + 1].trim() === '') {
        originalContentEnded = true;
      }
    } else {
      // This is enhanced content
      if (!inEnhancedSection && isEnhancedContent) {
        processedContent += '\n[AI_ENHANCED]\n';
        inEnhancedSection = true;
      }
      processedContent += lines[i] + '\n';
    }
  }
  
  // Close the enhanced section if it was opened
  if (inEnhancedSection) {
    processedContent += '[/AI_ENHANCED]';
  }
  
  return processedContent.trim();
}
