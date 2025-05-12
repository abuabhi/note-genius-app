
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

  // Select prompt based on enhancement type
  switch (enhancementType) {
    case 'summarize':
      return `${baseContext}
Please provide a concise summary of this note. Focus on the key ideas and main points, while keeping the summary no more than 20% of the original length.

Present the summary in professional Markdown style with bolded section headings, no excessive blank lines between bullets, keep bullets grouped tightly under the heading, and minimize visual clutter. Ensure a clean compact flow, only using spacing where absolutely necessary for readability.
`;

    case 'extract-key-points':
      return `${baseContext}
Extract the key points from this note and present them as a well-organized list.

Create Key Points in clean Markdown. Use one main heading, tight bullet points, bold subheadings when needed, no random blank lines, and no paragraph breaks between bullet points. Organize key points by topic if applicable.
`;

    case 'improve-clarity':
      return `${baseContext}
Rewrite the content of this note to improve clarity, coherence, and readability while preserving all key information and meaning.

Improve clarity and flow. Shorten long sentences, simplify words, remove repetition, group related ideas, and break long paragraphs into smaller ones. Use professional formatting with clear section headings (in bold) and maintain consistent paragraph spacing. Keep the meaning the same but make it easier to understand and nicer to read.
`;

    case 'convert-to-markdown':
      return `${baseContext}
Convert the content into well-formatted markdown, optimizing for readability and structure. Use appropriate markdown elements such as headers (# for main headings, ## for subheadings), lists (- for bullet points), emphasis (**bold** for important terms), code blocks (\`\`\` for code), and quotes (> for quotations). 

Organize content with clear hierarchical headings and ensure proper spacing between sections. Keep all information from the original but enhance it with proper markdown formatting.
`;

    default:
      return `${baseContext}
Please analyze this note and provide helpful insights using professional Markdown formatting with clear headings and structured content.
`;
  }
};
