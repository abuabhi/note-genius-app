
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
    id: 'improve-clarity',
    value: 'improve-clarity',
    title: 'Improve Clarity',
    description: 'Enhance readability and structure while preserving meaning',
    icon: '✨',
    prompt: 'Please improve the clarity and readability of this note content while preserving all the original meaning and information.',
    outputType: 'improved',
    replaceContent: false
  },
  {
    id: 'convert-to-markdown',
    value: 'convert-to-markdown',
    title: 'Convert to Markdown',
    description: 'Format the content using markdown syntax',
    icon: '📋',
    prompt: 'Please convert this note content to well-structured markdown format with appropriate headers, lists, and formatting.',
    outputType: 'markdown',
    replaceContent: false
  }
];

/**
 * Get enhancement details by function ID
 */
export const getEnhancementDetails = (enhancementFunction: EnhancementFunction): EnhancementOption | undefined => {
  return enhancementOptions.find(option => option.value === enhancementFunction);
};
