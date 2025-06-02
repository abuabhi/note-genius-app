
import { ReactNode } from 'react';
import { RichTextDisplay } from '@/components/ui/rich-text/RichTextDisplay';
import { TextAlignType } from '../hooks/useStudyViewState';
import { Sparkles } from 'lucide-react';

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
        <div key={index}>
          {part.type === 'enhanced' ? (
            // Enhanced content styled as mint green tip/quote
            <div className="relative bg-gradient-to-r from-mint-50 to-mint-100/50 border border-mint-200 rounded-lg p-4 my-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 bg-mint-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                  <Sparkles className="h-3 w-3 text-white" />
                  AI Enhanced
                </div>
              </div>
              <div className="relative">
                <RichTextDisplay
                  content={part.content}
                  fontSize={fontSize}
                  textAlign={textAlign}
                  className="prose-p:text-mint-900 prose-headings:text-mint-800 prose-li:text-mint-900 prose-strong:text-mint-900 prose-em:text-mint-800"
                />
              </div>
              <div className="mt-3 pt-3 border-t border-mint-200/50">
                <div className="flex items-center gap-2 text-xs text-mint-600">
                  <Sparkles className="h-3 w-3 text-mint-500" />
                  <span className="font-medium">Enhanced by AI for better clarity and understanding</span>
                </div>
              </div>
            </div>
          ) : (
            // Original content - render normally
            <RichTextDisplay
              content={part.content}
              fontSize={fontSize}
              textAlign={textAlign}
            />
          )}
        </div>
      ))}
    </div>
  );
};
