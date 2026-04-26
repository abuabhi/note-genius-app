import { callOpenAI } from './openai.ts';
import { createPrompt } from './prompts.ts';
import type { EnhancementFunction, TokenUsage } from './types.ts';

/**
 * Process large content by chunking it into manageable pieces with overlap and context
 */
export const processLargeContent = async (
  content: string,
  enhancementType: EnhancementFunction,
  noteTitle: string,
  openaiApiKey: string,
  signal?: AbortSignal
): Promise<{ enhancedContent: string; tokenUsage?: TokenUsage }> => {
  console.log(`🔄 Processing large content: ${content.length} characters`);
  
  // Use optimized chunk size for better token management (15,000 chars ≈ 4,000 tokens)
  const chunks = smartChunkContentWithContext(content, 15000);
  console.log(`📦 Split into ${chunks.length} chunks with context overlap`);
  
  let allEnhancedChunks: string[] = [];
  let totalTokenUsage: TokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };
  
  // Process each chunk with enhanced context
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`🔄 Processing chunk ${i + 1}/${chunks.length} (${chunk.chunkContent.length} chars)`);
    
    try {
      const prompt = createChunkedPrompt(enhancementType, noteTitle, chunk, i + 1, chunks.length);
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
      throw new Error(`Failed to process content chunk ${i + 1}: ${(error as Error)?.message ?? String(error)}`);
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
 * Split content into chunks with context and overlap for better continuity
 */
interface ChunkWithContext {
  chunkContent: string;
  sectionTitle: string;
  chunkIndex: number;
  totalChunks: number;
  previousContext?: string;
}

function smartChunkContentWithContext(content: string, maxChunkSize: number): ChunkWithContext[] {
  const chunks: ChunkWithContext[] = [];
  
  // Extract any existing headings to maintain document structure
  const headingMatches = content.match(/^#+\s+.+$/gm) || [];
  
  // First, try to split by headings if they exist
  if (headingMatches.length > 1) {
    const headingSections = content.split(/(?=^#+\s+.+$)/gm).filter(section => section.trim());
    
    for (let i = 0; i < headingSections.length; i++) {
      const section = headingSections[i];
      const sectionTitleMatch = section.match(/^#+\s+(.+)$/m);
      const sectionTitle = sectionTitleMatch ? sectionTitleMatch[1].trim() : `Section ${i + 1}`;
      
      if (section.length <= maxChunkSize) {
        chunks.push({
          chunkContent: section.trim(),
          sectionTitle,
          chunkIndex: chunks.length + 1,
          totalChunks: 0, // Will be updated later
          previousContext: chunks.length > 0 ? getLastSentence(chunks[chunks.length - 1].chunkContent) : undefined
        });
      } else {
        // Split large section further
        const subChunks = splitLargeSectionWithContext(section, maxChunkSize, sectionTitle);
        chunks.push(...subChunks);
      }
    }
  } else {
    // No clear headings, split by paragraphs with context
    const paragraphChunks = splitByParagraphsWithContext(content, maxChunkSize);
    chunks.push(...paragraphChunks);
  }
  
  // Update total chunks count
  chunks.forEach((chunk, index) => {
    chunk.chunkIndex = index + 1;
    chunk.totalChunks = chunks.length;
    if (index > 0) {
      chunk.previousContext = getLastSentence(chunks[index - 1].chunkContent);
    }
  });
  
  return chunks;
}

/**
 * Split a large section into smaller chunks with context
 */
function splitLargeSectionWithContext(section: string, maxChunkSize: number, sectionTitle: string): ChunkWithContext[] {
  const chunks: ChunkWithContext[] = [];
  const paragraphs = section.split('\n\n');
  
  let currentChunk = '';
  let subChunkIndex = 1;
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        chunkContent: currentChunk.trim(),
        sectionTitle: `${sectionTitle} (Part ${subChunkIndex})`,
        chunkIndex: 0, // Will be updated later
        totalChunks: 0, // Will be updated later
      });
      currentChunk = paragraph + '\n\n';
      subChunkIndex++;
    } else {
      currentChunk += paragraph + '\n\n';
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push({
      chunkContent: currentChunk.trim(),
      sectionTitle: subChunkIndex > 1 ? `${sectionTitle} (Part ${subChunkIndex})` : sectionTitle,
      chunkIndex: 0, // Will be updated later
      totalChunks: 0, // Will be updated later
    });
  }
  
  return chunks;
}

/**
 * Split content by paragraphs when no clear headings exist
 */
function splitByParagraphsWithContext(content: string, maxChunkSize: number): ChunkWithContext[] {
  const chunks: ChunkWithContext[] = [];
  const paragraphs = content.split('\n\n');
  
  let currentChunk = '';
  let chunkIndex = 1;
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        chunkContent: currentChunk.trim(),
        sectionTitle: `Content Part ${chunkIndex}`,
        chunkIndex: 0, // Will be updated later
        totalChunks: 0, // Will be updated later
      });
      currentChunk = paragraph + '\n\n';
      chunkIndex++;
    } else {
      currentChunk += paragraph + '\n\n';
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push({
      chunkContent: currentChunk.trim(),
      sectionTitle: `Content Part ${chunkIndex}`,
      chunkIndex: 0, // Will be updated later
      totalChunks: 0, // Will be updated later
    });
  }
  
  return chunks;
}

