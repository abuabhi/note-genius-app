
import { useEffect, useRef } from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export const RichTextDisplay = ({ 
  content, 
  className = '',
  fontSize,
  textAlign = 'left'
}: RichTextDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Apply text alignment to all paragraphs that don't already have alignment
    if (containerRef.current) {
      const paragraphs = containerRef.current.querySelectorAll('p:not([style*="text-align"])');
      paragraphs.forEach(p => {
        (p as HTMLElement).style.textAlign = textAlign;
      });
    }
  }, [content, textAlign]);

  if (!content) {
    return <p className="text-muted-foreground italic">This note has no content.</p>;
  }

  return (
    <div 
      ref={containerRef}
      className={`prose max-w-none ${className}`}
      style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
