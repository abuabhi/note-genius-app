
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
  if (!content || typeof content !== 'string') {
    console.log("⚠️ parseEnhancedContent: Invalid content provided");
    return [];
  }

  const parts: ParsedContent[] = [];
  const enhancementRegex = /\[AI_ENHANCED\]([\s\S]*?)\[\/AI_ENHANCED\]/g;
  
  let lastIndex = 0;
  let match;
  let hasMarkers = false;
  
  console.log("🔍 parseEnhancedContent: Starting to parse content:", {
    contentLength: content.length,
    contentPreview: content.substring(0, 100),
    hasOpenMarker: content.includes('[AI_ENHANCED]'),
    hasCloseMarker: content.includes('[/AI_ENHANCED]')
  });
  
  while ((match = enhancementRegex.exec(content)) !== null) {
    hasMarkers = true;
    
    console.log("🎯 Found enhancement marker:", {
      matchIndex: match.index,
      matchLength: match[0].length,
      enhancedContent: match[1].substring(0, 50)
    });
    
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
  
  console.log("📋 parseEnhancedContent: Parsing results:", {
    hasMarkers,
    totalParts: parts.length,
    enhancedParts: parts.filter(p => p.type === 'enhanced').length,
    originalParts: parts.filter(p => p.type === 'original').length
  });
  
  // If no enhancement markers found, return the entire content as original
  if (!hasMarkers) {
    console.log("❌ No enhancement markers found in content, returning as original");
    return [{
      type: 'original',
      content: content
    }];
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
  const hasMarkers = content && content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
  
  console.log("🎨 EnhancedContentRenderer - Rendering analysis:", {
    originalLength: content?.length || 0,
    parsedParts: parsedContent.length,
    enhancedParts: parsedContent.filter(p => p.type === 'enhanced').length,
    originalParts: parsedContent.filter(p => p.type === 'original').length,
    hasMarkers,
    shouldRender: parsedContent.length > 0,
    timestamp: new Date().toISOString()
  });
  
  // Always render content, even if no markers
  return (
    <div className={className}>
      {parsedContent.map((part, index) => (
        <div
          key={index}
          className={
            part.type === 'enhanced'
              ? 'relative bg-mint-50/50 border-l-4 border-mint-400 pl-4 py-3 my-3 rounded-r-lg shadow-sm'
              : ''
          }
        >
          {part.type === 'enhanced' && (
            <div className="absolute -top-2 -left-2 bg-mint-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md z-10">
              ✨ AI Enhanced
            </div>
          )}
          <div className={part.type === 'enhanced' ? 'pt-2' : ''}>
            <RichTextDisplay
              content={part.content}
              fontSize={fontSize}
              textAlign={textAlign}
              className={part.type === 'enhanced' ? 'prose-p:text-mint-900 prose-headings:text-mint-800 prose-li:text-mint-900 prose-strong:text-mint-900' : ''}
            />
          </div>
          {part.type === 'enhanced' && (
            <div className="mt-2 pt-2 border-t border-mint-200">
              <span className="text-xs text-mint-600 font-medium">Enhanced by AI for better clarity and understanding</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
