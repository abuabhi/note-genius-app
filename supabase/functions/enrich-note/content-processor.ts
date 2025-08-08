/**
 * STANDARDIZED CONTENT PROCESSING FOR LARGE CONTENT
 * 
 * This module handles content processing with proper token management,
 * chunking strategies, and standardized formatting for all enhancement types.
 */

import { EnhancementFunction, TokenUsage } from './types.ts';
import { createPrompt, getTokenLimit, getModel } from './prompts.ts';

/**
 * Estimate tokens from text (rough approximation: 1 token ≈ 4 characters)
 */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Smart content chunking that respects natural boundaries
 */
export const chunkContent = (content: string, maxChunkSize: number = 12000): string[] => {
  if (content.length <= maxChunkSize) {
    return [content];
  }
  
  const chunks: string[] = [];
  let currentPosition = 0;
  
  while (currentPosition < content.length) {
    let chunkEnd = Math.min(currentPosition + maxChunkSize, content.length);
    
    // Try to break at natural boundaries to preserve context
    if (chunkEnd < content.length) {
      // Look for paragraph breaks first (best boundary)
      const lastParagraph = content.lastIndexOf('\n\n', chunkEnd);
      if (lastParagraph > currentPosition + maxChunkSize * 0.6) {
        chunkEnd = lastParagraph + 2;
      } else {
        // Look for sentence boundaries
        const lastSentence = content.lastIndexOf('.', chunkEnd);
        if (lastSentence > currentPosition + maxChunkSize * 0.7) {
          chunkEnd = lastSentence + 1;
        } else {
          // Fallback to word boundaries
          const lastSpace = content.lastIndexOf(' ', chunkEnd);
          if (lastSpace > currentPosition + maxChunkSize * 0.8) {
            chunkEnd = lastSpace;
          }
        }
      }
    }
    
    chunks.push(content.substring(currentPosition, chunkEnd).trim());
    currentPosition = chunkEnd;
  }
  
  return chunks;
};

/**
 * Process large content in chunks with optimal settings per enhancement type
 */
export const processLargeContentStandardized = async (
  content: string,
  enhancementType: EnhancementFunction,
  title: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<{ enhancedContent: string; tokenUsage: TokenUsage }> => {
  
  console.log(`📚 Processing large content (${content.length} chars) for ${enhancementType}`);
  
  // Get standardized settings for this enhancement type
  const maxTokens = getTokenLimit(enhancementType);
  const model = getModel(enhancementType);
  
  // Determine optimal chunk size based on enhancement type
  const chunkSizes = {
    'summarize': 8000,
    'extract-key-points': 6000,
    'generate-questions': 10000,
    'convert-to-markdown': 8000,
    'improve-clarity': 12000,
    'enrich-note': 15000
  };
  
  const chunkSize = chunkSizes[enhancementType] || 8000;
  const chunks = chunkContent(content, chunkSize);
  
  console.log(`🔄 Split into ${chunks.length} chunks for ${enhancementType}`);
  
  const results: string[] = [];
  let totalTokenUsage: TokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`🔍 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
    
    // Create standardized prompt for this chunk
    const basePrompt = createPrompt(enhancementType, title, chunk);
    
    // Add chunk context if multiple chunks
    const chunkPrompt = chunks.length > 1 
      ? `${basePrompt}\n\n[Processing Part ${i + 1} of ${chunks.length} - maintain consistency with previous parts]`
      : basePrompt;
    
    const estimatedInputTokens = estimateTokens(chunkPrompt);
    const adjustedMaxTokens = Math.min(maxTokens, Math.max(300, 4000 - estimatedInputTokens));
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal,
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `You are an expert educational content enhancer specializing in ${enhancementType}. Provide consistent, high-quality output that matches the standardized format requirements. Ensure export-safe formatting for PDF/DOCX compatibility.`
            },
            {
              role: 'user',
              content: chunkPrompt
            }
          ],
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: adjustedMaxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ OpenAI API error for chunk ${i + 1}:`, response.status, errorText);
        
        // Handle token limit exceeded
        if (response.status === 400 && errorText.includes('token')) {
          console.log(`🔄 Retrying chunk ${i + 1} with reduced content...`);
          const reducedChunk = chunk.substring(0, Math.floor(chunk.length * 0.7));
          const retryPrompt = createPrompt(enhancementType, title, reducedChunk);
          
          const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            signal,
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: 'system',
                  content: `You are an expert educational content enhancer specializing in ${enhancementType}. Provide consistent, high-quality output.`
                },
                {
                  role: 'user',
                  content: retryPrompt
                }
              ],
              temperature: 0.3,
              top_p: 0.9,
              max_tokens: Math.min(adjustedMaxTokens, 800),
            }),
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            results.push(retryData.choices[0].message.content);
            
            // Track token usage
            if (retryData.usage) {
              totalTokenUsage.promptTokens += retryData.usage.prompt_tokens || 0;
              totalTokenUsage.completionTokens += retryData.usage.completion_tokens || 0;
              totalTokenUsage.totalTokens += retryData.usage.total_tokens || 0;
            }
            continue;
          }
        }
        
        throw new Error(`OpenAI API error for chunk ${i + 1}: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      results.push(data.choices[0].message.content);
      
      // Track token usage
      if (data.usage) {
        totalTokenUsage.promptTokens += data.usage.prompt_tokens || 0;
        totalTokenUsage.completionTokens += data.usage.completion_tokens || 0;
        totalTokenUsage.totalTokens += data.usage.total_tokens || 0;
      }
      
    } catch (error) {
      console.error(`❌ Error processing chunk ${i + 1}:`, error);
      throw error;
    }
  }
  
  // Combine results based on enhancement type
  const enhancedContent = combineChunkResults(results, enhancementType);
  
  console.log(`✅ Large content processing completed: ${results.length} chunks processed`);
  
  return {
    enhancedContent,
    tokenUsage: totalTokenUsage
  };
};

/**
 * Intelligently combine chunk results based on enhancement type
 */
function combineChunkResults(results: string[], enhancementType: EnhancementFunction): string {
  if (results.length === 1) {
    return results[0];
  }
  
  switch (enhancementType) {
    case 'summarize':
      // For summaries, combine sections intelligently
      return results.join('\n\n## Continued\n\n');
      
    case 'extract-key-points':
      // For key points, merge bullet lists
      const combinedPoints = results
        .map(result => result.replace(/^# Key Points\s*\n*/i, ''))
        .join('\n\n');
      return `# Key Points\n\n${combinedPoints}`;
      
    case 'generate-questions':
      // For questions, ensure sequential numbering
      let combinedQuestions = '# Top 10 Study Questions\n\n';
      let questionNumber = 1;
      
      results.forEach(result => {
        const cleanResult = result.replace(/^# Top 10 Study Questions\s*\n*/i, '');
        const questions = cleanResult.split(/## Q\d+:/);
        
        questions.forEach(question => {
          if (question.trim()) {
            combinedQuestions += `## Q${questionNumber}: ${question.trim()}\n\n`;
            questionNumber++;
          }
        });
      });
      
      return combinedQuestions;
      
    case 'convert-to-markdown':
      // For markdown conversion, preserve structure
      return results.join('\n\n---\n\n');
      
    case 'improve-clarity':
    case 'enrich-note':
      // For enriched content, maintain flow
      return results.join('\n\n');
      
    default:
      return results.join('\n\n---\n\n');
  }
}