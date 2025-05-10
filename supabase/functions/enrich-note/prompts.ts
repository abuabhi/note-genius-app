
import { EnhancementFunction } from './types';

export const enhancementPrompts: Record<EnhancementFunction, string> = {
  'summarize': `Please provide a concise summary of the following note content: 
    
    Note Title: {noteTitle}
    
    Content: 
    {noteContent}
    
    Create a clear and comprehensive summary that captures the main ideas and key points.`,
  
  'extract-key-points': `Please extract the key points from the following note content:
    
    Note Title: {noteTitle}
    
    Content: 
    {noteContent}
    
    Format the key points as a bulleted list, identifying the most important information and concepts.`,
  
  'generate-questions': `Based on the following study note, generate a set of study questions that could be used for review:
    
    Note Title: {noteTitle}
    
    Content: 
    {noteContent}
    
    Create 5-10 thoughtful questions that test understanding of the main concepts covered in this note.`,
  
  'improve-clarity': `Please rewrite the following note to improve clarity and readability:
    
    Note Title: {noteTitle}
    
    Content: 
    {noteContent}
    
    Enhance the structure, fix any grammar or spelling issues, and make the content more clear and understandable while preserving all information.`,
  
  'convert-to-markdown': `Convert the following note content to properly formatted Markdown:
    
    Note Title: {noteTitle}
    
    Content: 
    {noteContent}
    
    Use appropriate Markdown formatting including headers, lists, emphasis, and other elements as needed to create a well-structured document.`,
  
  'fix-spelling-grammar': `Please fix any spelling and grammar errors in the following note:
    
    Note Title: {noteTitle}
    
    Content: 
    {noteContent}
    
    Correct all spelling mistakes, grammatical errors, and improve punctuation while preserving the original meaning and content.`
};

export const createPrompt = (enhancementType: EnhancementFunction, noteTitle: string, noteContent: string): string => {
  if (!enhancementPrompts[enhancementType]) {
    throw new Error(`Unknown enhancement type: ${enhancementType}`);
  }
  
  return enhancementPrompts[enhancementType]
    .replace('{noteTitle}', noteTitle)
    .replace('{noteContent}', noteContent);
};
