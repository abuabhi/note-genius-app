
/**
 * Enhanced utility functions for processing and cleaning enhancement content
 * Focus: Better markdown structure preservation and improved AI content handling
 */

export const cleanMarkdownContent = (content: string): string => {
  if (!content) return "";
  
  // Comprehensive HTML cleanup while preserving markdown structure
  let cleaned = content
    // Remove HTML tags but preserve content
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Fix line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  
  // Clean up spacing while preserving markdown structure
  cleaned = cleaned
    // Remove excessive whitespace but preserve intentional formatting
    .replace(/[ \t]+/g, ' ')
    // Clean up excessive newlines (more than 3 becomes 2)
    .replace(/\n{4,}/g, '\n\n')
    // Ensure proper spacing around headers
    .replace(/\n(#{1,6}\s)/g, '\n\n$1')
    // Ensure proper spacing around lists
    .replace(/\n([-*+]\s)/g, '\n\n$1')
    .replace(/\n(\d+\.\s)/g, '\n\n$1')
    .trim();
  
  return cleaned;
};

export const processKeyPoints = (content: string): string => {
  if (!content) return "";
  
  // Enhanced key points processing
  let processed = cleanMarkdownContent(content);
  
  // Ensure key points have proper list formatting
  if (!processed.includes('# Key Points') && !processed.includes('## Key Points')) {
    // If no header exists, add one
    if (processed.match(/^[-*+]/m) || processed.match(/^\d+\./m)) {
      processed = `# Key Points\n\n${processed}`;
    }
  }
  
  // Ensure proper list spacing
  processed = processed
    .replace(/\n([-*+]\s)/g, '\n\n$1')
    .replace(/\n(\d+\.\s)/g, '\n\n$1');
  
  return processed;
};

export const hasEnhancementMarkers = (content: string): boolean => {
  return content && content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
};

export const formatMarkdownStructure = (content: string): string => {
  if (!content) return "";
  
  let formatted = cleanMarkdownContent(content);
  
  // Enhanced structure formatting
  formatted = formatted
    // Ensure headers have proper spacing
    .replace(/\n(#{1,6}\s[^\n]+)\n(?!\n)/g, '\n$1\n\n')
    // Ensure paragraphs are properly separated
    .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2')
    // Ensure lists have proper spacing
    .replace(/\n([-*+]\s[^\n]+(?:\n(?![-*+\d])[^\n]+)*)\n(?!\n)/g, '\n$1\n\n')
    .replace(/\n(\d+\.\s[^\n]+(?:\n(?![-*+\d])[^\n]+)*)\n(?!\n)/g, '\n$1\n\n')
    // Clean up any excessive spacing created
    .replace(/\n{3,}/g, '\n\n');
  
  return formatted.trim();
};

export const processAIEnhancedContent = (content: string): string => {
  if (!content) return "";
  
  // Better AI_ENHANCED block processing
  let processed = content
    .replace(/\[AI_ENHANCED\]/g, '<div class="ai-enhanced-block">')
    .replace(/\[\/AI_ENHANCED\]/g, '</div>');
  
  // Ensure AI blocks have proper spacing
  processed = processed
    .replace(/(<div class="ai-enhanced-block">)\n*/g, '\n\n$1\n')
    .replace(/\n*(<\/div>)/g, '\n$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return processed;
};

export const detectContentType = (content: string): 'markdown' | 'html' | 'plain' => {
  if (!content) return 'plain';
  
  // Check for markdown indicators
  const markdownIndicators = [
    /^#{1,6}\s/m,           // Headers
    /\*\*[^*]+\*\*/,        // Bold text
    /\*[^*]+\*/,            // Italic text
    /^[-*+]\s/m,            // Bullet lists
    /^\d+\.\s/m,            // Numbered lists
    /\[AI_ENHANCED\]/,      // AI enhanced blocks
    /```[\s\S]*?```/,       // Code blocks
    /`[^`]+`/               // Inline code
  ];
  
  const hasMarkdown = markdownIndicators.some(pattern => pattern.test(content));
  
  if (hasMarkdown) return 'markdown';
  
  // Check for HTML indicators
  const htmlIndicators = [
    /<[^>]+>/,              // HTML tags
    /&[a-zA-Z]+;/           // HTML entities
  ];
  
  const hasHTML = htmlIndicators.some(pattern => pattern.test(content));
  
  return hasHTML ? 'html' : 'plain';
};
