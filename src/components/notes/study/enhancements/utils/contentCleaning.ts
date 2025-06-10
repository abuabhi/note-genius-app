
/**
 * NUCLEAR FIX: Aggressive content cleaning utilities
 * Strips ALL HTML, prose classes, and TipTap markup before nuclear rendering
 */

export const stripAllHtmlAndProse = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  console.log("🧹 NUCLEAR HTML STRIPPING - Input:", {
    length: content.length,
    hasHTML: /<[^>]*>/g.test(content),
    hasProse: /prose/.test(content)
  });

  let cleaned = content
    // Remove ALL HTML tags completely
    .replace(/<[^>]*>/g, '')
    // Remove any remaining tag-like structures
    .replace(/&lt;[^&]*&gt;/g, '')
    // Remove prose classes and any class attributes
    .replace(/class="[^"]*prose[^"]*"/gi, '')
    .replace(/class='[^']*prose[^']*'/gi, '')
    // Remove TipTap and other editor specific attributes
    .replace(/data-[^=]*="[^"]*"/gi, '')
    .replace(/contenteditable="[^"]*"/gi, '')
    .replace(/spellcheck="[^"]*"/gi, '')
    // Remove inline styles completely
    .replace(/style="[^"]*"/gi, '')
    // Clean up HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    // Remove any remaining attribute-like patterns
    .replace(/\w+="[^"]*"/g, '')
    .replace(/\w+='[^']*'/g, '')
    // Clean up excessive whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim();

  console.log("✅ NUCLEAR HTML STRIPPING - Output:", {
    length: cleaned.length,
    hasHTML: /<[^>]*>/g.test(cleaned),
    hasProse: /prose/.test(cleaned),
    preview: cleaned.substring(0, 100)
  });

  return cleaned;
};

export const detectTipTapContent = (content: string): boolean => {
  const tipTapMarkers = [
    'class="',
    'data-',
    'contenteditable',
    '<p>',
    '<div>',
    'prose'
  ];
  
  return tipTapMarkers.some(marker => content.includes(marker));
};

export const convertHtmlToMarkdown = (html: string): string => {
  return html
    // Convert headers
    .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, text) => {
      const hashes = '#'.repeat(parseInt(level));
      return `\n${hashes} ${text.trim()}\n`;
    })
    // Convert bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Convert italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Convert code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Convert lists
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
    .replace(/<\/div>/gi, '\n')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
