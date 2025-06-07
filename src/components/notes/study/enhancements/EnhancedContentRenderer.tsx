
import React from 'react';
import { RichTextDisplay } from '@/components/ui/rich-text/RichTextDisplay';
import { TextAlignType } from '../hooks/useStudyViewState';
import { Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  
  // Enhanced markdown styles for AI content
  const enhancedMarkdownClasses = `
    prose prose-mint max-w-none prose-sm
    prose-headings:text-gray-800 prose-headings:font-medium prose-headings:mb-3 prose-headings:mt-4
    prose-h1:text-lg prose-h1:mb-4 prose-h1:mt-5 prose-h1:font-semibold
    prose-h2:text-base prose-h2:mb-3 prose-h2:mt-4 prose-h2:font-medium
    prose-h3:text-sm prose-h3:mb-2 prose-h3:mt-3 prose-h3:font-medium
    prose-p:text-gray-700 prose-p:leading-6 prose-p:mb-3 prose-p:text-sm
    prose-li:text-gray-700 prose-li:mb-1 prose-li:leading-6 prose-li:text-sm
    prose-ul:mb-4 prose-ol:mb-4 prose-ul:space-y-1 prose-ol:space-y-1
    prose-ul:pl-4 prose-ol:pl-4
    prose-li:marker:text-mint-600 prose-li:marker:font-medium
    prose-strong:text-gray-800 prose-strong:font-semibold
    prose-em:text-gray-700 prose-em:italic
  `;
  
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
          
          // Determine enhancement type based on content
          const isStudyTip = enhancedText.includes('Study Tip') || enhancedText.includes('Remember:');
          const isExample = enhancedText.includes('Example:') || enhancedText.includes('Real-World');
          
          // Choose styling based on enhancement type
          let containerClasses = "my-4 p-4 rounded-lg border-l-4 relative overflow-hidden transition-all duration-200 hover:shadow-sm";
          let iconClasses = "w-4 h-4";
          let icon = null;
          
          if (isStudyTip) {
            containerClasses += " bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-400";
            icon = <Lightbulb className={`${iconClasses} text-amber-600`} />;
          } else if (isExample) {
            containerClasses += " bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400";
          } else {
            containerClasses += " bg-gradient-to-r from-mint-50 to-emerald-50 border-mint-400";
          }
          
          return (
            <div key={index} className={containerClasses}>
              {/* Optional icon for study tips */}
              {icon && (
                <div className="flex items-center gap-2 mb-3 opacity-75">
                  <div className="flex items-center justify-center w-5 h-5 bg-white/60 rounded-full">
                    {icon}
                  </div>
                </div>
              )}
              
              {/* Enhanced content with proper markdown rendering */}
              <div className={`relative ${enhancedMarkdownClasses}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {enhancedText}
                </ReactMarkdown>
              </div>
              
              {/* Subtle decorative element */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full pointer-events-none"></div>
            </div>
          );
        } else if (part.trim()) {
          // Regular content - render normally with inline integration
          return (
            <div key={index} className="leading-relaxed mb-4">
              <RichTextDisplay
                content={part}
                fontSize={fontSize}
                textAlign={textAlign}
                removeTitle={true}
                className="prose-p:mb-4 prose-headings:mb-3 prose-headings:mt-5"
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
