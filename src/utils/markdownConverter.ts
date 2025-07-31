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
  
  // Convert markdown elements to HTML
  html = html
    // Questions (Q1., Q2., etc.) - process before other patterns
    .replace(/^(Q\d+\.\s+.*?)$/gm, '<div class="question-text">$1</div>')
    .replace(/^(Answer:\s+.*?)$/gm, '<div class="answer-text">$1</div>')
    
    // Headers (process in order of specificity)
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Handle bullet points (including • character)
    .replace(/^[\s]*[-•]\s+(.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\.\s+(.*$)/gm, '<li>$2</li>')
    
    // Wrap consecutive list items in ul/ol tags
    .replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/gs, (match) => {
      return `<ul>${match}</ul>`;
    })
    
    // Convert line breaks to HTML breaks (but not inside HTML tags)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    
    // Wrap content in paragraph tags if not already wrapped
    .replace(/^(?!<[uo]l>|<h[1-6]>|<p>)(.*?)(?=<|$)/gm, '<p>$1</p>')
    
    // Clean up empty paragraphs and malformed HTML
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[uo]l>.*?<\/[uo]l>)<\/p>/gs, '$1')
    .replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/gs, '$1');
  
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