
/**
 * NUCLEAR REWRITE: Unified Content Processor
 * This is the SINGLE source of truth for all content processing
 */

import { stripAllHtmlAndProse, detectTipTapContent, convertHtmlToMarkdown } from './contentCleaning';

export interface ProcessedContent {
  content: string;
  type: 'markdown';
  metadata: {
    hasLists: boolean;
    hasHeaders: boolean;
    hasAIBlocks: boolean;
    wordCount: number;
    wasHtmlCleaned: boolean;
  };
}

/**
 * NUCLEAR: Single content processor for ALL content types with enhanced HTML cleaning
 */
export const processContentForRendering = (rawContent: string): ProcessedContent => {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      content: '',
      type: 'markdown',
      metadata: { hasLists: false, hasHeaders: false, hasAIBlocks: false, wordCount: 0, wasHtmlCleaned: false }
    };
  }

  console.log("🚀 NUCLEAR PROCESSOR: Processing content:", {
    originalLength: rawContent.length,
    hasTipTapMarkers: detectTipTapContent(rawContent),
    preview: rawContent.substring(0, 100)
  });

  let processed = rawContent;
  let wasHtmlCleaned = false;

  // Step 1: Detect and aggressively clean HTML/TipTap content
  if (detectTipTapContent(rawContent)) {
    console.log("🧹 DETECTED HTML/TIPTAP CONTENT - Applying aggressive cleaning");
    
    // First convert HTML structures to markdown
    processed = convertHtmlToMarkdown(processed);
    
    // Then strip ALL remaining HTML and prose classes
    processed = stripAllHtmlAndProse(processed);
    
    wasHtmlCleaned = true;
  } else {
    // Even for non-TipTap content, do basic HTML cleanup
    processed = processed
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  // Step 2: Process AI_ENHANCED blocks
  const hasAIBlocks = processed.includes('[AI_ENHANCED]');
  if (hasAIBlocks) {
    processed = processed
      .replace(/\[AI_ENHANCED\]/g, '<div class="ai-enhanced-block">')
      .replace(/\[\/AI_ENHANCED\]/g, '</div>');
  }

  // Step 3: Normalize whitespace and line breaks
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

  // Step 4: Ensure proper markdown structure
  processed = ensureMarkdownStructure(processed);

  const metadata = analyzeContent(processed, wasHtmlCleaned);

  console.log("✅ NUCLEAR PROCESSOR: Content processed:", {
    finalLength: processed.length,
    metadata,
    hasAIBlocks,
    wasHtmlCleaned
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
const analyzeContent = (content: string, wasHtmlCleaned: boolean) => {
  return {
    hasLists: /^[-*+]\s+|\d+\.\s+/m.test(content),
    hasHeaders: /^#{1,6}\s+/m.test(content),
    hasAIBlocks: content.includes('<div class="ai-enhanced-block">'),
    wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
    wasHtmlCleaned
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
