
/**
 * NUCLEAR REWRITE: Simplified content processing - everything goes through unified processor
 */

import { processContentForRendering } from './unifiedContentProcessor';

export const cleanMarkdownContent = (content: string): string => {
  console.log("🧹 NUCLEAR CLEANUP: Delegating to unified processor");
  return processContentForRendering(content).content;
};

export const processAIEnhancedContent = (content: string): string => {
  console.log("🚀 NUCLEAR AI_ENHANCED: Delegating to unified processor");
  return processContentForRendering(content).content;
};

export const hasEnhancementMarkers = (content: string): boolean => {
  return content && content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
};

export const detectContentType = (content: string): 'markdown' => {
  // NUCLEAR REWRITE: Everything is markdown now - no exceptions
  console.log("🎯 NUCLEAR DETECTION: EVERYTHING IS MARKDOWN");
  return 'markdown';
};
