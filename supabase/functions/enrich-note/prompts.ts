import { EnhancementFunction } from './types.ts';

/**
 * STANDARDIZED PROMPTS FOR CONTENT ENHANCEMENT
 * 
 * These prompts are designed to:
 * 1. Produce consistent, export-safe formatting
 * 2. Handle large content with appropriate token limits
 * 3. Generate tab-specific output formats
 * 4. Ensure PDF/DOCX compatibility
 */

/**
 * Export-safe formatting rules for all enhancement types
 */
const EXPORT_SAFE_FORMATTING = `
FORMATTING REQUIREMENTS (Export-Safe for PDF/DOCX):
- Use clean markdown syntax only
- Use # for main headings, ## for subheadings, ### for minor headings
- Use **bold** for key terms (not colors or complex styling)
- Use - for bullet lists with proper spacing
- Add single blank line between sections
- NO HTML tags, NO complex styling, NO emojis
- Keep content readable and professionally formatted
`;

/**
 * Token limits by enhancement type for optimal processing
 */
const TOKEN_LIMITS = {
  'summarize': 1500,
  'extract-key-points': 1200,
  'generate-questions': 2500,
  'convert-to-markdown': 2000,
  'improve-clarity': 6000,
  'enrich-note': 8000
};

/**
 * Model selection based on enhancement complexity
 */
const getOptimalModel = (enhancementType: EnhancementFunction): string => {
  const complexEnhancements = ['enrich-note', 'improve-clarity'];
  return complexEnhancements.includes(enhancementType) ? 'gpt-4.1-2025-04-14' : 'gpt-4.1-mini-2025-04-14';
};

/**
 * Get token limit for enhancement type
 */
export const getTokenLimit = (enhancementType: EnhancementFunction): number => {
  return TOKEN_LIMITS[enhancementType] || 2000;
};

/**
 * Get optimal model for enhancement type
 */
export const getModel = (enhancementType: EnhancementFunction): string => {
  return getOptimalModel(enhancementType);
};

/**
 * Create a standardized prompt for the OpenAI API based on the enhancement type
 */
