
import { EnhancementOption, EnhancementFunction } from "./types";

/**
 * Available enhancement options for notes
 */
export const enhancementOptions: EnhancementOption[] = [
  {
    id: 'summarize',
    value: 'summarize',
    title: 'Summarize',
    description: 'Create a concise summary of the note content',
    icon: '📄',
    prompt: 'Please provide a concise summary of this note content, highlighting the main ideas and key takeaways.',
    outputType: 'summary',
    replaceContent: false
  },
  {
    id: 'extract-key-points',
    value: 'extract-key-points',
    title: 'Extract Key Points',
    description: 'Identify and list the most important points',
    icon: '🔑',
    prompt: 'Please extract and list the key points from this note content in a clear, bulleted format.',
    outputType: 'keyPoints',
    replaceContent: false
  },
  {
    id: 'generate-questions',
    value: 'generate-questions',
    title: 'Top 10 Questions',
    description: 'Generate 10 comprehensive study questions and answers',
    icon: '❓',
    prompt: 'Generate exactly 10 comprehensive questions and detailed answers based on this content. Questions should cover key concepts, applications, and deeper understanding. Include a mix of factual, conceptual, and analytical questions. Format as: "**Q1:** Question text\n**A1:** Detailed answer\n\n" for each question. Ensure questions are study-friendly and promote learning with different difficulty levels (basic, intermediate, advanced).',
    outputType: 'questions',
    replaceContent: false
  },
  {
    id: 'convert-to-markdown',
    value: 'convert-to-markdown',
    title: 'Format My Note',
    description: 'Format the content using markdown syntax',
    icon: '📋',
    prompt: 'Please convert this note content to well-structured markdown format with appropriate headers, lists, and formatting.',
    outputType: 'markdown',
    replaceContent: false
  },
  {
    id: 'enrich-note',
    value: 'enrich-note',
    title: 'Enrich My Note',
    description: 'Add 50-70% more detailed content and examples',
    icon: '🔥',
    prompt: 'Please enrich this note by adding 50-70% more content including detailed explanations, examples, context, and related information. Mark all new content you add with **[ENRICHED]** at the beginning and **[/ENRICHED]** at the end of each new section. Preserve the original content exactly as is, and seamlessly integrate the new enriched content.',
    outputType: 'enriched',
    replaceContent: false
  }
];

/**
 * Get enhancement details by function ID
 */
export const getEnhancementDetails = (enhancementFunction: EnhancementFunction): EnhancementOption | undefined => {
  return enhancementOptions.find(option => option.value === enhancementFunction);
};
