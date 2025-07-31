
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
    hasEnrichedContent: boolean;
    wordCount: number;
    wasHtmlCleaned: boolean;
  };
}

/**
 * Detect AI-generated HTML content that should be rendered as-is
 */
const detectAIGeneratedContent = (content: string): boolean => {
  if (!content) return false;
  
  // Look for specific AI-generated patterns with styling - MORE COMPREHENSIVE
  const patterns = [
    /#3EB489/i,                       // The exact mint color from DB (any context)
    /#2ECC71/i,                       // Alternative green
    /style="[^"]*color:#[0-9A-Fa-f]{6}/i,  // Any hex colors in styles
    /style="[^"]*color:\s*#[0-9A-Fa-f]{6}/i, // Hex colors with spacing
    /style="[^"]*font-weight:\s*bold/i,     // Bold styling patterns
    /style="[^"]*font-size:\s*1\.[0-9]em/i, // Font size patterns
    /class="ai-enhanced/i,             // AI enhancement classes
    /data-ai-generated/i,              // AI data attributes
    /<strong[^>]*style=/i,             // Styled strong tags
    /<span[^>]*style=[^>]*color:/i,    // Styled span tags with color
    /<div[^>]*style=[^>]*color:/i,     // Styled div tags with color
  ];
  
  return patterns.some(pattern => pattern.test(content));
};

/**
 * NUCLEAR: Single content processor with smart AI-generated content detection
 */
export const processContentForRendering = (rawContent: string): ProcessedContent => {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      content: '',
      type: 'markdown',
      metadata: { hasLists: false, hasHeaders: false, hasAIBlocks: false, hasEnrichedContent: false, wordCount: 0, wasHtmlCleaned: false }
    };
  }

  let processed = rawContent;
  let wasHtmlCleaned = false;

  // Step 1: SMART DETECTION - Check if this is AI-generated HTML content
  if (detectAIGeneratedContent(rawContent)) {
    console.log("🤖 DETECTED AI-GENERATED HTML - Using pass-through mode");
    
    // Pass-through mode: minimal cleanup only, preserve all HTML and inline styles
    processed = processed
      // Only clean HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      // Normalize whitespace but preserve structure
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
    
    const metadata = analyzeContent(processed, false, true);
    
    console.log("✅ AI-generated content preserved:", {
      contentLength: processed.length,
      hasInlineStyles: processed.includes('style='),
      preview: processed.substring(0, 300)
    });
    
    return {
      content: processed,
      type: 'markdown',
      metadata: { ...metadata, hasEnrichedContent: true }
    };
  }

  // Step 2: Traditional processing for regular content - convert HTML to markdown
  if (detectTipTapContent(rawContent)) {
    console.log("🔄 DETECTED HTML/TIPTAP CONTENT - Converting to markdown");
    
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

  // Step 3: Process ENRICHED content - BULLETPROOF HTML approach
  const hasEnrichedContent = processed.includes('[ENRICHED]') || processed.includes('**[ENRICHED]**');
  if (hasEnrichedContent) {
    console.log("🔥 PROCESSING ENRICHED CONTENT MARKERS - BULLETPROOF APPROACH");
    
    // BULLETPROOF: Clean up any existing malformed HTML first
    processed = processed
      .replace(/<div class="enriched-content-section">\s*\*\*🔥 Enhanced Content:\*\*/g, 
               '\n\n<div class="enriched-content-section">\n\n**🔥 Enhanced Content:**\n\n')
      .replace(/<\/div>\s*<div class="enriched-content-section">/g, 
               '\n\n</div>\n\n<div class="enriched-content-section">\n\n');
    
    // BULLETPROOF: Convert enriched markers with MAXIMUM spacing for ReactMarkdown + rehypeRaw
    processed = processed
      // Handle **[ENRICHED]** markers (from new AI responses)
      .replace(/\*\*\[ENRICHED\]\*\*/g, '\n\n\n<div class="enriched-content-section">\n\n**🔥 Enhanced Content:**\n\n')
      .replace(/\*\*\[\/ENRICHED\]\*\*/g, '\n\n</div>\n\n\n')
      // Handle plain [ENRICHED] markers (fallback)
      .replace(/\[ENRICHED\]/g, '\n\n\n<div class="enriched-content-section">\n\n**🔥 Enhanced Content:**\n\n')
      .replace(/\[\/ENRICHED\]/g, '\n\n</div>\n\n\n');
    
    console.log("✅ BULLETPROOF Enriched markers processed:", {
      hasEnrichedDivs: processed.includes('<div class="enriched-content-section">'),
      divCount: (processed.match(/<div class="enriched-content-section">/g) || []).length,
      closingDivCount: (processed.match(/<\/div>/g) || []).length,
      processedPreview: processed.substring(0, 500)
    });
  }

  // Step 4: Clean up any remaining HTML entities and artifacts
  processed = processed
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // Step 5: Ensure HTML divs are closed properly
  const openDivMatches = processed.match(/<div[^>]*>/g) || [];
  const closeDivMatches = processed.match(/<\/div>/g) || [];
  
  if (openDivMatches.length > closeDivMatches.length) {
    const missingCloseDivs = openDivMatches.length - closeDivMatches.length;
    console.warn(`⚠️ Found ${missingCloseDivs} unclosed div tags! Adding closing tags.`);
    
    // Add missing closing tags
    for (let i = 0; i < missingCloseDivs; i++) {
      processed += '\n</div>';
    }
  }

  // Step 6: Normalize whitespace and line breaks
  processed = processed
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .trim();

  // Step 7: Ensure proper markdown structure
  processed = ensureMarkdownStructure(processed);

  const metadata = analyzeContent(processed, wasHtmlCleaned, hasEnrichedContent);

  // Removed console log to clean up output

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
const analyzeContent = (content: string, wasHtmlCleaned: boolean, hasEnrichedContent: boolean) => {
  return {
    hasLists: /^[-*+]\s+|\d+\.\s+/m.test(content),
    hasHeaders: /^#{1,6}\s+/m.test(content),
    hasAIBlocks: content.includes('**✨ AI Enhanced Content:**'),
    hasEnrichedContent: hasEnrichedContent || content.includes('<div class="enriched-content-section">'),
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
