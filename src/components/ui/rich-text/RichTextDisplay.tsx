
import { useEffect, useRef } from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export const RichTextDisplay = ({ 
  content, 
  className = '',
  fontSize,
  textAlign = 'left'  // Default to left alignment explicitly
}: RichTextDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Apply text alignment to all paragraphs that don't already have alignment
    if (containerRef.current) {
      // First, check if the content already has explicit alignment 
      // If it does, respect that alignment instead of overriding
      const hasExplicitAlignment = content.includes('text-align:');
      
      // Only apply our textAlign if content doesn't specify its own
      if (!hasExplicitAlignment) {
        const paragraphs = containerRef.current.querySelectorAll('p:not([style*="text-align"])');
        paragraphs.forEach(p => {
          (p as HTMLElement).style.textAlign = textAlign;
        });
        
        // Also check for div elements without alignment
        const divs = containerRef.current.querySelectorAll('div:not([style*="text-align"]):not(.prose)');
        divs.forEach(div => {
          (div as HTMLElement).style.textAlign = textAlign;
        });
      }
    }
  }, [content, textAlign]);

  if (!content) {
    return <p className="text-muted-foreground italic">This note has no content.</p>;
  }

  // Check if content appears to be markdown with # headers, * lists, etc.
  const containsMarkdownSyntax = /^(#|\*|-|\d+\.|>|`{3})/m.test(content);
  
  // Preserve markdown formatting by converting markdown syntax to HTML
  const processedContent = containsMarkdownSyntax 
    ? convertMarkdownToHtml(content)
    : content;

  return (
    <div 
      ref={containerRef}
      className={`prose max-w-none ${className}`}
      style={{ 
        fontSize: fontSize ? `${fontSize}px` : undefined,
        // Only apply container-level textAlign for blank content or content without explicit alignment
        textAlign: !content.includes('text-align:') ? textAlign : undefined
      }}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

// Basic markdown to HTML conversion function
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Convert headers - e.g., # Header 1 to <h1>Header 1</h1>
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  
  // Convert bold - e.g., **bold** to <strong>bold</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic - e.g., *italic* to <em>italic</em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert unordered lists - e.g., - item to <ul><li>item</li></ul>
  // Process list items first
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
  
  // Wrap in ul (this is simplistic and doesn't handle nested lists)
  html = html.replace(/(<li>.*<\/li>)\n(?!<li>)/g, '<ul>$1</ul>');
  html = html.replace(/(?<!<\/ul>)\n<li>/g, '<ul><li>');
  
  // Convert paragraphs - preserve line breaks
  html = html.replace(/^(?!<[h|u|o|l]|<li|<strong|<em)(.*$)/gm, '<p>$1</p>');
  
  return html;
}
