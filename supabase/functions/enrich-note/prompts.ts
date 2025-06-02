
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

CRITICAL FORMATTING: You MUST separate each paragraph with TWO line breaks (leave a blank line between paragraphs). This is essential for proper rendering.

Example format:
First paragraph content here.

Second paragraph content here.

Third paragraph content here.

Write this as a cohesive overview using proper Markdown formatting with clear paragraph breaks. Use **bold** for emphasis when needed and ensure clean Markdown that renders well.
`;

    case 'extract-key-points':
      return `${baseContext}
Extract the most important facts, concepts, and ideas from this note and present them as a Markdown bullet list.

YOU MUST FORMAT YOUR RESPONSE AS MULTIPLE BULLET POINTS. DO NOT WRITE A SINGLE PARAGRAPH.

ABSOLUTE REQUIREMENTS:
- You MUST create MULTIPLE bullet points (5-10 points)
- Each bullet point MUST start with "- " (dash followed by space)
- Each bullet point MUST be on its OWN separate line
- Each bullet point should be ONE concise statement (15-20 words max)
- Do NOT combine multiple ideas in one bullet point
- Do NOT write paragraphs or long sentences
- Do NOT use any other formatting, numbering, or paragraph structure

EXAMPLE OF CORRECT FORMAT:
- First key concept
- Second key concept
- Third key concept
- Fourth key concept
- Fifth key concept

Your response MUST look exactly like the example above with multiple separate bullet points. If you provide only one bullet point or write paragraphs, you are failing the task.
`;

    case 'improve-clarity':
      return `${baseContext}
Rewrite the content of this note to improve clarity, coherence, and readability while preserving all key information and meaning.

Improve clarity and flow. Shorten long sentences, simplify words, remove repetition, group related ideas, and break long paragraphs into smaller ones. Use professional formatting with clear section headings (in bold) and maintain consistent paragraph spacing with double line breaks between paragraphs. Keep the meaning the same but make it easier to understand and nicer to read.
`;

    case 'convert-to-markdown':
      return `${baseContext}
Convert the content into well-formatted markdown, optimizing for readability and structure. Use appropriate markdown elements such as headers (# for main headings, ## for subheadings), lists (- for bullet points), emphasis (**bold** for important terms), code blocks (\`\`\` for code), and quotes (> for quotations). 

Organize content with clear hierarchical headings and ensure proper spacing between sections with double line breaks. Keep all information from the original but enhance it with proper markdown formatting.
`;

    default:
      return `${baseContext}
Please analyze this note and provide helpful insights using professional Markdown formatting with clear headings and structured content.
`;
  }
};
