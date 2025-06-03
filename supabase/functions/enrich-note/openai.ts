
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
    
    // Post-processing: Ensure improve-clarity responses have proper inline markers
    if (prompt.includes('improve-clarity') || prompt.includes('CRITICAL INLINE ENHANCEMENT RULES')) {
      enhancedContent = ensureInlineEnhancementMarkers(enhancedContent, prompt);
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
 * Ensures that improved content has proper inline enhancement markers
 * This is a fallback in case the AI doesn't follow the inline marking instructions
 */
function ensureInlineEnhancementMarkers(content: string, originalPrompt: string): string {
  // If content already has markers, validate their placement
  if (content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]')) {
    console.log('Content already has enhancement markers, validating inline placement...');
    return validateInlineMarkerPlacement(content);
  }
  
  console.log('Content missing enhancement markers, adding intelligent inline marking...');
  
  // Extract original content from the prompt to identify what's new
  const originalContentMatch = originalPrompt.match(/The following is a note titled[^:]*:\s*(.*?)\s*You are an educational AI assistant/s);
  if (!originalContentMatch) {
    console.log('Could not extract original content, applying intelligent inline marking...');
    return addIntelligentInlineMarkers(content);
  }
  
  const originalContent = originalContentMatch[1].trim();
  console.log('Original content extracted for comparison, length:', originalContent.length);
  
  // Apply smart inline content comparison and marking
  return compareAndMarkInlineEnhancements(content, originalContent);
}

/**
 * Validates that existing markers are placed inline rather than in large blocks
 */
function validateInlineMarkerPlacement(content: string): string {
  // Split by enhancement blocks to analyze their placement
  const parts = content.split(/(\[AI_ENHANCED\].*?\[\/AI_ENHANCED\])/gs);
  let improvedContent = '';
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.match(/\[AI_ENHANCED\](.*?)\[\/AI_ENHANCED\]/s)) {
      // This is an enhanced block - check if it's too large or misplaced
      const enhancedText = part.replace(/\[AI_ENHANCED\](.*?)\[\/AI_ENHANCED\]/s, '$1').trim();
      
      // If the enhanced block is very large (more than 500 chars), it might be misplaced
      if (enhancedText.length > 500) {
        console.log('Found large enhanced block, may need repositioning');
      }
      
      improvedContent += part;
    } else {
      // This is original content
      improvedContent += part;
    }
  }
  
  return improvedContent;
}

/**
 * Compares enhanced content with original and marks new additions inline
 */
function compareAndMarkInlineEnhancements(enhancedContent: string, originalContent: string): string {
  // Split content into sentences for better inline comparison
  const enhancedSentences = enhancedContent.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const originalSentences = originalContent.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  let result = '';
  let originalIndex = 0;
  
  for (let i = 0; i < enhancedSentences.length; i++) {
    const enhancedSentence = enhancedSentences[i].trim();
    
    // Check if this sentence matches original content
    let isOriginalContent = false;
    
    if (originalIndex < originalSentences.length) {
      const originalSentence = originalSentences[originalIndex].trim();
      
      // Check for similarity
      if (calculateSentenceSimilarity(enhancedSentence, originalSentence) > 0.7) {
        isOriginalContent = true;
        originalIndex++;
      }
    }
    
    if (isOriginalContent) {
      // This is original content - add it as-is
      result += enhancedSentence + ' ';
    } else {
      // This is enhanced content - mark it and place it inline
      if (isEnhancedSentence(enhancedSentence)) {
        result += '\n\n[AI_ENHANCED]\n' + enhancedSentence + '\n[/AI_ENHANCED]\n\n';
      } else {
        result += enhancedSentence + ' ';
      }
    }
  }
  
  return result.trim();
}

/**
 * Calculates similarity between two sentences
 */
function calculateSentenceSimilarity(sentence1: string, sentence2: string): number {
  const words1 = sentence1.toLowerCase().split(/\s+/);
  const words2 = sentence2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
}

/**
 * Identifies if a sentence looks like enhanced educational content
 */
function isEnhancedSentence(sentence: string): boolean {
  return sentence.includes('**') || 
         sentence.includes('###') ||
         sentence.includes('##') ||
         sentence.startsWith('- ') ||
         sentence.includes('Study Tip') ||
         sentence.includes('Real-World') ||
         sentence.includes('Example:') ||
         sentence.includes('Remember:') ||
         sentence.includes('Understanding') ||
         sentence.includes('This means') ||
         sentence.includes('In other words') ||
         sentence.length > 100; // Longer explanatory sentences
}

/**
 * Fallback method to add inline markers to content that appears to be enhanced
 */
function addIntelligentInlineMarkers(content: string): string {
  const paragraphs = content.split('\n\n');
  let result = '';
  let hasOriginalContent = false;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    
    if (!paragraph) continue;
    
    // Check if this looks like original student content
    const looksLikeOriginal = isLikelyOriginalStudentContent(paragraph);
    
    if (looksLikeOriginal) {
      // This looks like original content
      result += paragraph + '\n\n';
      hasOriginalContent = true;
    } else if (hasOriginalContent && isEnhancedContent(paragraph)) {
      // This looks like enhanced content and we've seen original content
      result += '[AI_ENHANCED]\n' + paragraph + '\n[/AI_ENHANCED]\n\n';
    } else {
      // Uncertain - add as-is for now
      result += paragraph + '\n\n';
    }
  }
  
  return result.trim();
}

/**
 * Identifies content that looks like original student writing
 */
function isLikelyOriginalStudentContent(text: string): boolean {
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
  
  const hasInformalLanguage = informalPatterns.some(pattern => pattern.test(text));
  const isSimpleStructure = text.length < 200 && !text.includes('**') && !text.includes('##');
  
  return hasInformalLanguage || isSimpleStructure;
}

/**
 * Identifies if text looks like enhanced educational content
 */
function isEnhancedContent(text: string): boolean {
  return text.startsWith('##') || 
         text.startsWith('###') ||
         text.includes('**') ||
         text.includes('Study Tip') ||
         text.includes('Real-World') ||
         text.includes('Applications') ||
         text.includes('Understanding') ||
         text.includes('Example:') ||
         text.includes('Remember:') ||
         text.includes('Key Point:') ||
         text.includes('Important:') ||
         text.includes('Note:') ||
         (text.startsWith('-') && text.length > 50);
}
