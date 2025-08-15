import { callOpenAI } from './openai.ts';

export interface ConceptExtractionResult {
  concepts: Array<{
    topic: string;
    description: string;
    insertAfter: string; // Text after which to insert the enhancement
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface EnhancementResult {
  topic: string;
  content: string;
  insertAfter: string;
}

/**
 * Phase 1: Extract key concepts from the note content
 */
export async function extractConcepts(
  noteContent: string, 
  noteTitle: string, 
  openaiApiKey: string, 
  signal?: AbortSignal
): Promise<ConceptExtractionResult> {
  
  const prompt = `Analyze the following educational content and extract key concepts that would benefit from detailed explanations, examples, or additional context.

CONTENT TITLE: "${noteTitle}"

CONTENT:
${noteContent}

Your task is to identify 8-12 key concepts, topics, or ideas that could be enhanced with:
- Detailed explanations
- Real-world examples
- Background context
- Step-by-step breakdowns
- Memory aids
- Related connections

For each concept, provide:
1. **topic**: A clear, specific name for the concept
2. **description**: What aspect needs enhancement (1-2 sentences)
3. **insertAfter**: The exact sentence or phrase after which this enhancement should be added
4. **priority**: high/medium/low based on educational importance

Return the result as valid JSON in this exact format:
{
  "concepts": [
    {
      "topic": "Photosynthesis Process",
      "description": "Needs detailed breakdown of light and dark reactions with examples",
      "insertAfter": "Plants use photosynthesis to convert sunlight into energy.",
      "priority": "high"
    }
  ]
}

CRITICAL: Return ONLY the JSON object, no other text or explanations.`;

  const result = await callOpenAI(prompt, openaiApiKey, signal);
  
  try {
    const parsed = JSON.parse(result.enhancedContent);
    return parsed;
  } catch (error) {
    console.error('Failed to parse concept extraction result:', error);
    throw new Error('Invalid concept extraction response from AI');
  }
}

/**
 * Phase 2: Generate targeted enhancements for each concept
 */
export async function generateEnhancements(
  concepts: ConceptExtractionResult['concepts'],
  noteTitle: string,
  openaiApiKey: string,
  signal?: AbortSignal
): Promise<EnhancementResult[]> {
  
  const enhancements: EnhancementResult[] = [];
  
  // Process concepts in batches to avoid overwhelming the API
  const batchSize = 3;
  for (let i = 0; i < concepts.length; i += batchSize) {
    const batch = concepts.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (concept) => {
      const prompt = `Create a comprehensive educational enhancement for the following concept:

TOPIC: ${concept.topic}
DESCRIPTION: ${concept.description}
CONTEXT: This is for a note titled "${noteTitle}"

Generate a rich, educational enhancement that includes:

1. **Detailed Explanation**: Thorough breakdown of the concept
2. **Real-World Examples**: 2-3 practical applications or examples
3. **Background Context**: Historical or foundational information where relevant
4. **Study Tips**: Memory aids, mnemonics, or learning strategies
5. **Connections**: How this relates to other concepts or fields

Format the enhancement in clean Markdown with:
- Use ### for section headings
- Use bullet points for lists
- Use **bold** for key terms
- Ensure it's substantial (300-500 words minimum)
- Make it engaging and educational

CRITICAL REQUIREMENTS:
- Start directly with the content (no title or introduction)
- Write in an educational, clear tone
- Ensure the content is factually accurate
- Make it comprehensive but digestible
- Include practical value for learners

Return only the formatted enhancement content, nothing else.`;

      try {
        const result = await callOpenAI(prompt, openaiApiKey, signal);
        return {
          topic: concept.topic,
          content: result.enhancedContent,
          insertAfter: concept.insertAfter
        };
      } catch (error) {
        console.error(`Failed to generate enhancement for ${concept.topic}:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    enhancements.push(...batchResults.filter(result => result !== null) as EnhancementResult[]);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < concepts.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return enhancements;
}

/**
 * Phase 3: Intelligently assemble the enhanced content
 */
export function assembleEnhancedContent(
  originalContent: string,
  enhancements: EnhancementResult[]
): string {
  let enhancedContent = originalContent;
  
  // Sort enhancements by their position in the text (latest first to avoid position shifts)
  const sortedEnhancements = enhancements
    .map(enhancement => ({
      ...enhancement,
      position: originalContent.indexOf(enhancement.insertAfter)
    }))
    .filter(enhancement => enhancement.position !== -1) // Only include enhancements where we found the insert point
    .sort((a, b) => b.position - a.position); // Sort descending to insert from end to beginning
  
  console.log(`🔧 Assembling content with ${sortedEnhancements.length} enhancements`);
  
  // Insert enhancements from the end to the beginning to maintain text positions
  for (const enhancement of sortedEnhancements) {
    const insertIndex = enhancement.position + enhancement.insertAfter.length;
    
    const enhancementBlock = `

**[ENRICHED]**

### ${enhancement.topic}

${enhancement.content}

**[/ENRICHED]**
`;
    
    enhancedContent = 
      enhancedContent.slice(0, insertIndex) + 
      enhancementBlock + 
      enhancedContent.slice(insertIndex);
  }
  
  return enhancedContent;
}

/**
 * Complete two-pass enhancement process
 */
export async function performTwoPassEnhancement(
  noteContent: string,
  noteTitle: string,
  openaiApiKey: string,
  signal?: AbortSignal
): Promise<{ enhancedContent: string; conceptsExtracted: number; enhancementsAdded: number }> {
  
  console.log('🔍 Phase 1: Extracting concepts...');
  const conceptResult = await extractConcepts(noteContent, noteTitle, openaiApiKey, signal);
  
  console.log(`✅ Extracted ${conceptResult.concepts.length} concepts:`, 
    conceptResult.concepts.map(c => c.topic).join(', '));
  
  console.log('🎯 Phase 2: Generating targeted enhancements...');
  const enhancements = await generateEnhancements(conceptResult.concepts, noteTitle, openaiApiKey, signal);
  
  console.log(`✅ Generated ${enhancements.length} enhancements`);
  
  console.log('🏗️ Phase 3: Assembling enhanced content...');
  const enhancedContent = assembleEnhancedContent(noteContent, enhancements);
  
  const originalWordCount = noteContent.split(/\s+/).length;
  const finalWordCount = enhancedContent.split(/\s+/).length;
  const increasePercentage = ((finalWordCount - originalWordCount) / originalWordCount * 100).toFixed(1);
  
  console.log(`✅ Enhancement complete:`, {
    originalWords: originalWordCount,
    finalWords: finalWordCount,
    increase: `${increasePercentage}%`,
    conceptsExtracted: conceptResult.concepts.length,
    enhancementsAdded: enhancements.length
  });
  
  return {
    enhancedContent,
    conceptsExtracted: conceptResult.concepts.length,
    enhancementsAdded: enhancements.length
  };
}