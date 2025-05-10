
import { EnhancementFunction } from './types';

export function createPrompt(enhancementType: EnhancementFunction, noteTitle: string, noteContent: string): string {
  const basePrompt = `TITLE: ${noteTitle}\n\nCONTENT:\n${noteContent}`;
  
  switch (enhancementType) {
    case 'summarize':
      return `${basePrompt}\n\nPlease create a concise summary of this note in 2-3 sentences. Focus on the main points and key information. The summary should be informative but brief (max 150 characters).`;
      
    case 'extract-key-points':
      return `${basePrompt}\n\nPlease extract the key points from this note and format them as a bulleted list. Each point should be concise and focus on important information. Include a maximum of 7 key points.`;
      
    case 'generate-questions':
      return `${basePrompt}\n\nPlease generate 5 study questions based on this note. The questions should test understanding of the key concepts and be suitable for self-testing or review. Format as a numbered list.`;
      
    case 'improve-clarity':
      return `${basePrompt}\n\nPlease rewrite this note to improve clarity and readability. Maintain all the original information but organize it better, use clearer language, and fix any grammar or spelling issues. The goal is to make the content easier to understand.`;
      
    case 'convert-to-markdown':
      return `${basePrompt}\n\nPlease convert this note to well-formatted Markdown. Use appropriate Markdown syntax for headings, lists, emphasis, links, and other elements. Organize the content logically and make it easy to read.`;
      
    case 'fix-spelling-grammar':
      return `${basePrompt}\n\nPlease fix any spelling or grammatical errors in this note without changing its meaning or content structure. Only make corrections to improve correctness, not to change style or content.`;
      
    default:
      return `${basePrompt}\n\nPlease enhance this note to make it more useful for studying.`;
  }
}
