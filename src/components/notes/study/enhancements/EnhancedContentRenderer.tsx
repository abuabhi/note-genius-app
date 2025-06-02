
import { ReactNode } from 'react';
import { RichTextDisplay } from '@/components/ui/rich-text/RichTextDisplay';
import { TextAlignType } from '../hooks/useStudyViewState';

interface EnhancedContentRendererProps {
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  className?: string;
}

interface ParsedContent {
  type: 'original' | 'enhanced';
  content: string;
}

const parseEnhancedContent = (content: string): ParsedContent[] => {
  const parts: ParsedContent[] = [];
  const enhancementRegex = /\[AI_ENHANCED\]([\s\S]*?)\[\/AI_ENHANCED\]/g;
  
  let lastIndex = 0;
  let match;
  let hasMarkers = false;
  
  while ((match = enhancementRegex.exec(content)) !== null) {
    hasMarkers = true;
    
    // Add original content before the enhancement
    if (match.index > lastIndex) {
      const originalContent = content.slice(lastIndex, match.index);
      if (originalContent.trim()) {
        parts.push({
          type: 'original',
          content: originalContent
        });
      }
    }
    
    // Add enhanced content
    parts.push({
      type: 'enhanced',
      content: match[1]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining original content
  if (hasMarkers && lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex);
    if (remainingContent.trim()) {
      parts.push({
        type: 'original',
        content: remainingContent
      });
    }
  }
  
  // If no enhancement markers found, treat entire content as enhanced
  // This handles legacy enhanced content that doesn't have markers
  if (parts.length === 0) {
    parts.push({
      type: 'enhanced',
      content: content
    });
  }
  
  return parts;
};

export const EnhancedContentRenderer = ({
  content,
  fontSize,
  textAlign,
  className
}: EnhancedContentRendererProps) => {
  const parsedContent = parseEnhancedContent(content);
  const hasMarkers = content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
  
  console.log("🎨 EnhancedContentRenderer - Parsing content:", {
    originalLength: content.length,
    parsedParts: parsedContent.length,
    enhancedParts: parsedContent.filter(p => p.type === 'enhanced').length,
    originalParts: parsedContent.filter(p => p.type === 'original').length,
    hasMarkers,
    isLegacyContent: !hasMarkers
  });
  
  return (
    <div className={className}>
      {parsedContent.map((part, index) => (
        <div
          key={index}
          className={
            part.type === 'enhanced'
              ? 'relative bg-mint-50/30 border-l-4 border-mint-300 pl-4 py-2 my-2 rounded-r-md'
              : ''
          }
        >
          {part.type === 'enhanced' && (
            <div className="absolute -top-1 -left-1 bg-mint-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
              {hasMarkers ? 'AI Enhanced' : 'AI Improved'}
            </div>
          )}
          <RichTextDisplay
            content={part.content}
            fontSize={fontSize}
            textAlign={textAlign}
            className={part.type === 'enhanced' ? 'mt-4' : ''}
          />
        </div>
      ))}
    </div>
  );
};
