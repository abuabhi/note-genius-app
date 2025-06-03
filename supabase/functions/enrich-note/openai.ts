
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
      enhancedContent = ensureEnhancementMarkers(enhancedContent, prompt);
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
function ensureEnhancementMarkers(content: string, originalPrompt: string): string {
  // If content already has markers, return as-is
  if (content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]')) {
    console.log('Content already has enhancement markers');
    return content;
  }
  
  console.log('Content missing enhancement markers, adding post-processing...');
  
  // Extract original content from the prompt to identify what's new
  const originalContentMatch = originalPrompt.match(/The following is a note titled[^:]*:\s*(.*?)\s*$/s);
  if (!originalContentMatch) {
    console.log('Could not extract original content, wrapping all new content');
    return addMarkersToNewContent(content);
  }
  
  const originalContent = originalContentMatch[1].trim();
  
  // Find where original content ends and new content begins
  const originalLines = originalContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const contentLines = content.split('\n');
  
  let enhancedContent = '';
  let originalContentEnded = false;
  let inEnhancedSection = false;
  let matchedOriginalLines = 0;
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    const trimmedLine = line.trim();
    
    // Check if this line matches original content
    if (!originalContentEnded && matchedOriginalLines < originalLines.length) {
      const expectedOriginalLine = originalLines[matchedOriginalLines];
      
      // If line matches original content (allowing for minor variations)
      if (trimmedLine === expectedOriginalLine || 
          trimmedLine.includes(expectedOriginalLine) || 
          expectedOriginalLine.includes(trimmedLine)) {
        enhancedContent += line + '\n';
        matchedOriginalLines++;
        
        // If we've matched all original lines, mark that original content has ended
        if (matchedOriginalLines >= originalLines.length) {
          originalContentEnded = true;
        }
        continue;
      }
    }
    
    // This is new/enhanced content
    if (originalContentEnded || isEnhancedContent(trimmedLine)) {
      if (!inEnhancedSection && trimmedLine.length > 0) {
        enhancedContent += '\n[AI_ENHANCED]\n';
        inEnhancedSection = true;
      }
      enhancedContent += line + '\n';
    } else {
      // Still processing original content
      enhancedContent += line + '\n';
    }
  }
  
  // Close the enhanced section if it was opened
  if (inEnhancedSection) {
    enhancedContent += '[/AI_ENHANCED]';
  }
  
  return enhancedContent.trim();
}

/**
 * Identifies if a line looks like enhanced content
 */
function isEnhancedContent(line: string): boolean {
  return line.startsWith('##') || 
         line.startsWith('###') ||
         line.startsWith('**') ||
         line.includes('Study Tip') ||
         line.includes('Real-World') ||
         line.includes('Applications') ||
         line.includes('Understanding') ||
         line.includes('Example:') ||
         line.includes('Remember:') ||
         (line.startsWith('-') && line.length > 50); // Long bullet points are likely enhanced
}

/**
 * Fallback method to add markers to content that appears to be new
 */
function addMarkersToNewContent(content: string): string {
  const lines = content.split('\n');
  let result = '';
  let inEnhancedSection = false;
  let foundEnhancedContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines at the beginning
    if (!foundEnhancedContent && trimmedLine === '') {
      result += line + '\n';
      continue;
    }
    
    // Detect enhanced content
    if (isEnhancedContent(trimmedLine) || 
        (i > 0 && foundEnhancedContent && trimmedLine.length > 0)) {
      
      if (!inEnhancedSection) {
        result += '\n[AI_ENHANCED]\n';
        inEnhancedSection = true;
      }
      foundEnhancedContent = true;
    }
    
    result += line + '\n';
  }
  
  if (inEnhancedSection) {
    result += '[/AI_ENHANCED]';
  }
  
  return result.trim();
}