/**
 * Extract the last sentence from content for context overlap
 */
function getLastSentence(content: string): string {
  const sentences = content.split(/(?<=[.!?])\s+/);
  return sentences.length > 0 ? sentences[sentences.length - 1].trim() : '';
}

/**
 * Create an optimized prompt for chunked content processing
 */
function createChunkedPrompt(
  enhancementType: EnhancementFunction, 
  noteTitle: string, 
  chunk: ChunkWithContext, 
  chunkIndex: number, 
  totalChunks: number
): string {
  const contextInfo = chunk.previousContext 
    ? `\n**Previous context**: ${chunk.previousContext}\n\n`
    : '';
  
  const chunkInfo = totalChunks > 1 
    ? `This is part ${chunkIndex} of ${totalChunks} from the document "${noteTitle}". Section: "${chunk.sectionTitle}".`
    : '';
  
  if (enhancementType === 'enrich-note') {
    return `You are an expert educational content enhancer. Your task is to expand and enrich the following note content by adding 50-70% more educational value while maintaining the original structure and clarity.

**Document**: ${noteTitle}
${chunkInfo}

${contextInfo}**Content to enhance**:
${chunk.chunkContent}

**Instructions**:
1. **Preserve all original content** - do not delete or significantly rewrite existing text
2. **Add 50-70% more content** by inserting educational enhancements inline
3. **Mark all additions** with [AI_ENHANCED]...[/AI_ENHANCED] tags
4. **Focus on**: explanations, examples, context, connections, study tips, analogies, and clarifications
5. **Maintain structure** - keep headings, lists, and formatting intact
6. **Use proper Markdown** formatting for readability
7. **Ensure continuity** - if this is a middle chunk, connect smoothly with the previous context

**Enhancement types to include**:
- Detailed explanations of concepts
- Real-world examples and applications
- Memory aids and study techniques
- Historical context or background
- Connections to related topics
- Step-by-step breakdowns
- Common misconceptions and clarifications

Return only the enhanced content with clear [AI_ENHANCED] markers around all additions.`;
  }
  
  // For other enhancement types, use simpler chunked approach
  return `Document: ${noteTitle}
${chunkInfo}

${contextInfo}Content:
${chunk.chunkContent}

Please process this content for: ${enhancementType}`;
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
 * Combine enriched note chunks maintaining structure and removing overlap
 */
function combineForEnrichedNote(chunks: string[]): string {
  if (chunks.length === 1) {
    return chunks[0];
  }
  
  let combinedContent = '';
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    if (i === 0) {
      // First chunk - include everything
      combinedContent = chunk;
    } else {
      // Subsequent chunks - remove potential overlap
      const cleanedChunk = removePotentialOverlap(chunk, combinedContent);
      combinedContent += '\n\n' + cleanedChunk;
    }
  }
  
  return combinedContent.trim();
}

/**
 * Remove potential overlap between chunks by checking for repeated sentences
 */
function removePotentialOverlap(newChunk: string, existingContent: string): string {
  const newLines = newChunk.split('\n');
  const existingLines = existingContent.split('\n');
  
  // Find where the new chunk should start by looking for the first unique line
  let startIndex = 0;
  for (let i = 0; i < Math.min(newLines.length, 5); i++) {
    const line = newLines[i].trim();
    if (line.length > 10 && !existingLines.some(existingLine => 
      existingLine.trim().includes(line) || line.includes(existingLine.trim())
    )) {
      startIndex = i;
      break;
    }
  }
  
  return newLines.slice(startIndex).join('\n').trim();
}
