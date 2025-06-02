
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

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
  textAlign = 'left'
}: RichTextDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      // Apply text alignment to all elements that don't already have alignment
      const hasExplicitAlignment = content.includes('text-align:');
      
      if (!hasExplicitAlignment) {
        const elements = containerRef.current.querySelectorAll('p, div, ul, ol, h1, h2, h3, h4, h5, h6');
        elements.forEach(element => {
          if (!(element as HTMLElement).style.textAlign) {
            (element as HTMLElement).style.textAlign = textAlign;
          }
        });
      }
    }
  }, [content, textAlign]);

  if (!content) {
    return <p className="text-muted-foreground italic">This note has no content.</p>;
  }

  // Check if content contains markdown syntax
  const containsMarkdownSyntax = /^(#|\*|-|\d+\.|>|`{3})/m.test(content);
  
  if (containsMarkdownSyntax) {
    return (
      <div 
        ref={containerRef}
        className={`prose max-w-none ${className}`}
        style={{ 
          fontSize: fontSize ? `${fontSize}px` : undefined,
          textAlign: !content.includes('text-align:') ? textAlign : undefined
        }}
      >
        <ReactMarkdown
          components={{
            // Ensure proper paragraph spacing
            p: ({children}) => <p className="mb-4">{children}</p>,
            // Ensure proper bullet point formatting
            ul: ({children}) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
            li: ({children}) => <li className="text-left">{children}</li>,
            // Headers with proper spacing
            h1: ({children}) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
            h2: ({children}) => <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>,
            h3: ({children}) => <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>,
            // Strong emphasis
            strong: ({children}) => <strong className="font-semibold">{children}</strong>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // For non-markdown content, use simple HTML rendering
  return (
    <div 
      ref={containerRef}
      className={`prose max-w-none ${className}`}
      style={{ 
        fontSize: fontSize ? `${fontSize}px` : undefined,
        textAlign: !content.includes('text-align:') ? textAlign : undefined
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
