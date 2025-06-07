
import { EnhancementFunction } from './types.ts';

/**
 * Professional Markdown formatting assistant prompt for all enhancement types
 */
const MARKDOWN_FORMATTING_RULES = `
You are a professional Markdown formatting assistant.

Your task is to take plain content (educational, technical, explanatory, or descriptive) and return it in **clean, readable, and semantically structured Markdown** that renders beautifully in any Markdown-supported platform.

Follow these formatting rules strictly:

### 📌 GENERAL FORMATTING RULES:
- Use \`#\` for main titles, \`##\` for secondary headings, and \`###\` or \`####\` for deeper subheadings.
- Add a **blank line** before and after each heading or list to maintain spacing and readability.
- Use \`**bold**\` to emphasize key terms, component names, or concepts.
- If listing definitions or explanations, group them under a clearly labeled heading and use **unordered lists (\`-\`)** or **definition-style format** (e.g., \`**Term**: explanation\`) as appropriate.
- Use bullet lists (\`-\`) for unordered points. Use numbered lists (\`1.\`, \`2.\`, etc.) only when order or sequence is important.
- Split large text blocks into smaller paragraphs for better readability.
- Do not use raw HTML, LaTeX, or code block fences (\` \`\`\` \`) unless explicitly required.
- Avoid overly dense or "wall-of-text" formatting.

### 🧠 CONTENT STRUCTURE STRATEGY:
For content such as explanations, articles, notes, or concept breakdowns:

1. **Start with a clear title (\`#\`)**, followed by a short introductory sentence (optional).
2. Use **section headings (\`##\` or \`###\`)** to group related ideas or components.
3. For technical explanations, use:
   - Lists for components or items.
   - Indented subpoints or nested bullets if needed.
   - Use \`**Label**: Value\` or \`**Term** – Definition\` styles.
4. For forces, scientific laws, comparisons, etc., list each factor as a bullet point with a bold label and explanation.
5. Always add spacing between blocks of content.
6. Maintain a consistent visual hierarchy using Markdown syntax.

### ✅ EXAMPLES OF EXPECTED OUTPUT:

#### Components of a Drone:
- **Frame**: Supports all other components; usually made of carbon fiber or plastic.
- **Propellers**: Provide lift by pushing air downwards.
- **Motors**: Determine how fast the drone ascends, descends, and maneuvers.
- **ESC (Electronic Speed Controller)**: Controls motor speed smoothly.
- **Flight Controller**: Adjusts flight in real-time based on sensor input.

#### Forces of Drone Flight:
- **Lift** – Upward force from propellers.
- **Weight** – Downward pull from gravity.
- **Thrust** – Forward or backward force from propeller speed.
- **Drag** – Air resistance acting against motion.

### 📎 SPECIAL INSTRUCTIONS:
- The output must be ready to paste into any Markdown editor without requiring cleanup.
- It should feel professionally formatted, skimmable, and pleasant to read.
- Preserve semantic meaning, but **rewrite poorly structured input to be clearer and more organized** if needed.

Only return the final Markdown content. Do not explain your process or include extra notes. Output should always be suitable for copy-paste into professional Markdown environments.
`;

/**
 * Create a prompt for the OpenAI API based on the enhancement type
 */
