
/**
 * DRASTIC REWRITE: Content processing utilities for unified rendering - ALL CONTENT AS MARKDOWN
 */

export const cleanMarkdownContent = (content: string): string => {
  if (!content) return "";
  
  console.log("🧹 DRASTIC CLEANUP: Processing content for markdown rendering");
  
  // Aggressive cleanup while preserving markdown structure
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
    // Clean up excessive whitespace but preserve structure
    .replace(/[ \t]+/g, ' ')
    // Clean up excessive newlines but preserve paragraph breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .trim();
  
  console.log("🎯 DRASTIC CLEANUP: Content processed:", {
    originalLength: content.length,
    cleanedLength: cleaned.length,
    hasMarkdownStructure: /^[-*+]\s|^\d+\.\s|^#{1,6}\s/m.test(cleaned)
  });
  
  return cleaned;
};

export const processAIEnhancedContent = (content: string): string => {
  if (!content) return "";
  
  console.log("🚀 DRASTIC PROCESSING: AI_ENHANCED content processing");
  
  // Convert AI_ENHANCED markers to HTML divs for markdown processing
  let processed = content
    .replace(/\[AI_ENHANCED\]/g, '<div class="ai-enhanced-block">')
    .replace(/\[\/AI_ENHANCED\]/g, '</div>');
  
  // Ensure proper spacing around AI blocks
  processed = processed
    .replace(/(<div class="ai-enhanced-block">)\n*/g, '\n\n$1\n')
    .replace(/\n*(<\/div>)/g, '\n$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  console.log("🔧 DRASTIC AI_ENHANCED processing:", {
    originalHadTags: content.includes('[AI_ENHANCED]'),
    processedHasDivs: processed.includes('<div class="ai-enhanced-block">'),
    tagCount: (content.match(/\[AI_ENHANCED\]/g) || []).length,
    finalLength: processed.length
  });
  
  return processed;
};

export const hasEnhancementMarkers = (content: string): boolean => {
  return content && content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
};

export const detectContentType = (content: string): 'markdown' => {
  // DRASTIC REWRITE: Everything is markdown now - no exceptions
  console.log("🎯 DRASTIC DETECTION: EVERYTHING IS MARKDOWN");
  return 'markdown';
};
