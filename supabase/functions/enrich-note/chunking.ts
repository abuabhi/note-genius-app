import { callOpenAI } from './openai.ts';
import { createPrompt } from './prompts.ts';
import type { EnhancementFunction, TokenUsage } from './types.ts';

/**
 * Process large content by chunking it into manageable pieces
 */
export const processLargeContent = async (
  content: string,
  enhancementType: EnhancementFunction,
  noteTitle: string,
  openaiApiKey: string,
  signal?: AbortSignal
): Promise<{ enhancedContent: string; tokenUsage?: TokenUsage }> => {
  console.log(`🔄 Processing large content: ${content.length} characters`);
  
  // Split content into chunks of ~20,000 characters at logical boundaries
  const chunks = smartChunkContent(content, 20000);
  console.log(`📦 Split into ${chunks.length} chunks`);
  
  let allEnhancedChunks: string[] = [];
  let totalTokenUsage: TokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };
  
  // Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`🔄 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
    
    try {
      const chunkTitle = `${noteTitle} (Part ${i + 1}/${chunks.length})`;
      const prompt = createPrompt(enhancementType, chunkTitle, chunk);
      const result = await callOpenAI(prompt, openaiApiKey, signal);
      
      allEnhancedChunks.push(result.enhancedContent);
      
      // Aggregate token usage
      if (result.tokenUsage) {
        totalTokenUsage.promptTokens += result.tokenUsage.promptTokens;
        totalTokenUsage.completionTokens += result.tokenUsage.completionTokens;
        totalTokenUsage.totalTokens += result.tokenUsage.totalTokens;
      }
      
      console.log(`✅ Chunk ${i + 1} processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing chunk ${i + 1}:`, error);
      throw new Error(`Failed to process content chunk ${i + 1}: ${error.message}`);
    }
  }
  
  // Combine enhanced chunks intelligently based on enhancement type
  const combinedContent = combineEnhancedChunks(allEnhancedChunks, enhancementType);
  
  console.log(`✅ Large content processing complete: ${combinedContent.length} chars output`);
  
  return {
    enhancedContent: combinedContent,
    tokenUsage: totalTokenUsage
  };
};

/**
 * Split content into chunks at logical boundaries (paragraphs, sentences)
 */
function smartChunkContent(content: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  
  // First, try to split by double newlines (paragraphs)
  const paragraphs = content.split('\n\n');
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed limit, save current chunk
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph + '\n\n';
    } else {
      currentChunk += paragraph + '\n\n';
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  // If we still have chunks that are too large, split by sentences
  const finalChunks: string[] = [];
  
  for (const chunk of chunks) {
    if (chunk.length <= maxChunkSize) {
      finalChunks.push(chunk);
    } else {
      // Split large chunk by sentences
      const sentences = chunk.split(/(?<=[.!?])\s+/);
      let currentSentenceChunk = '';
      
      for (const sentence of sentences) {
        if (currentSentenceChunk.length + sentence.length > maxChunkSize && currentSentenceChunk.length > 0) {
          finalChunks.push(currentSentenceChunk.trim());
          currentSentenceChunk = sentence + ' ';
        } else {
          currentSentenceChunk += sentence + ' ';
        }
      }
      
      if (currentSentenceChunk.trim().length > 0) {
        finalChunks.push(currentSentenceChunk.trim());
      }
    }
  }
  
  return finalChunks;
}

/**
 * Combine enhanced chunks based on the enhancement type
 */
function combineEnhancedChunks(chunks: string[], enhancementType: EnhancementFunction): string {
  switch (enhancementType) {
    case 'summarize':
      return combineForSummary(chunks);
    
    case 'extract-key-points':
      return combineForKeyPoints(chunks);
    
    case 'generate-questions':
      return combineForQuestions(chunks);
    
    case 'convert-to-markdown':
      return combineForMarkdown(chunks);
    
    case 'enrich-note':
      return combineForEnrichedNote(chunks);
    
    default:
      return chunks.join('\n\n---\n\n');
  }
}

/**
 * Combine summary chunks into a cohesive summary
 */
function combineForSummary(chunks: string[]): string {
  let combinedSummary = '# Summary\n\n';
  
  chunks.forEach((chunk, index) => {
    // Remove individual "# Summary" headers from chunks
    const cleanChunk = chunk.replace(/^# Summary\s*\n+/i, '');
    
    if (chunks.length > 1) {
      combinedSummary += `## Part ${index + 1}\n\n${cleanChunk}\n\n`;
    } else {
      combinedSummary += cleanChunk;
    }
  });
  
  return combinedSummary.trim();
}

/**
 * Combine key points into a unified list
 */
function combineForKeyPoints(chunks: string[]): string {
  let combinedPoints = '# Key Points\n\n';
  let pointCounter = 1;
  
  chunks.forEach((chunk, chunkIndex) => {
    // Remove individual "# Key Points" headers
    const cleanChunk = chunk.replace(/^# Key Points\s*\n+/i, '');
    
    // Extract bullet points and renumber them
    const lines = cleanChunk.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('- ')) {
        combinedPoints += `- ${line.trim().substring(2)}\n\n`;
      } else if (line.trim().startsWith('##')) {
        // Keep section headers
        combinedPoints += `${line}\n\n`;
      } else if (line.trim() && !line.includes('#')) {
        // Keep other descriptive content
        combinedPoints += `${line}\n\n`;
      }
    }
  });
  
  return combinedPoints.trim();
}

/**
 * Combine questions chunks into a unified Q&A format
 */
function combineForQuestions(chunks: string[]): string {
  let combinedQuestions = '# Top 10 Questions\n\n';
  let questionCounter = 1;
  const allQuestions: string[] = [];
  
  // Extract questions from all chunks
  chunks.forEach((chunk) => {
    const qaPairs = chunk.match(/\*\*Q\d+:\*\*.*?\n\*\*A\d+:\*\*.*?(?=\n\*\*Q\d+:\*\*|\n\n|$)/gs) || [];
    allQuestions.push(...qaPairs);
  });
  
  // Take the first 10 questions and renumber them
  const finalQuestions = allQuestions.slice(0, 10);
  
  finalQuestions.forEach((qa, index) => {
    // Remove old numbering and add new numbering
    const cleanQA = qa.replace(/\*\*Q\d+:\*\*/g, `**Q${questionCounter}:**`)
                     .replace(/\*\*A\d+:\*\*/g, `**A${questionCounter}:**`);
    combinedQuestions += `${cleanQA}\n\n`;
    questionCounter++;
  });
  
  return combinedQuestions.trim();
}

/**
 * Combine markdown chunks into a unified document
 */
function combineForMarkdown(chunks: string[]): string {
  let combinedMarkdown = '';
  
  chunks.forEach((chunk, index) => {
    if (index > 0) {
      combinedMarkdown += '\n\n---\n\n';
    }
    combinedMarkdown += chunk;
  });
  
  return combinedMarkdown.trim();
}

/**
 * Combine enriched note chunks maintaining structure
 */
function combineForEnrichedNote(chunks: string[]): string {
  return chunks.join('\n\n');
}
