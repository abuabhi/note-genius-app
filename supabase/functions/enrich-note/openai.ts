
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
  const originalContentMatch = originalPrompt.match(/The following is a note titled[^:]*:\s*(.*?)\s*You are an educational AI assistant/s);
  if (!originalContentMatch) {
    console.log('Could not extract original content, applying intelligent marking...');
    return addIntelligentMarkersToContent(content);
  }
  
  const originalContent = originalContentMatch[1].trim();
  console.log('Original content extracted for comparison, length:', originalContent.length);
  
  // Apply smart content comparison and marking
  return compareAndMarkEnhancements(content, originalContent);
}

/**
 * Compares enhanced content with original and marks new additions
 */
function compareAndMarkEnhancements(enhancedContent: string, originalContent: string): string {
  // Split content into paragraphs/sections for better comparison
  const enhancedLines = enhancedContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const originalLines = originalContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let result = '';
  let originalIndex = 0;
  let inEnhancedSection = false;
  
  for (let i = 0; i < enhancedLines.length; i++) {
    const enhancedLine = enhancedLines[i];
    
    // Check if this line matches original content
    let isOriginalContent = false;
    
    if (originalIndex < originalLines.length) {
      const originalLine = originalLines[originalIndex];
      
      // Check for exact match or high similarity
      if (enhancedLine === originalLine || 
          enhancedLine.includes(originalLine) || 
          originalLine.includes(enhancedLine) ||
          calculateSimilarity(enhancedLine, originalLine) > 0.8) {
        isOriginalContent = true;
        originalIndex++;
      }
    }
    
    // If this is original content, close any enhanced section and add the line
    if (isOriginalContent) {
      if (inEnhancedSection) {
        result += '[/AI_ENHANCED]\n\n';
        inEnhancedSection = false;
      }
      result += enhancedLine + '\n\n';
    } else {
      // This is enhanced content
      if (!inEnhancedSection && isEnhancedContent(enhancedLine)) {
        result += '[AI_ENHANCED]\n';
        inEnhancedSection = true;
      }
      result += enhancedLine + '\n\n';
    }
  }
  
  // Close any remaining enhanced section
  if (inEnhancedSection) {
    result += '[/AI_ENHANCED]';
  }
  
  return result.trim();
}

/**
 * Calculates text similarity using a simple approach
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
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
         line.includes('Key Point:') ||
         line.includes('Important:') ||
         line.includes('Note:') ||
         (line.startsWith('-') && line.length > 50); // Long bullet points are likely enhanced
}

/**
 * Fallback method to add markers to content that appears to be new
 */
function addIntelligentMarkersToContent(content: string): string {
  const lines = content.split('\n');
  let result = '';
  let inEnhancedSection = false;
  let hasAddedEnhancement = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines at the beginning
    if (!hasAddedEnhancement && trimmedLine === '') {
      result += line + '\n';
      continue;
    }
    
    // Check if this looks like original student content (informal, simple)
    const looksLikeOriginal = isLikelyOriginalStudentContent(trimmedLine);
    
    // If this looks like enhanced content and we haven't started an enhanced section
    if (!looksLikeOriginal && isEnhancedContent(trimmedLine) && !inEnhancedSection) {
      result += '[AI_ENHANCED]\n';
      inEnhancedSection = true;
      hasAddedEnhancement = true;
    }
    
    // If this looks like original content and we're in an enhanced section, close it
    if (looksLikeOriginal && inEnhancedSection) {
      result += '[/AI_ENHANCED]\n\n';
      inEnhancedSection = false;
    }
    
    result += line + '\n';
  }
  
  // Close any remaining enhanced section
  if (inEnhancedSection) {
    result += '[/AI_ENHANCED]';
  }
  
  return result.trim();
}

/**
 * Identifies content that looks like original student writing
 */
function isLikelyOriginalStudentContent(line: string): boolean {
  // Look for informal language patterns typical of student notes
  const informalPatterns = [
    /\bokay so\b/i,
    /\byeah\b/i,
    /\bguess\b/i,
    /\bkinda\b/i,
    /\bgonna\b/i,
    /\banyway\b/i,
    /\bstuff\b/i,
    /\bthing\b/i,
  ];
  
  return informalPatterns.some(pattern => pattern.test(line)) ||
         (line.length < 100 && !line.includes('**') && !line.startsWith('#'));
}
