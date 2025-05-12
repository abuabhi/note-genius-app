
import { EnhancementFunction } from './types.ts';

/**
 * Create a prompt for the OpenAI API based on the enhancement type
 */
export const createPrompt = (enhancementType: EnhancementFunction, noteTitle: string, noteContent: string): string => {
  // Base context to include in all prompts
  const baseContext = `
The following is a note titled "${noteTitle}":

${noteContent}

`;

  // Common instruction for all prompts to ensure output is in well-formatted markdown
  const markdownInstruction = `Format your response in clear, well-structured markdown. Use markdown features like headers, lists, code blocks, and emphasis where appropriate to organize the content.`;

  // Select prompt based on enhancement type
  switch (enhancementType) {
    case 'summarize':
      return `${baseContext}
Please provide a concise summary of this note. Focus on the key ideas and main points, while keeping the summary no more than 20% of the original length.

${markdownInstruction}
`;

    case 'extract-key-points':
      return `${baseContext}
Extract the key points from this note and present them as a well-organized list. Identify the most important concepts, arguments, or facts presented in the content.

${markdownInstruction}
`;

    case 'improve-clarity':
      return `${baseContext}
Rewrite the content of this note to improve clarity, coherence, and readability while preserving all key information and meaning. Fix any grammatical issues, improve sentence structure, and organize the content logically.

${markdownInstruction}
`;

    case 'convert-to-markdown':
      return `${baseContext}
Convert the content into well-formatted markdown, optimizing for readability and structure. Use appropriate markdown elements such as headers, lists, emphasis, code blocks, and quotes. Preserve all information but enhance the formatting.

${markdownInstruction}
`;

    default:
      return `${baseContext}
Please analyze this note and provide helpful insights.

${markdownInstruction}
`;
  }
};
