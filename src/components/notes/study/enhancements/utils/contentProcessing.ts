
/**
 * SIMPLIFIED: Content processing utilities for unified rendering
 */

export const cleanMarkdownContent = (content: string): string => {
  if (!content) return "";
  
  // Basic cleanup while preserving markdown structure
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
    .replace(/\r/g, '\n')
    // Clean up excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Clean up excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return cleaned;
};

export const processAIEnhancedContent = (content: string): string => {
  if (!content) return "";
  
  // Convert AI_ENHANCED markers to HTML divs
  let processed = content
    .replace(/\[AI_ENHANCED\]/g, '<div class="ai-enhanced-block">')
    .replace(/\[\/AI_ENHANCED\]/g, '</div>');
  
  // Ensure proper spacing around AI blocks
  processed = processed
    .replace(/(<div class="ai-enhanced-block">)\n*/g, '\n\n$1\n')
    .replace(/\n*(<\/div>)/g, '\n$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  console.log("🔧 AI_ENHANCED processing:", {
    originalHadTags: content.includes('[AI_ENHANCED]'),
    processedHasDivs: processed.includes('<div class="ai-enhanced-block">'),
    tagCount: (content.match(/\[AI_ENHANCED\]/g) || []).length
  });
  
  return processed;
};

export const hasEnhancementMarkers = (content: string): boolean => {
  return content && content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
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
