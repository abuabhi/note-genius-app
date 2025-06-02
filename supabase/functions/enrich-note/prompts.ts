
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
Please provide a concise summary of this note in proper Markdown format.

Requirements:
- Write in flowing paragraphs with complete sentences
- Each paragraph should be separated by a blank line
- Focus on the main ideas and how they connect
- Keep the summary to about 20% of the original length
- Use **bold** for key terms when appropriate

Write a cohesive overview using proper Markdown paragraph formatting.
`;

    case 'extract-key-points':
      return `${baseContext}
Extract the most important facts, concepts, and ideas from this note.

Format as a Markdown bullet list with these requirements:
- Start each point with "- " (dash followed by space)
- Each point must be on its own separate line
- Create 5-8 key points minimum
- Each point should be one clear, concise statement
- Keep points focused and specific

Example format:
- First key concept here
- Second key concept here
- Third key concept here
- Fourth key concept here
- Fifth key concept here

Create multiple bullet points exactly like the example above.
`;

    case 'improve-clarity':
      return `${baseContext}
You are an educational AI assistant helping students understand complex topics better. Your task is to significantly enhance this note by expanding concepts, adding explanations, and providing educational value.

ENHANCEMENT REQUIREMENTS:
1. **Expand Key Concepts**: For each important concept, provide detailed explanations in simple terms
2. **Add Real-World Examples**: Include practical examples and applications where relevant
3. **Educational Structure**: Organize content with clear headings, bullet points, and logical flow
4. **Memory Aids**: Add mnemonics, analogies, or study tips where helpful
5. **Cross-References**: Connect concepts to related topics when applicable

CONTENT MARKING (CRITICAL):
- Wrap ALL newly added content with [AI_ENHANCED]...[/AI_ENHANCED] markers
- Keep original content unchanged and unmarked
- This allows the UI to highlight what was added by AI

FORMATTING REQUIREMENTS:
- Use ## for main section headings
- Use **bold** for key terms and concepts
- Use bullet points (-) for lists and key points
- Ensure proper paragraph spacing
- Include brief explanations for technical terms

EXAMPLE ENHANCEMENT PATTERN:
Original: "Mitosis is cell division."
Enhanced: "Mitosis is cell division.

[AI_ENHANCED]
## Understanding Mitosis in Detail

**Mitosis** is a fundamental biological process where a single cell divides to produce two identical daughter cells, each containing the same genetic information as the parent cell.

### Key Stages of Mitosis:
- **Prophase**: Chromosomes condense and become visible
- **Metaphase**: Chromosomes align at the cell's center
- **Anaphase**: Chromosomes separate and move apart
- **Telophase**: Two new nuclei form

### Real-World Applications:
- **Growth**: How organisms grow from single cells to complex multicellular beings
- **Healing**: How your body repairs cuts and wounds
- **Medical Research**: Understanding cancer (uncontrolled mitosis)

### Study Tip: 
Remember PMAT (Prophase, Metaphase, Anaphase, Telophase) - "Please Make Another Test"
[/AI_ENHANCED]"

Your enhanced version should be 2-3x longer than the original, packed with educational value while maintaining accuracy. Always preserve the original content exactly as written and only add new educational content within the markers.
`;

    case 'convert-to-markdown':
      return `${baseContext}
Convert this content into well-formatted Markdown.

Requirements:
- Use # for main headings, ## for subheadings
- Use - for bullet points with proper spacing
- Use **bold** for emphasis
- Ensure proper paragraph spacing with blank lines
- Use > for quotes if applicable
- Use \`code\` for technical terms if needed
- Maintain clear hierarchy and structure
`;

    default:
      return `${baseContext}
Please analyze this note and provide helpful insights using professional Markdown formatting.
`;
  }
};