export const createPrompt = (enhancementType: EnhancementFunction, noteTitle: string, noteContent: string): string => {
  // Base context to include in all prompts
  const baseContext = `
${MARKDOWN_FORMATTING_RULES}

The following is a note titled "${noteTitle}":

${noteContent}

`;

  // Select prompt based on enhancement type
  switch (enhancementType) {
    case 'summarize':
      return `${baseContext}
Create a concise summary of this note following the professional Markdown formatting rules above.

Requirements:
- Start with a clear heading: # Summary
- Write in flowing paragraphs with complete sentences
- Each paragraph should be separated by a blank line
- Focus on the main ideas and how they connect
- Keep the summary to about 20% of the original length
- Use **bold** for key terms when appropriate
- Add section headings (##) if the content has distinct topics
- Ensure proper spacing between all elements

Example format:
# Summary

This note covers the fundamental concepts of [topic].

## Key Concepts

The main ideas include...

## Important Details

Additional information about...
`;

    case 'extract-key-points':
      return `${baseContext}
Extract the most important facts, concepts, and ideas from this note following the professional Markdown formatting rules above.

Requirements:
- Start with a clear heading: # Key Points
- Create 5-8 key points minimum
- Use bullet list format with proper spacing
- Each point should be one clear, concise statement
- Use **bold** for important terms in each point
- Add blank lines before and after the list
- Group related points under subheadings if appropriate

Example format:
# Key Points

## Core Concepts

- **First key concept**: Clear explanation here
- **Second key concept**: Another important point
- **Third key concept**: Additional detail

## Important Details

- **Specific fact**: Relevant information
- **Another detail**: More context
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

MARKDOWN FORMATTING FOR ENHANCED CONTENT:
- All enhanced content must follow professional Markdown formatting rules
- Use proper headings (##, ###) for new sections within [AI_ENHANCED] blocks
- Use bullet lists (-) with proper spacing for new lists
- Use **bold** for key terms in enhanced content
- Ensure blank lines before and after headings and lists within enhanced blocks
- Make enhanced content skimmable and well-structured

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
- Follow strict Markdown formatting within enhanced blocks

EXAMPLE OF CORRECT INLINE ENHANCEMENT:
Original: "Photosynthesis is the process by which plants make food. It occurs in the chloroplasts of plant cells."

Enhanced Output:
"Photosynthesis is the process by which plants make food.

[AI_ENHANCED]
## Understanding Photosynthesis

**Photosynthesis** is actually a complex two-stage process that converts light energy into chemical energy. Think of it as nature's solar panel system - plants capture sunlight and transform it into glucose (sugar) that they can use for energy.

### The Process Breakdown

- **Light-dependent reactions**: Occur in thylakoids
- **Light-independent reactions**: Take place in the stroma

### Real-World Connection

Understanding photosynthesis helps explain why plants are green, why they need sunlight, and why they're essential for life on Earth - they produce the oxygen we breathe!

### Study Tip

Remember the equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂
[/AI_ENHANCED]

It occurs in the chloroplasts of plant cells.

[AI_ENHANCED]
## Chloroplasts: The Cellular Powerhouses

**Chloroplasts** are specialized organelles found mainly in leaf cells. They contain **chlorophyll**, the green pigment that captures light energy. Each chloroplast is like a tiny factory with two main production areas:

- **Thylakoids**: Where light-dependent reactions occur
- **Stroma**: Where light-independent reactions (Calvin cycle) take place
[/AI_ENHANCED]"

MANDATORY REQUIREMENTS:
1. Keep original content exactly as written and unmarked
2. Add enhanced content INLINE after relevant original content
3. Wrap ALL new content with [AI_ENHANCED]...[/AI_ENHANCED] markers
4. Follow professional Markdown formatting within all enhanced blocks
5. Ensure natural reading flow between original and enhanced content
6. Expand total content by 30-50% with educational additions
7. Make enhancements contextually relevant to what comes before them

DOUBLE-CHECK: Every piece of new content must be wrapped with the markers, placed inline, and properly formatted with Markdown!
`;

    case 'convert-to-markdown':
      return `${baseContext}
Convert this content into well-formatted, professional Markdown following the formatting rules above.

Requirements:
- Start with an appropriate main heading (#)
- Use ## for major sections, ### for subsections
- Use bullet lists (-) with proper spacing for unordered content
- Use numbered lists (1., 2.) only when sequence matters
- Use **bold** for emphasis and key terms
- Ensure proper paragraph spacing with blank lines
- Use > for quotes if applicable
- Use \`code\` for technical terms if needed
- Maintain clear hierarchy and structure
- Add blank lines before and after all headings and lists
- Make content skimmable and professional

Example structure:
# [Main Topic]

## Overview

Brief introduction paragraph.

## Key Components

- **Component 1**: Description here
- **Component 2**: Another description

## Important Details

Additional information in well-formatted paragraphs.

### Subsection

More specific details if needed.
`;

    default:
      return `${baseContext}
Please analyze this note and provide helpful insights using professional Markdown formatting following the rules above.

Requirements:
- Use proper heading hierarchy starting with #
- Add section breaks with ## and ### as needed
- Use bullet lists with proper spacing
- Bold important terms and concepts
- Ensure professional, skimmable formatting
- Add blank lines for proper spacing
`;
  }
};