export const createPrompt = (enhancementType: EnhancementFunction, noteTitle: string, noteContent: string): string => {
  // Base context to include in all prompts
  const baseContext = `
${EXPORT_SAFE_FORMATTING}

Content Title: "${noteTitle}"
Content Length: ${noteContent.length} characters

Content:
${noteContent}

`;

  // Select standardized prompt based on enhancement type
  switch (enhancementType) {
    case 'summarize':
      return `${baseContext}
**TASK**: Create a concise, well-structured summary of this content.

**OUTPUT FORMAT** (Export-Safe Summary Tab):
- Start with: \`# Summary\`
- Use flowing paragraphs with complete sentences
- Separate each paragraph with a single blank line
- Use **bold** for key terms only (no colors or styling)
- Target length: 20-25% of original content
- Group multiple topics using \`##\` subheadings if needed
- Use clean markdown formatting compatible with PDF/DOCX export

**CONTENT PROCESSING**:
- Extract main ideas and key concepts
- Preserve important details and context
- Maintain logical flow and structure
- Remove redundancy while keeping essential information

**EXPORT COMPATIBILITY**:
- Use only standard markdown syntax
- No HTML tags, colors, or complex formatting
- Simple, clean structure that renders well in all formats

Return only the formatted summary content with no additional explanations.`;

    case 'extract-key-points':
      return `${baseContext}
**TASK**: Extract the most important facts, concepts, and insights from this content.

**OUTPUT FORMAT** (Export-Safe Key Points Tab):
- Start with: \`# Key Points\`
- Provide 7-10 bullet points total
- Use \`- \` for each bullet point
- Add single blank line between each point
- Use **bold** for key terms within points
- Group related points under \`##\` subheadings if helpful
- NO nested lists or complex indentation
- NO emojis, colors, or special formatting

**CONTENT STRATEGY**:
- Focus on actionable insights and core concepts
- Extract facts that can stand alone
- Maintain 1-2 line length per point
- Ensure each point is clear and informative
- Prioritize most important information first

**EXPORT COMPATIBILITY**:
- Simple bullet structure that renders in PDF/DOCX
- Clean markdown formatting only
- Professional appearance for printed documents

Return only the formatted key points with no additional text.`;

    case 'improve-clarity':
      return `${baseContext}
**TASK**: Enhance this content by inserting learning aids inline without changing the original text.

**EXPANSION TARGET**: Add 30-50% more content overall

**CRITICAL RULES**:
- NEVER reword, delete, or modify original content
- Insert new content directly after relevant sentences/paragraphs
- Wrap all enhancements in [AI_ENHANCED]...[/AI_ENHANCED] tags
- Maintain original structure and formatting
- Use export-safe markdown formatting

**ENHANCEMENT STRATEGY**:
- Explain difficult concepts and terminology
- Define key terms and technical language
- Provide analogies and real-world examples
- Offer memory tips and study methods
- Make connections to related topics
- Add practical context and applications

**FORMATTING FOR ENHANCEMENTS**:
- Use standard markdown: ##, ###, **bold**, - bullets
- Break large additions into readable chunks
- Add single blank lines for proper spacing
- Ensure PDF/DOCX export compatibility

**VISUAL TREATMENT**:
- Enhanced content gets left border + light background styling
- Keep enhancements focused and educational
- Make them substantial enough to add real value

**EXAMPLE FORMAT**:

Original paragraph about a concept.

[AI_ENHANCED]
### Understanding This Concept

- **Key Point**: Explanation of why this matters
- **Real-World Example**: Practical application or scenario
- **Study Tip**: Memory aid or learning technique
- **Connection**: How this relates to other topics
[/AI_ENHANCED]

**EXPORT COMPATIBILITY**:
- Standard markdown syntax only
- Clean structure for PDF/DOCX rendering
- Professional appearance when printed

Return only the original content with [AI_ENHANCED] blocks inserted inline.`;

    case 'convert-to-markdown':
      return `${baseContext}
**TASK**: Convert the provided content into clean, structured markdown format without altering the original content.

**OUTPUT FORMAT** (Export-Safe Original++ Tab):
- Keep ALL original sentences and wording exactly as-is
- Start with appropriate heading (\`#\`) based on topic content
- Use \`##\` for major sections, \`###\` for subsections
- Use bullet lists (\`- \`) with proper spacing
- Use numbered lists (\`1., 2.\`) only for logical steps
- Use **bold** for key terms where appropriate
- Add single blank line before and after headings, lists, sections
- Maintain original paragraph structure

**FORMATTING RULES**:
- NO content alteration, summarization, or rewording
- NO addition or deletion of information
- Focus purely on structural markdown formatting
- Preserve original tone and style
- Improve readability through formatting only

**EXPORT COMPATIBILITY**:
- Standard markdown syntax for PDF/DOCX export
- Clean hierarchy and spacing
- Professional appearance when printed
- No complex formatting that breaks in exports

Return only the fully formatted markdown version with no explanations.`;

    case 'generate-questions':
      return `${baseContext}
**TASK**: Generate exactly 10 comprehensive study questions with detailed answers.

**OUTPUT FORMAT** (Export-Safe Questions Tab):
- Start with: \`# Top 10 Study Questions\`
- Format each Q&A pair as: \`## Q1: [Question]\` followed by \`**A1:** [Answer]\`
- Continue with Q2/A2, Q3/A3, etc. through Q10/A10
- Add single blank line between each Q&A pair
- Use **bold** for key terms in answers
- NO colors, emojis, or special formatting

**QUESTION STRATEGY**:
- Questions 1-3: Core concepts and main ideas
- Questions 4-6: Important details and specifics  
- Questions 7-8: Application and real-world connections
- Questions 9-10: Analysis and critical thinking

**QUALITY STANDARDS**:
- Questions must be clear, specific, and answerable from content
- Answers should be comprehensive but concise (2-4 sentences each)
- Mix question types: definition, explanation, comparison, application
- Test deep understanding, not just memorization
- Ensure 100% accuracy based on provided content

**EXPORT COMPATIBILITY**:
- Standard markdown formatting for PDF/DOCX compatibility
- Clean, professional appearance when printed
- Consistent heading structure and formatting

**EXACT FORMAT**:
# Top 10 Study Questions

## Q1: [Your question here?]

**A1:** [Your detailed answer with **bold** key terms where appropriate.]

## Q2: [Next question?]

**A2:** [Next answer...]

[Continue through Q10/A10]

Return only the formatted Q&A content with no additional explanations.`;

    case 'enrich-note':
      return `${baseContext}
**TASK**: Significantly expand this content by adding educational enhancements while preserving ALL original text exactly as written.

**EXPANSION TARGET**: Add 60-70% more content (if original is 1000 words, result should be 1600-1700 words)

**CRITICAL REQUIREMENTS**:
- PRESERVE ALL original content exactly as written - NO modifications
- Insert comprehensive enhancements after relevant paragraphs/concepts
- Wrap ALL new content with: [AI_ENHANCED] your enhancement here [/AI_ENHANCED]
- Ensure natural flow between original and enhanced content

**ENHANCEMENT STRATEGY**:
- Detailed explanations and context for complex concepts
- Real-world examples and practical applications
- Background information and historical context  
- Step-by-step breakdowns of complex ideas
- Memory aids and study techniques
- Connections to related topics and fields
- Practical implications and use cases

**FORMATTING FOR ENRICHED CONTENT**:
- Use standard markdown: ##, ###, **bold**, - bullets
- Keep enhancements focused and well-structured
- Add single blank lines between sections
- Ensure export-safe formatting (PDF/DOCX compatible)

**VISUAL TREATMENT**:
- All AI-enhanced content will be visually distinguished with left border + light background
- Enhanced sections should be substantial (minimum 2-3 sentences)
- Focus on educational value and depth

**EXAMPLE**:
Original: "Photosynthesis is the process plants use to make food."

Enhanced: "Photosynthesis is the process plants use to make food.

[AI_ENHANCED]
This remarkable biological process occurs in the chloroplasts of plant cells, where chlorophyll captures light energy from the sun. Photosynthesis can be broken down into two main stages: the light-dependent reactions and the Calvin cycle. During this process, plants convert carbon dioxide from the air and water from the soil into glucose and oxygen. This process is fundamental to life on Earth, forming the base of most food chains and producing the oxygen we breathe.
[/AI_ENHANCED]"

Return the original content with substantial inline enhancements wrapped in [AI_ENHANCED] tags.`;

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