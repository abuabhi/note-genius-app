
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
Please provide a concise summary of this note in paragraph form. Focus on creating a brief overview that:

- Presents the main ideas and central message in flowing paragraphs
- Shows how different concepts connect and relate to each other
- Retells the content in a shorter, narrative style
- Uses proper paragraph structure with smooth transitions between ideas
- Avoids bullet points or lists - write in complete sentences and paragraphs only
- Keeps the summary to about 20% of the original length

Write this as a cohesive overview that someone could read to quickly understand the main content and how the ideas flow together.
`;

    case 'extract-key-points':
      return `${baseContext}
Extract the most important facts, concepts, and ideas from this note and present them as a clean bullet list. Each key point should be:

- A single, focused concept or fact
- Written as a short, clear statement
- Presented as individual bullet points (use - for bullets)
- One idea per bullet point
- No paragraph explanations or narrative flow
- No sub-bullets or complex formatting
- Direct and concise

Format your response as a simple bulleted list with each key concept on its own line. Think of these as the essential checkpoints someone needs to remember from this material.
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
