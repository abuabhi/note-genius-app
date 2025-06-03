
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
You are an educational AI assistant helping students understand complex topics better. Your task is to enhance this note by expanding it by 30-50% with additional explanations, examples, and educational content.

CRITICAL MARKING REQUIREMENT - THIS IS ABSOLUTELY ESSENTIAL:
- You MUST keep ALL original content exactly as written, unmarked
- You MUST wrap ONLY newly added content with [AI_ENHANCED]...[/AI_ENHANCED] markers
- Original content should flow naturally with new content
- This marking is ESSENTIAL for the UI to highlight what was added by AI

EXPANSION REQUIREMENTS:
1. **Expand by 30-50%**: Add educational content that increases the total length by 30-50%
2. **Add Detailed Explanations**: For each important concept, provide deeper explanations
3. **Include Real-World Examples**: Add practical examples and applications where relevant
4. **Educational Structure**: Organize additional content with clear headings and formatting
5. **Memory Aids**: Add mnemonics, analogies, or study tips where helpful
6. **Cross-References**: Connect concepts to related topics when applicable

FORMATTING REQUIREMENTS:
- Use ## for new section headings (mark these as enhanced)
- Use **bold** for key terms in new content (mark as enhanced)
- Use bullet points (-) for new lists (mark as enhanced)
- Ensure proper paragraph spacing
- Include brief explanations for technical terms in new content

EXAMPLE OF CORRECT MARKING:
Original: "Photosynthesis is the process by which plants make food."

Enhanced Output:
"Photosynthesis is the process by which plants make food.

[AI_ENHANCED]
## Understanding Photosynthesis in Detail

**Photosynthesis** is a complex biological process that occurs in two main stages:

### The Light-Dependent Reactions:
- **Chlorophyll** captures sunlight energy in the chloroplasts
- Water molecules are split, releasing oxygen as a byproduct
- Energy is stored in molecules called ATP and NADPH

### The Calvin Cycle (Light-Independent Reactions):
- Carbon dioxide from the air is "fixed" into organic molecules
- ATP and NADPH from the first stage provide energy
- Glucose is produced as the final product

### Real-World Applications:
- **Agriculture**: Understanding photosynthesis helps farmers optimize crop growth
- **Environmental Science**: Photosynthesis is crucial for Earth's oxygen supply
- **Renewable Energy**: Scientists study photosynthesis to improve solar panel efficiency

### Study Tip: 
Remember "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂" - this equation shows the inputs and outputs of photosynthesis.
[/AI_ENHANCED]"

MANDATORY REQUIREMENTS:
1. Keep original content exactly as written and unmarked
2. Expand total content by 30-50% with educational additions
3. Wrap ALL new content with [AI_ENHANCED]...[/AI_ENHANCED] markers
4. Make additions educational and valuable for student learning
5. Ensure smooth flow between original and enhanced content

DOUBLE-CHECK: Every piece of new content must be wrapped with the markers!
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
