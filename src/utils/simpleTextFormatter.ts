// Simple text formatter that handles basic markdown-like formatting
// Only supports: **bold**, *italic*, bullet points, and line breaks

export const formatSimpleText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Clean up the text first
  let formatted = text
    // Handle line breaks - convert double newlines to paragraphs
    .replace(/\n\n+/g, '</p><p>')
    // Handle single newlines as line breaks  
    .replace(/\n/g, '<br>')
    // Handle bold text **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle italic text *text*
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle bullet points (- or • at start of line)
    .replace(/^[-•]\s*(.*?)(<br>|$)/gm, '<li>$1</li>')
    // Handle numbered lists (1. 2. etc.)
    .replace(/^\d+\.\s*(.*?)(<br>|$)/gm, '<li>$1</li>');

  // Wrap in paragraph tags if not already wrapped
  if (!formatted.startsWith('<') && formatted.trim().length > 0) {
    formatted = `<p>${formatted}</p>`;
  }

  // Convert consecutive list items to proper lists
  formatted = formatted
    .replace(/(<li>.*?<\/li>)(?:\s*<br>\s*)?(?=<li>)/g, '$1')
    .replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/g, '<ul>$1</ul>');

  // Clean up empty paragraphs and extra breaks
  formatted = formatted
    .replace(/<p><\/p>/g, '')
    .replace(/<br>\s*<br>/g, '<br>')
    .replace(/(<\/p>)\s*(<p>)/g, '$1$2');

  return formatted.trim();
};