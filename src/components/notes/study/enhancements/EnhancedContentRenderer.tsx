
import React from 'react';
import { RichTextDisplay } from '@/components/ui/rich-text/RichTextDisplay';
import { TextAlignType } from '../hooks/useStudyViewState';

interface EnhancedContentRendererProps {
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  className?: string;
}

export const EnhancedContentRenderer = ({
  content,
  fontSize,
  textAlign,
  className
}: EnhancedContentRendererProps) => {
  // Check if content has AI enhancement markers
  const hasEnhancementMarkers = content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
  
  if (!hasEnhancementMarkers) {
    // No special markers, render as normal rich text
    return (
      <RichTextDisplay
        content={content}
        fontSize={fontSize}
        textAlign={textAlign}
        className={className}
      />
    );
  }

  // Split content by enhancement markers
  const parts = content.split(/(\[AI_ENHANCED\].*?\[\/AI_ENHANCED\])/gs);
  
  return (
    <div 
      className={`prose max-w-none ${className || ''}`}
      style={{ 
        fontSize: `${fontSize}px`,
        textAlign: textAlign 
      }}
    >
      {parts.map((part, index) => {
        if (part.match(/\[AI_ENHANCED\](.*?)\[\/AI_ENHANCED\]/s)) {
          // Extract content between markers
          const enhancedText = part.replace(/\[AI_ENHANCED\](.*?)\[\/AI_ENHANCED\]/s, '$1');
          return (
            <span
              key={index}
              className="bg-mint-100 border-l-4 border-mint-400 px-2 py-1 rounded-r-md"
              title="AI Enhanced Content"
            >
              <RichTextDisplay
                content={enhancedText}
                fontSize={fontSize}
                textAlign={textAlign}
                removeTitle={true}
              />
            </span>
          );
        } else {
          // Regular content
          return (
            <span key={index}>
              <RichTextDisplay
                content={part}
                fontSize={fontSize}
                textAlign={textAlign}
                removeTitle={true}
              />
            </span>
          );
        }
      })}
    </div>
  );
};
