
import React from 'react';
import { TextAlignType } from '../hooks/useStudyViewState';

interface UnifiedContentRendererProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  className?: string;
}

export const UnifiedContentRenderer = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = ''
}: UnifiedContentRendererProps) => {
  console.log("🎨 UnifiedContentRenderer rendering:", {
    contentLength: content?.length || 0,
    contentPreview: content?.substring(0, 100),
    hasContent: !!content
  });

  if (!content || content.trim() === '') {
    return <div className="text-gray-500 italic">No content available</div>;
  }

  return (
    <div 
      className={`text-base whitespace-pre-wrap ${className}`}
      style={{ 
        fontSize: `${fontSize}px`,
        textAlign: textAlign === 'left' ? 'left' : textAlign === 'center' ? 'center' : 'justify'
      }}
    >
      {content}
    </div>
  );
};
