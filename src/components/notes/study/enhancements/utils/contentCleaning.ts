/**
 * NUCLEAR FIX: Aggressive content cleaning utilities
 * Strips ALL HTML, prose classes, and TipTap markup before nuclear rendering
 */

export const stripAllHtmlAndProse = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  console.log("🧹 SMART HTML CLEANING - Input:", {
    length: content.length,
    hasHTML: /<[^>]*>/g.test(content),
    hasProse: /prose/.test(content)
  });

  let cleaned = content
    // First convert HTML to markdown BEFORE stripping (preserve formatting)
    .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, text) => {
      const hashes = '#'.repeat(parseInt(level));
      return `\n\n${hashes} ${text.trim()}\n\n`;
    })
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1\n')
    .replace(/<br[^>]*\/?>/gi, '\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    
    // NOW remove editor-specific attributes and classes
    .replace(/class="[^"]*prose[^"]*"/gi, '')
    .replace(/class='[^']*prose[^']*'/gi, '')
    .replace(/data-[^=]*="[^"]*"/gi, '')
    .replace(/contenteditable="[^"]*"/gi, '')
    .replace(/spellcheck="[^"]*"/gi, '')
    .replace(/style="[^"]*"/gi, '')
    
    // Remove any remaining empty HTML tags
    .replace(/<[^>]*><\/[^>]*>/g, '')
    .replace(/<[^>]*\/>/g, '')
    
    // Clean up HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    
    // Clean up whitespace while preserving structure
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/\n{3}/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim();

  console.log("✅ SMART HTML CLEANING - Output:", {
    length: cleaned.length,
    hasHTML: /<[^>]*>/g.test(cleaned),
    preview: cleaned.substring(0, 200)
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
  console.log("🔄 ENHANCED HTML to Markdown conversion:", {
    inputLength: html.length,
    inputPreview: html.substring(0, 100)
  });

  let markdown = html
    // Convert headers with better spacing
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
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '\n\n```\n$1\n```\n\n')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '\n\n```\n$1\n```\n\n')
    
    // IMPROVED: Convert unordered lists with proper spacing
    .replace(/<ul[^>]*>/gi, '\n\n')
    .replace(/<\/ul>/gi, '\n\n')
    
    // IMPROVED: Convert ordered lists with proper spacing
    .replace(/<ol[^>]*>/gi, '\n\n')
    .replace(/<\/ol>/gi, '\n\n')
    
    // IMPROVED: Convert list items with proper spacing between items
    .replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content) => {
      const cleanContent = content.trim().replace(/<[^>]*>/g, '');
      return `\n- ${cleanContent}\n`;
    })
    
    // IMPROVED: Convert paragraphs with consistent spacing
    .replace(/<p[^>]*>(.*?)<\/p>/gi, (match, content) => {
      const cleanContent = content.trim().replace(/<[^>]*>/g, '');
      return `\n\n${cleanContent}\n\n`;
    })
    
    // Convert line breaks
    .replace(/<br[^>]*\/?>/gi, '\n')
    
    // IMPROVED: Convert divs with better spacing
    .replace(/<div[^>]*>(.*?)<\/div>/gi, (match, content) => {
      const cleanContent = content.trim().replace(/<[^>]*>/g, '');
      return cleanContent ? `\n\n${cleanContent}\n\n` : '';
    })
    
    // Convert spans (just remove tags, keep content)
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    
    // Handle blockquotes with proper spacing
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n\n> $1\n\n')
    
    // IMPROVED: Clean up excessive newlines more carefully
    .replace(/\n{5,}/g, '\n\n\n')
    .replace(/\n{4}/g, '\n\n\n')
    .replace(/\n{3}/g, '\n\n')
    
    // IMPROVED: Ensure list items have proper spacing
    .replace(/(\n- [^\n]+)\n(\n- )/g, '$1\n$2')
    .replace(/(\n- [^\n]+)(\n- )/g, '$1\n$2')
    
    // Clean up whitespace
    .replace(/^\s+|\s+$/gm, '')
    .trim();

  console.log("✅ ENHANCED HTML to Markdown complete:", {
    outputLength: markdown.length,
    outputPreview: markdown.substring(0, 200),
    hasBulletPoints: markdown.includes('- '),
    listItemCount: (markdown.match(/\n- /g) || []).length
  });

  return markdown;
};
