
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
Extract the most important facts, concepts, and ideas from this note and present them as a clean Markdown bullet list. 

IMPORTANT: Format your response EXACTLY as follows:
- Each key point must start with "- " (dash followed by space)
- Each key point must be on its own separate line
- No extra formatting or numbering
- No sub-bullets or indentation
- Each bullet point should be one complete idea

Each key point should be:
- A single, focused concept or fact
- Written as a short, clear statement
- Direct and concise
- One idea per bullet point only

Example format:
- First key point here
- Second key point here
- Third key point here

Make sure each line starts with "- " and contains only one key concept. Do not use any other bullet formats like * or numbers.
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
