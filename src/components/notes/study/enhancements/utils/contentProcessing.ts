
/**
 * Utility functions for processing and cleaning enhancement content
 * Focus: Preserve markdown structure, minimal aggressive cleaning
 */

export const cleanMarkdownContent = (content: string): string => {
  if (!content) return "";
  
  // Only remove HTML tags and decode HTML entities - preserve markdown structure
  let cleaned = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Remove [AI_ENHANCED] markers for clean markdown
  cleaned = cleaned.replace(/\[AI_ENHANCED\]/g, '').replace(/\[\/AI_ENHANCED\]/g, '');
  
  // Minimal cleaning - preserve line breaks and spacing that OpenAI generated
  cleaned = cleaned
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Only clean up excessive whitespace (3+ consecutive newlines)
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
  
  return cleaned;
};

export const processKeyPoints = (content: string): string => {
  if (!content) return "";
  
  // For key points, preserve the markdown structure from OpenAI
  // Only clean HTML entities and basic formatting
  return cleanMarkdownContent(content);
};

export const hasEnhancementMarkers = (content: string): boolean => {
  return content && content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
};

export const formatMarkdownStructure = (content: string): string => {
  if (!content) return "";
  
  // Minimal formatting - preserve what OpenAI generated
  return cleanMarkdownContent(content);
};
