
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
You are an educational AI assistant helping students understand complex topics better. Your task is to enhance the provided educational content by inserting contextual learning aids and explanations directly within the original text — without changing the original wording.

-----------------------
🔒 CRITICAL STRUCTURE RULES:
-----------------------
- NEVER alter or reword any original content — preserve it **exactly as-is**
- Add new content only INLINE, directly after the related sentence or paragraph
- All new content must be wrapped in [AI_ENHANCED]...[/AI_ENHANCED] markers
- Add content only where helpful (e.g., after definitions, key concepts, lists, or transitions)
- Maintain smooth, natural reading flow between original and enhanced content

-----------------------
🖋️ ENHANCEMENT STYLE & STRATEGY:
-----------------------
- Use **professional Markdown formatting** inside all [AI_ENHANCED] blocks:
  - Use \`##\`, \`###\`, etc. for clear headings
  - Use \`-\` for bullet points with a blank line before and after the list
  - Use \`**bold**\` for key terms
  - Split long content into **small, readable chunks**
  - Avoid single massive paragraphs inside enhancements

- Strategy for inserting enhancements:
  1. Add definitions or background after important terms
  2. Provide real-world examples after abstract concepts
  3. Add memory tips after technical lists or processes
  4. Connect current concept to related ideas after each major section
  5. Expand on difficult concepts or scientific principles using short blocks

-----------------------
📚 ENHANCEMENT CONTENT REQUIREMENTS:
-----------------------
- Expand total content by **at least 30–50%**
- Include:
  - Definitions and breakdowns
  - Visual or conceptual analogies
  - Real-world applications
  - Study techniques (mnemonics, associations)
  - Related or supporting topics
- Maintain Markdown readability and document hierarchy

-----------------------
✅ [EXAMPLE ENHANCEMENT BLOCK FORMAT]
-----------------------
Original sentence.

[AI_ENHANCED]

### Additional Explanation

- **Why this matters**: Add short context
- **Example**: Real-world case
- **Tip**: Mnemonic or learning method

[/AI_ENHANCED]

-----------------------
⚠️ FINAL CHECKLIST
-----------------------
1. Original text remains unchanged
2. All added content appears inline using [AI_ENHANCED]…[/AI_ENHANCED]
3. All enhancements follow professional Markdown
4. Layout is clean, skimmable, and readable
5. No extra commentary or out-of-scope content

-----------------------
INSTRUCTION SCOPE
-----------------------
Only return enhanced Markdown-formatted content. Do not summarize or explain your actions. Simply return the final Markdown output with inline enhancements inserted.
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
