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
  
  // Clean up malformed/truncated AI enhancement tags before processing
  html = html.replace(/\[(?:AI_)?(?:ENHANCED|ENRICHED)\](?![\s\S]*?\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\])/gi, '');
  
  // Process AI enhancement tags first with simple styling
  const enrichedRegex = /\[(?:AI_)?(?:ENHANCED|ENRICHED)\]([\s\S]*?)\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\]/gi;
  html = html.replace(enrichedRegex, '<div class="ai-enhanced-simple">$1</div>');
  
  // Process fenced code blocks first (to avoid conflicts)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Process inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Process headers (# to ######) - most specific first
  html = html.replace(/^#{6}\s+(.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#{5}\s+(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#{4}\s+(.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^#{3}\s+(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#{2}\s+(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#{1}\s+(.*)$/gm, '<h1>$1</h1>');
  
  // Process blockquotes
  html = html.replace(/^>\s*(.*)$/gm, '<blockquote class="simple-blockquote">$1</blockquote>');
  
  // Process horizontal rules
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr>');
  
  // Process Questions and Answers
  html = html.replace(/^(Q\d+[.:\-]?\s+.*)$/gm, '<div class="question-text">$1</div>');
  html = html.replace(/^(Question\s*\d*[.:\-]?\s+.*)$/gmi, '<div class="question-text">$1</div>');
  html = html.replace(/^(Answer[.:\-]?\s+.*)$/gmi, '<div class="answer-text">$1</div>');
  
  // Process lists - handle both bullet and numbered lists
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listType = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBulletList = /^[\s]*[-•*]\s+(.*)$/.test(line);
    const isNumberedList = /^\d+\.\s+(.*)$/.test(line);
    
    if (isBulletList || isNumberedList) {
      const content = line.replace(/^[\s]*[-•*]\s+|^\d+\.\s+/, '');
      
      if (!inList) {
        // Start new list
        listType = isBulletList ? 'ul' : 'ol';
        processedLines.push(`<${listType}>`);
        inList = true;
      } else if ((isBulletList && listType === 'ol') || (isNumberedList && listType === 'ul')) {
        // Switch list type
        processedLines.push(`</${listType}>`);
        listType = isBulletList ? 'ul' : 'ol';
        processedLines.push(`<${listType}>`);
      }
      
      processedLines.push(`<li>${content.replace(/\n/g, ' ')}</li>`);
    } else {
      // Not a list item
      if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
      }
      processedLines.push(line);
    }
  }
  
  // Close any open list
  if (inList) {
    processedLines.push(`</${listType}>`);
  }
  
  html = processedLines.join('\n');
  
  // Process bold and italic formatting
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Process strikethrough
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
  
  // Handle line breaks and paragraphs
  html = html.replace(/\r\n/g, '\n').trim();
  
  // Clean up extra blank lines that cause spacing issues
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Split by double newlines for paragraphs, but be smarter about lists and Q&A
  const blocks = html.split(/\n\s*\n/);
  const processedBlocks = blocks.map(block => {
    if (!block.trim()) return '';
    
    // Don't wrap blocks that are already HTML elements
    if (block.match(/^<(h[1-6]|div|blockquote|ul|ol|pre|hr|li)/)) {
    // Special handling for lists - don't add br tags between list items
    if (block.match(/^<(ul|ol)/)) {
      return block; // Return list blocks as-is without adding br tags
    }
    // For other HTML elements, don't add line breaks that could affect spacing
    return block;
    }
    
    // Don't wrap single list items in paragraphs if they're already processed
    if (block.match(/^<li>.*<\/li>$/)) {
      return block;
    }
    
    // Don't wrap question/answer blocks in extra paragraphs
    if (block.match(/^<div class="(question-text|answer-text)">/)) {
      return block.replace(/\n/g, '<br>');
    }
    
    // For plain text blocks, only wrap in paragraphs if they don't contain list items
    if (block.includes('<li>') || block.includes('<ul>') || block.includes('<ol>')) {
      return block.replace(/\n/g, '<br>');
    }
    
    // Wrap plain text in paragraph tags
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).filter(block => block.length > 0);
  
  return processedBlocks.join('\n');
};

// Process any content to ensure consistent markdown formatting
export const processContentForDisplay = (content: string): string => {
  if (!content) return '';
  
  // Check if content has expansion blocks - if so, preserve them
  if (content.includes('ai-expansion-content')) {
    // Content has expansion blocks and is already processed HTML, return as-is
    return content;
  }
  
  // Check if content already has ai-enhanced-simple divs - preserve them
  if (content.includes('ai-enhanced-simple')) {
    // Content already has AI enhancement styling applied, preserve it
    return content;
  }
  
  // Check if content is already properly formatted HTML
  // Look for common HTML block elements that indicate structured content
  const hasHtmlStructure = content.includes('<p>') || 
                          content.includes('<div>') || 
                          content.includes('<h1>') || 
                          content.includes('<h2>') || 
                          content.includes('<h3>') || 
                          content.includes('<ul>') || 
                          content.includes('<ol>') || 
                          content.includes('<li>') ||
                          content.includes('<br>');
  
  if (hasHtmlStructure) {
    // Content is already HTML, return as-is to avoid corruption
    return content;
  }
  
  // If content has basic HTML tags but no structure, it might need conversion
  if (content.includes('<') && content.includes('>')) {
    // Check if it's just inline tags or malformed - convert safely
    const cleanMarkdown = htmlToMarkdown(content);
    return markdownToHtml(cleanMarkdown);
  }
  
  // If pure markdown or hybrid content, process directly
  return markdownToHtml(content);
};