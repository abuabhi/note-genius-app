
/**
 * NUCLEAR REWRITE: Unified Content Processor
 * This is the SINGLE source of truth for all content processing
 */

import { convertHtmlToMarkdown, detectTipTapContent } from './contentCleaning';

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
 * NUCLEAR: Single content processor for ALL content types - PROPER HTML TO MARKDOWN CONVERSION
 */
export const processContentForRendering = (rawContent: string): ProcessedContent => {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      content: '',
      type: 'markdown',
      metadata: { hasLists: false, hasHeaders: false, hasAIBlocks: false, wordCount: 0, wasHtmlCleaned: false }
    };
  }

  console.log("🚀 UNIFIED PROCESSOR: Processing content:", {
    originalLength: rawContent.length,
    hasTipTapMarkers: detectTipTapContent(rawContent),
    preview: rawContent.substring(0, 200)
  });

  let processed = rawContent;
  let wasHtmlCleaned = false;

  // Step 1: FIRST convert HTML structures to markdown (BEFORE any stripping)
  if (detectTipTapContent(rawContent)) {
    console.log("🔄 DETECTED HTML/TIPTAP CONTENT - Converting to markdown FIRST");
    
    // Convert HTML structures to markdown BEFORE cleaning
    processed = convertHtmlToMarkdown(processed);
    wasHtmlCleaned = true;
    
    console.log("✅ HTML converted to markdown:", {
      beforeLength: rawContent.length,
      afterLength: processed.length,
      preview: processed.substring(0, 200)
    });
  }

  // Step 2: Process AI_ENHANCED blocks (convert to proper markdown)
  const hasAIBlocks = processed.includes('[AI_ENHANCED]') || processed.includes('<div class="ai-enhanced-block">');
  if (hasAIBlocks) {
    // Convert AI enhanced blocks to proper markdown sections
    processed = processed
      .replace(/\[AI_ENHANCED\]/g, '\n\n**✨ AI Enhanced Content:**\n\n')
      .replace(/\[\/AI_ENHANCED\]/g, '\n\n---\n\n')
      .replace(/<div class="ai-enhanced-block">/g, '\n\n**✨ AI Enhanced Content:**\n\n')
      .replace(/<\/div>/g, '\n\n---\n\n');
  }

  // Step 3: Clean up any remaining HTML entities and artifacts
  processed = processed
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // Step 4: Clean up any remaining HTML tags (AFTER conversion)
  processed = processed.replace(/<[^>]*>/g, '');

  // Step 5: Normalize whitespace and line breaks
  processed = processed
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .trim();

  // Step 6: Ensure proper markdown structure
  processed = ensureMarkdownStructure(processed);

  const metadata = analyzeContent(processed, wasHtmlCleaned);

  console.log("✅ UNIFIED PROCESSOR: Content processed:", {
    finalLength: processed.length,
    metadata,
    hasAIBlocks,
    wasHtmlCleaned,
    finalPreview: processed.substring(0, 200)
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
      const prevText = str.substring(Math.max(0, lineStart - 50), lineStart);
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
    hasAIBlocks: content.includes('**✨ AI Enhanced Content:**'),
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
