
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
You are an educational AI assistant helping students understand complex topics better. Your task is to enhance this note by adding inline educational content that flows naturally with the original text.

CRITICAL INLINE ENHANCEMENT RULES - THIS IS ABSOLUTELY ESSENTIAL:
- You MUST keep ALL original content exactly as written, unmarked
- You MUST add enhanced content INLINE after relevant sentences or paragraphs
- You MUST wrap ONLY newly added content with [AI_ENHANCED]...[/AI_ENHANCED] markers
- Enhanced content should appear immediately after the relevant original content
- Create a natural reading flow where explanations follow the concepts they explain

INLINE ENHANCEMENT STRATEGY:
1. **After Key Concepts**: Add detailed explanations immediately after important terms or concepts
2. **After Complex Statements**: Provide clarification or examples right after difficult sentences
3. **After Topic Introductions**: Insert relevant background information or context
4. **Between Paragraphs**: Add transitional explanations that connect ideas
5. **After Lists**: Provide additional details or real-world applications

ENHANCEMENT CONTENT REQUIREMENTS:
- Expand total content by 30-50%
- Add detailed explanations for complex concepts
- Include practical examples and applications
- Provide memory aids and study tips
- Connect concepts to related topics
- Use clear headings and formatting for new sections

FORMATTING FOR ENHANCED CONTENT:
- Use ## for new section headings (mark these as enhanced)
- Use **bold** for key terms in new content (mark as enhanced)
- Use bullet points (-) for new lists (mark as enhanced)
- Ensure proper paragraph spacing

EXAMPLE OF CORRECT INLINE ENHANCEMENT:
Original: "Photosynthesis is the process by which plants make food. It occurs in the chloroplasts of plant cells."

Enhanced Output:
"Photosynthesis is the process by which plants make food.

[AI_ENHANCED]
**Photosynthesis** is actually a complex two-stage process that converts light energy into chemical energy. Think of it as nature's solar panel system - plants capture sunlight and transform it into glucose (sugar) that they can use for energy.
[/AI_ENHANCED]

It occurs in the chloroplasts of plant cells.

[AI_ENHANCED]
**Chloroplasts** are specialized organelles found mainly in leaf cells. They contain **chlorophyll**, the green pigment that captures light energy. Each chloroplast is like a tiny factory with two main production areas:

- **Thylakoids**: Where light-dependent reactions occur
- **Stroma**: Where light-independent reactions (Calvin cycle) take place

### Real-World Connection:
Understanding photosynthesis helps explain why plants are green, why they need sunlight, and why they're essential for life on Earth - they produce the oxygen we breathe!

### Study Tip:
Remember the equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂
[/AI_ENHANCED]"

MANDATORY REQUIREMENTS:
1. Keep original content exactly as written and unmarked
2. Add enhanced content INLINE after relevant original content
3. Wrap ALL new content with [AI_ENHANCED]...[/AI_ENHANCED] markers
4. Ensure natural reading flow between original and enhanced content
5. Expand total content by 30-50% with educational additions
6. Make enhancements contextually relevant to what comes before them

DOUBLE-CHECK: Every piece of new content must be wrapped with the markers and placed inline!
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
