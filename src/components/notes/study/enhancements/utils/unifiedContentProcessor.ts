
/**
 * NUCLEAR REWRITE: Unified Content Processor
 * This is the SINGLE source of truth for all content processing
 */

export interface ProcessedContent {
  content: string;
  type: 'markdown';
  metadata: {
    hasLists: boolean;
    hasHeaders: boolean;
    hasAIBlocks: boolean;
    wordCount: number;
  };
}

/**
 * NUCLEAR: Single content processor for ALL content types
 */
export const processContentForRendering = (rawContent: string): ProcessedContent => {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      content: '',
      type: 'markdown',
      metadata: { hasLists: false, hasHeaders: false, hasAIBlocks: false, wordCount: 0 }
    };
  }

  console.log("🚀 NUCLEAR PROCESSOR: Processing content:", {
    originalLength: rawContent.length,
    preview: rawContent.substring(0, 100)
  });

  // Step 1: Aggressive HTML cleanup while preserving structure
  let processed = rawContent
    // Remove all HTML tags except those we'll convert
    .replace(/<(?!\/?(div|p|br|ul|ol|li|h[1-6]|strong|em|code|pre))[^>]*>/gi, '')
    // Convert HTML structures to markdown
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, text) => {
      const hashes = '#'.repeat(parseInt(level));
      return `\n${hashes} ${text}\n`;
    })
    // Convert HTML lists to markdown
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Convert paragraphs and breaks
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n');

  // Step 2: Clean up HTML entities
  processed = processed
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // Step 3: Process AI_ENHANCED blocks
  const hasAIBlocks = processed.includes('[AI_ENHANCED]');
  if (hasAIBlocks) {
    processed = processed
      .replace(/\[AI_ENHANCED\]/g, '<div class="ai-enhanced-block">')
      .replace(/\[\/AI_ENHANCED\]/g, '</div>');
  }

  // Step 4: Normalize whitespace and line breaks
  processed = processed
    // Fix line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Clean up excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Clean up excessive newlines but preserve structure
    .replace(/\n{4,}/g, '\n\n\n')
    // Remove leading/trailing whitespace from lines
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .trim();

  // Step 5: Ensure proper markdown structure
  processed = ensureMarkdownStructure(processed);

  const metadata = analyzeContent(processed);

  console.log("✅ NUCLEAR PROCESSOR: Content processed:", {
    finalLength: processed.length,
    metadata,
    hasAIBlocks
  });

  return {
    content: processed,
    type: 'markdown',
    metadata
  };
};

/**
 * Ensure proper markdown structure with spacing
 */
const ensureMarkdownStructure = (content: string): string => {
  return content
    // Ensure headers have proper spacing
    .replace(/^(#{1,6}\s+.+)$/gm, '\n$1\n')
    // Ensure list items are properly formatted
    .replace(/^[-*+]\s+(.+)$/gm, '- $1')
    .replace(/^\d+\.\s+(.+)$/gm, (match, text, offset, str) => {
      const lineStart = str.lastIndexOf('\n', offset) + 1;
      const prevText = str.substring(lineStart - 20, lineStart);
      const listNum = (prevText.match(/^\d+\./gm) || []).length + 1;
      return `${listNum}. ${text}`;
    })
    // Clean up multiple newlines again
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Analyze content for metadata
 */
const analyzeContent = (content: string) => {
  return {
    hasLists: /^[-*+]\s+|\d+\.\s+/m.test(content),
    hasHeaders: /^#{1,6}\s+/m.test(content),
    hasAIBlocks: content.includes('<div class="ai-enhanced-block">'),
    wordCount: content.split(/\s+/).filter(word => word.length > 0).length
  };
};

/**
 * NUCLEAR: Validate content before rendering
 */
export const validateContentForRendering = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  if (content.trim().length === 0) return false;
  return true;
};
