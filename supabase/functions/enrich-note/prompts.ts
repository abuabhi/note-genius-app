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
Do not include the note title again in the content.

Please create a concise summary of this note in **Markdown format**.

Requirements:
- Start with: \`# Summary\`
- Use flowing paragraphs with complete sentences
- Separate each paragraph with a blank line
- Use **bold** for key terms where appropriate
- Keep the summary to around **20% of the original length**
- If the content has multiple topics, group them using \`##\` subheadings
- Use proper spacing between all elements
- Output only the formatted summary content (no explanations or notes)

Example format (follow structure only, do not reuse text):

\`\`\`markdown
# Summary

This note explains the fundamentals of [topic].

## Key Concepts

The main ideas include...

## Important Details

Additional details on related topics...
\`\`\`
`;

    case 'extract-key-points':
      return `${baseContext}
Do not repeat the note title in the output.

Extract and return only the most important facts, concepts, and insights from this note using clean **Markdown formatting**.

Requirements:
- Begin with: \`# Key Points\`
- Provide a minimum of **7–10 bullet points**
- Use \`- \` for each bullet point, separated by blank lines
- Use **bold** for key terms within each point
- Group related points under \`##\` subheadings if appropriate
- Keep each point clear, informative, and to the point
- Do NOT include explanations or commentary—only the formatted key points

Example structure (for format guidance only):

\`\`\`markdown
# Key Points

## Core Concepts

- **First key idea**: Brief but meaningful explanation

- **Second concept**: Summary of importance

## Supporting Facts

- **Term**: Explanation here
- **Another fact**: More context
\`\`\`
`;

    case 'improve-clarity':
      return `${baseContext}
Do not repeat or include the note title in the output.

You are an AI assistant helping students understand complex topics better. Your task is to enhance this educational content by inserting **new learning aids inline** — without changing the original text.

-----------------------
✅ FORMAT & STRUCTURE RULES
-----------------------
- DO NOT reword or delete the original content
- Insert new content directly **after** the relevant sentence or paragraph
- Wrap all enhancements in \`**[ENRICHED]**\` and \`**[/ENRICHED]**\` markers
- Add **30–50% more content** overall
- Format enhancements using proper Markdown:
  - \`##\`, \`###\` for headings
  - \`- \` for bullet lists (with blank lines before/after)
  - \`**bold**\` for key terms
  - Break large additions into smaller, readable chunks

-----------------------
🧠 CONTENT STRATEGY
-----------------------
Enhancements should:
- Explain difficult concepts
- Define key terms
- Provide analogies or real-world examples
- Offer memory tips or study methods
- Make connections to related topics

-----------------------
🧪 EXAMPLE FORMAT
-----------------------

Original paragraph.

**[ENRICHED]**

### Explanation

- **Why it matters**: Brief contextual note
- **Example**: Real-world scenario
- **Study Tip**: Mnemonic, shortcut, or association

**[/ENRICHED]**

-----------------------
⚠️ DO NOT:
-----------------------
- Alter or summarize original content
- Insert new headings outside of enhancement blocks
- Include explanations of what you're doing
- Repeat or paraphrase the note title

Return only the original content with **[ENRICHED]** blocks inserted inline.`;

    case 'convert-to-markdown':
      return `${baseContext}
Do not include or repeat the note title in the output.

Your task is to convert the provided content into clear, structured **Markdown format** to improve readability and presentation. Do **not** alter or summarise the original content — just format it.

Requirements:
- Keep all original sentences and wording exactly as-is
- Start with a top-level heading (\`#\`) based on the topic (not the note title)
- Use \`##\` for major sections, \`###\` for subsections
- Use bullet lists (\`- \`) with proper indentation and spacing
- Use numbered lists (\`1., 2.\`) only where logical steps are involved
- Use **bold** for key terms and \`code\` for technical terms where needed
- Add a blank line **before and after** all headings, lists, and sections
- Ensure proper paragraph spacing and Markdown hierarchy
- Do not add, delete, or reword any content

Output only the fully formatted Markdown version of the original note.`;

    case 'generate-questions':
      return `${baseContext}
Do not include or repeat the note title in the output.

**YOUR MISSION**: Generate exactly **10 comprehensive study questions with detailed answers** based on this note content.

**📋 FORMATTING REQUIREMENTS:**
- Start with: \`# Top 10 Study Questions\`
- Format each Q&A pair as: \`## Q1: [Question]\` followed by \`**A1:** [Answer]\`
- Continue with Q2/A2, Q3/A3, etc. through Q10/A10
- Use proper Markdown formatting throughout
- Add blank lines between each Q&A pair for readability

**🎯 QUESTION STRATEGY:**
Create questions that cover:
- **Core concepts** and main ideas (Questions 1-3)
- **Important details** and specifics (Questions 4-6) 
- **Application** and real-world connections (Questions 7-8)
- **Analysis** and critical thinking (Questions 9-10)

**✅ QUESTION QUALITY STANDARDS:**
- Questions should be **clear, specific, and answerable** from the note content
- Answers should be **comprehensive but concise** (2-4 sentences each)
- Mix different question types: definition, explanation, comparison, application
- Ensure questions test **deep understanding**, not just memorization
- Use **bold** for key terms in answers

**📐 EXACT FORMAT EXAMPLE:**

\`\`\`markdown
# Top 10 Study Questions

## Q1: What is the primary function of photosynthesis in plants?

**A1:** Photosynthesis is the process by which plants convert **light energy** into **chemical energy** (glucose) using carbon dioxide and water. This process is essential for plant survival and produces oxygen as a byproduct, supporting most life on Earth.

## Q2: What are the two main stages of photosynthesis?

**A2:** The two main stages are the **light-dependent reactions** (occurring in thylakoids) and the **light-independent reactions** or **Calvin cycle** (occurring in the stroma). The first stage captures light energy, while the second stage uses that energy to produce glucose.

[Continue through Q10...]
\`\`\`

**⚠️ CRITICAL REQUIREMENTS:**
- Generate exactly 10 questions (Q1-Q10)
- Each question must have a detailed answer
- Use the exact numbering format shown (Q1, A1, Q2, A2, etc.)
- Cover the full range of content complexity
- Ensure answers are accurate and based only on the note content

Return only the formatted Q&A content - no explanations or additional notes.`;

    case 'enrich-note':
      return `${baseContext}
You are an expert educational content enhancer. Your task is to expand and enrich this note by adding 50-70% more educational value while maintaining the original structure and clarity.

**Instructions**:
1. **Preserve all original content** - do not delete or significantly rewrite existing text
2. **Add 50-70% more content** by inserting educational enhancements inline
3. **Mark all additions** with [AI_ENHANCED]...[/AI_ENHANCED] tags
4. **Focus on**: explanations, examples, context, connections, study tips, analogies, and clarifications
5. **Maintain structure** - keep headings, lists, and formatting intact
6. **Use proper Markdown** formatting for readability

**Enhancement types to include**:
- Detailed explanations of concepts
- Real-world examples and applications
- Memory aids and study techniques
- Historical context or background
- Connections to related topics
- Step-by-step breakdowns
- Common misconceptions and clarifications

Return only the enhanced content with clear [AI_ENHANCED] markers around all additions.`;

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