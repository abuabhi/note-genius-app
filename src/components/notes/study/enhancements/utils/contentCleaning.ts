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
    '<h1>',
    '<h2>',
    '<h3>',
    '<ul>',
    '<ol>',
    '<li>',
    '<strong>',
    '<em>',
    'prose'
  ];
  
  return tipTapMarkers.some(marker => content.includes(marker));
};

export const convertHtmlToMarkdown = (html: string): string => {
  console.log("🔄 Converting HTML to Markdown:", {
    inputLength: html.length,
    inputPreview: html.substring(0, 100)
  });

  let markdown = html
    // Convert headers (preserve spacing)
    .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, text) => {
      const hashes = '#'.repeat(parseInt(level));
      return `\n\n${hashes} ${text.trim()}\n\n`;
    })
    
    // Convert bold and strong
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    
    // Convert italic and emphasis
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    
    // Convert code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '\n```\n$1\n```\n')
    
    // Convert unordered lists
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    
    // Convert ordered lists
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    
    // Convert list items
    .replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content) => {
      return `\n- ${content.trim()}`;
    })
    
    // Convert paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1\n\n')
    
    // Convert line breaks
    .replace(/<br[^>]*\/?>/gi, '\n')
    
    // Convert divs (preserve content but remove tags)
    .replace(/<div[^>]*>(.*?)<\/div>/gi, '\n\n$1\n\n')
    
    // Convert spans (just remove tags, keep content)
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    
    // Handle blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n> $1\n')
    
    // Clean up multiple newlines
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/\n{3}/g, '\n\n')
    
    // Clean up whitespace around markdown elements
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim();

  console.log("✅ HTML to Markdown conversion complete:", {
    outputLength: markdown.length,
    outputPreview: markdown.substring(0, 100)
  });

  return markdown;
};
