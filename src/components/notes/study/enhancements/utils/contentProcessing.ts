
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
  
  // Fix markdown structure and formatting
  cleaned = cleaned
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Ensure proper heading formatting
    .replace(/^(\*\*\*[^*]+\*\*\*):?/gm, '### $1')
    .replace(/^\*\*([^*]+)\*\*:?/gm, '## $1')
    // Convert bullet points that start with dashes or asterisks
    .replace(/^[\s]*[-*]\s*\*\*([^*]+)\*\*:?\s*/gm, '- **$1**: ')
    .replace(/^[\s]*[-*]\s*/gm, '- ')
    // Ensure proper paragraph spacing
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Add proper spacing between sections
    .replace(/\n(#{1,6}\s)/g, '\n\n$1')
    .replace(/\n(-\s)/g, '\n$1')
    // Clean up excessive whitespace but preserve intentional breaks
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return cleaned;
};

export const processKeyPoints = (content: string): string => {
  if (!content) return "";
  
  let processed = cleanMarkdownContent(content);
  
  // Split into lines and process each one
  const lines = processed.split('\n').filter(line => line.trim().length > 0);
  
  return lines.map(line => {
    const trimmed = line.trim();
    
    // Skip if already a heading
    if (trimmed.match(/^#{1,6}\s/)) {
      return trimmed;
    }
    
    // If line doesn't start with bullet or number, add bullet
    if (!trimmed.match(/^[\-\*\+\d\.•]/)) {
      return `- ${trimmed}`;
    }
    
    // Convert dashes to bullets for consistency
    if (trimmed.startsWith('-')) {
      return trimmed.replace(/^-\s*/, '- ');
    }
    
    return trimmed;
  }).join('\n\n');
};

export const hasEnhancementMarkers = (content: string): boolean => {
  return content && content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
};

export const formatMarkdownStructure = (content: string): string => {
  if (!content) return "";
  
  let formatted = cleanMarkdownContent(content);
  
  // Ensure proper markdown structure
  formatted = formatted
    // Fix headings that might be missing proper spacing
    .replace(/^(#{1,6})\s*([^#\n]+)/gm, '$1 $2')
    // Ensure lists have proper spacing
    .replace(/^([-*+])\s*(.+)/gm, '$1 $2')
    // Add spacing between different content types
    .replace(/(\n#{1,6}\s[^\n]+)(\n[^#\n-*+])/g, '$1\n$2')
    .replace(/(\n[^#\n-*+][^\n]*)(\n#{1,6}\s)/g, '$1\n$2')
    .replace(/(\n[^#\n-*+][^\n]*)(\n[-*+]\s)/g, '$1\n$2');
  
  return formatted;
};
