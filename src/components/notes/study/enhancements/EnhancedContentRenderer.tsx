
import React from 'react';
import { RichTextDisplay } from '@/components/ui/rich-text/RichTextDisplay';
import { TextAlignType } from '../hooks/useStudyViewState';
import { Sparkles } from 'lucide-react';

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

  // Split content by enhancement markers and process each part
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
          const enhancedText = part.replace(/\[AI_ENHANCED\](.*?)\[\/AI_ENHANCED\]/s, '$1').trim();
          
          if (!enhancedText) return null;
          
          return (
            <div
              key={index}
              className="my-4 p-4 bg-gradient-to-r from-mint-50 to-emerald-50 border-l-4 border-mint-400 rounded-r-lg shadow-sm relative overflow-hidden"
            >
              {/* Enhanced content indicator */}
              <div className="flex items-center gap-2 mb-3 text-mint-700">
                <div className="flex items-center justify-center w-6 h-6 bg-mint-100 rounded-full">
                  <Sparkles className="w-3 h-3 text-mint-600" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wide">AI Enhanced</span>
              </div>
              
              {/* Enhanced content */}
              <div className="relative">
                <RichTextDisplay
                  content={enhancedText}
                  fontSize={fontSize}
                  textAlign={textAlign}
                  removeTitle={true}
                  className="prose-mint prose-sm prose-headings:text-mint-800 prose-p:text-mint-700 prose-li:text-mint-700 prose-strong:text-mint-800"
                />
              </div>
              
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-mint-100/30 to-transparent rounded-bl-full pointer-events-none"></div>
            </div>
          );
        } else if (part.trim()) {
          // Regular content - render normally
          return (
            <div key={index} className="my-2">
              <RichTextDisplay
                content={part}
                fontSize={fontSize}
                textAlign={textAlign}
                removeTitle={true}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
