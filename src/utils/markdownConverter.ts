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
  
  // Normalize line breaks - convert multiple newlines to proper paragraph breaks
  html = html
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();
  
  // Split content into blocks (separated by double newlines)
  const blocks = html.split(/\n\n+/);
  const processedBlocks: string[] = [];
  
  blocks.forEach(block => {
    if (!block.trim()) return;
    
    let processedBlock = block.trim();
    
    // Enhanced content (AI-generated) - process first with robust regex
    // This handles: [ENRICHED], [AI_ENHANCED], [AI_ENRICHED], etc. with case-insensitive matching
    const enrichedRegex = /\[(?:AI_)?(?:ENHANCED|ENRICHED)\]([\s\S]*?)\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\]/gi;
    processedBlock = processedBlock.replace(enrichedRegex, '<div class="ai-enriched-content">$1</div>');
    
    // Questions (Q1., Q2., etc.) - process after enriched content
    if (/^(Q\d+[.:\-]?\s+.*?)$/m.test(processedBlock)) {
      processedBlock = processedBlock.replace(/^(Q\d+[.:\-]?\s+.*?)$/gm, '<div class="question-text">$1</div>');
    }
    else if (/^(Question\s*\d*[.:\-]?\s+.*?)$/mi.test(processedBlock)) {
      processedBlock = processedBlock.replace(/^(Question\s*\d*[.:\-]?\s+.*?)$/gmi, '<div class="question-text">$1</div>');
    }
    else if (/^(Answer[.:\-]?\s+.*?)$/mi.test(processedBlock)) {
      processedBlock = processedBlock.replace(/^(Answer[.:\-]?\s+.*?)$/gmi, '<div class="answer-text">$1</div>');
    }
    // Blockquotes
    else if (/^>\s*/.test(processedBlock)) {
      processedBlock = processedBlock
        .replace(/^>\s*(.*$)/gm, '$1')
        .replace(/\n/g, '<br>');
      processedBlock = `<blockquote class="simple-blockquote">${processedBlock}</blockquote>`;
    }
    // Headers
    else if (/^#{1,6}\s+/.test(processedBlock)) {
      processedBlock = processedBlock
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>');
    }
    // Lists (bullet points or numbered)
    else if (/^[\s]*[-•]\s+/.test(processedBlock) || /^\d+\.\s+/.test(processedBlock)) {
      processedBlock = processedBlock
        .replace(/^[\s]*[-•]\s+(.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\.\s+(.*$)/gm, '<li>$2</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      processedBlock = `<ul>${processedBlock}</ul>`;
    }
    // Regular paragraphs
    else {
      // Handle inline formatting within paragraphs
      processedBlock = processedBlock
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>'); // Convert single line breaks to <br>
      processedBlock = `<p>${processedBlock}</p>`;
    }
    
    processedBlocks.push(processedBlock);
  });
  
  html = processedBlocks.join('');
  
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