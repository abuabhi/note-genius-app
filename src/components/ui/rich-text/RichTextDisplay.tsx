
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  content: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  removeTitle?: boolean;
  className?: string;
}

export const RichTextDisplay = ({ 
  content, 
  fontSize = 16, 
  textAlign = 'left',
  removeTitle = false,
  className 
}: RichTextDisplayProps) => {
  // Process content to remove auto-generated titles and clean up
  const processedContent = useMemo(() => {
    if (!content) return content;
    
    let processed = content;
    
    // Remove auto-generated title patterns if requested
    if (removeTitle) {
      const titlePatterns = [
        // Markdown headers
        /^#+\s*Analysis of Notes on .+?\n/i,
        /^#+\s*Summary of .+?\n/i,
        /^#+\s*Key Points of .+?\n/i,
        /^#+\s*Improved .+?\n/i,
        /^#+\s*Markdown Version of .+?\n/i,
        /^#+\s*Formal vs Informal Language\n/i,
        /^#+\s*.+? vs .+?\n/i,
        /^#+\s*Summary\s*\n/i,
        /^#+\s*Key Points\s*\n/i,
        /^#+\s*Improved Clarity\s*\n/i,
        // Plain text titles
        /^Analysis of Notes on .+?\n/i,
        /^Summary of .+?\n/i,
        /^Key Points of .+?\n/i,
        /^Improved .+?\n/i,
        /^Markdown Version of .+?\n/i,
        /^Formal vs Informal Language\n/i,
        /^.+? vs .+?\n/i,
        /^Summary\s*\n/i,
        /^Key Points\s*\n/i,
        /^Improved Clarity\s*\n/i,
        // Common AI-generated title patterns
        /^## Summary\n/i,
        /^## Key Points\n/i,
        /^## Improved Clarity\n/i,
        /^# Summary\n/i,
        /^# Key Points\n/i,
        /^# Improved Clarity\n/i,
      ];
      
      titlePatterns.forEach(pattern => {
        processed = processed.replace(pattern, '');
      });
    }
    
    // Clean up excessive spacing
    processed = processed.replace(/\n{3,}/g, '\n\n');
    processed = processed.replace(/^\s+|\s+$/g, '');
    
    return processed.trim();
  }, [content, removeTitle]);

  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  // If content contains HTML tags, render as HTML
  const containsHTML = /<[^>]*>/.test(processedContent);

  if (containsHTML) {
    return (
      <div 
        className={cn(
          `${textAlignClass[textAlign]}`,
          "prose prose-gray max-w-none",
          "prose-p:leading-relaxed prose-p:my-0",
          "prose-strong:font-bold prose-strong:text-current",
          "prose-em:italic prose-em:text-current",
          className
        )}
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ 
          __html: processedContent 
        }}
      />
    );
  }

  // For plain text content, render normally
  return (
    <div 
      className={cn(
        `${textAlignClass[textAlign]}`,
        "leading-relaxed",
        className
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      {processedContent}
    </div>
  );
};
