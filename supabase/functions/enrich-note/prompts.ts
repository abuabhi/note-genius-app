
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
Please provide a concise summary of this note in proper Markdown format. Focus on creating a brief overview that:

- Presents the main ideas and central message in flowing paragraphs
- Shows how different concepts connect and relate to each other
- Retells the content in a shorter, narrative style
- Uses proper Markdown paragraph structure with smooth transitions between ideas
- Avoids bullet points or lists - write in complete sentences and paragraphs only
- Keeps the summary to about 20% of the original length

Write this as a cohesive overview using proper Markdown formatting with clear paragraph breaks. Use **bold** for emphasis when needed and ensure clean Markdown that renders well. Make sure to add proper spacing between paragraphs by using double line breaks (leave an empty line between paragraphs).
`;

    case 'extract-key-points':
      return `${baseContext}
Extract the most important facts, concepts, and ideas from this note and present them as a Markdown bullet list.

CRITICAL FORMATTING REQUIREMENTS:
- Start each key point with "- " (dash followed by space)
- Put each key point on its OWN separate line
- Do NOT write paragraphs or long sentences
- Each bullet point should be ONE concise statement
- Do NOT combine multiple ideas in one bullet point
- Use simple, direct language
- Maximum 15-20 words per bullet point

Your response should look EXACTLY like this format:
- First key concept
- Second key concept  
- Third key concept
- Fourth key concept

Extract 5-10 key points maximum. Each line must start with "- " and contain only one focused idea. Do not use any other formatting, numbering, or paragraph structure.
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
