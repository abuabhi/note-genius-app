
/**
 * Utility functions for processing and cleaning enhancement content
 */

export const cleanMarkdownContent = (content: string): string => {
  if (!content) return "";
  
  // Remove HTML tags and decode HTML entities
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
  
  // Fix line breaks and paragraphs - ensure double line breaks for proper markdown parsing
  cleaned = cleaned
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');
  
  return cleaned;
};

export const processKeyPoints = (content: string): string => {
  if (!content) return "";
  
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  return lines.map(line => {
    // If line doesn't start with bullet or number, add bullet
    if (!line.match(/^[\-\*\+\d\.]/)) {
      return `• ${line}`;
    }
    // Convert dashes to bullets for consistency
    if (line.startsWith('-')) {
      return line.replace(/^-\s*/, '• ');
    }
    return line;
  }).join('\n\n');
};

export const hasEnhancementMarkers = (content: string): boolean => {
  return content && content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
};
