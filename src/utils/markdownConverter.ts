import TurndownService from 'turndown';

// Configure Turndown for clean markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
});

// Add custom rules for better conversion
turndownService.addRule('strikethrough', {
  filter: ['del', 's'] as any,
  replacement: (content) => `~~${content}~~`
});

turndownService.addRule('highlight', {
  filter: (node) => {
    return node.nodeName === 'MARK' || 
           (node.classList && node.classList.contains('bg-yellow-200'));
  },
  replacement: (content) => `==${content}==`
});

// Convert HTML to Markdown
export const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  return turndownService.turndown(html);
};

// Enhanced Markdown to HTML converter that handles pure markdown and hybrid content
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  let html = markdown;
  
  // First, handle any existing HTML tags by preserving them
  const htmlTagPattern = /<[^>]+>/g;
  const existingTags: string[] = [];
  html = html.replace(htmlTagPattern, (match) => {
    existingTags.push(match);
    return `__HTML_TAG_${existingTags.length - 1}__`;
  });
  
  // Enhanced content (AI-generated) - process first with robust regex
  // This handles: [ENRICHED], [AI_ENHANCED], [AI_ENRICHED], etc. with case-insensitive matching
  const enrichedRegex = /\[(?:AI_)?(?:ENHANCED|ENRICHED)\]([\s\S]*?)\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\]/gi;
  html = html.replace(enrichedRegex, '<div class="ai-enriched-content">$1</div>');
  
  // Process fenced code blocks first (to avoid conflicts with other processing)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Process headers (# to ######)
  html = html.replace(/^#{6}\s+(.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#{5}\s+(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#{4}\s+(.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^#{3}\s+(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#{2}\s+(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#{1}\s+(.*)$/gm, '<h1>$1</h1>');
  
  // Process inline code (after fenced code blocks)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Process bold and italic formatting
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Process strikethrough
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
  
  // Process blockquotes
  html = html.replace(/^>\s*(.*)$/gm, '<blockquote class="simple-blockquote">$1</blockquote>');
  
  // Process unordered lists (bullet points)
  html = html.replace(/^[\s]*[-•*]\s+(.*)$/gm, '<li>$1</li>');
  
  // Process ordered lists (numbered)
  html = html.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>');
  
  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  
  // Process Questions and Answers
  html = html.replace(/^(Q\d+[.:\-]?\s+.*)$/gm, '<div class="question-text">$1</div>');
  html = html.replace(/^(Question\s*\d*[.:\-]?\s+.*)$/gmi, '<div class="question-text">$1</div>');
  html = html.replace(/^(Answer[.:\-]?\s+.*)$/gmi, '<div class="answer-text">$1</div>');
  
  // Process horizontal rules
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr>');
  
  // Process line breaks - convert double newlines to paragraphs, single to <br>
  html = html
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();
  
  // Split into paragraphs and process
  const paragraphs = html.split(/\n\n+/);
  const processedParagraphs = paragraphs.map(para => {
    if (!para.trim()) return '';
    
    // Skip if already wrapped in HTML tags
    if (para.match(/^<(h[1-6]|div|blockquote|ul|ol|pre|hr)/)) {
      return para.replace(/\n/g, '<br>');
    }
    
    // Wrap in paragraph tags
    return `<p>${para.replace(/\n/g, '<br>')}</p>`;
  }).filter(para => para.length > 0);
  
  html = processedParagraphs.join('');
  
  // Restore HTML tags
  existingTags.forEach((tag, index) => {
    html = html.replace(`__HTML_TAG_${index}__`, tag);
  });
  
  return html;
};

// Process any content to ensure consistent markdown formatting
export const processContentForDisplay = (content: string): string => {
  if (!content) return '';
  
  // If content has HTML tags, convert to clean markdown first, then back to HTML
  if (content.includes('<') && content.includes('>')) {
    const cleanMarkdown = htmlToMarkdown(content);
    return markdownToHtml(cleanMarkdown);
  }
  
  // If pure markdown or hybrid content, process directly
  return markdownToHtml(content);
};