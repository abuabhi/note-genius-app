
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

  return (
    <div 
      ref={containerRef}
      className={`prose max-w-none ${className}`}
      style={{ 
        fontSize: fontSize ? `${fontSize}px` : undefined,
        // Only apply container-level textAlign for blank content or content without explicit alignment
        textAlign: !content.includes('text-align:') ? textAlign : undefined
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
