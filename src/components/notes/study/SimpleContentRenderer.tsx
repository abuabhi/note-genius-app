import React from 'react';
import { TextAlignType } from './hooks/useStudyViewState';
import { processContentForDisplay } from '@/utils/markdownConverter';
import './SimpleContentRenderer.css';
import { sanitizeHTML } from '@/utils/sanitize';

interface SimpleContentRendererProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  className?: string;
}

export const SimpleContentRenderer: React.FC<SimpleContentRendererProps> = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = ''
}) => {
  if (!content || content.trim().length === 0) {
    return <div className="text-muted-foreground">No content available</div>;
  }

  const containerStyle = {
    fontSize: `${fontSize}px`,
    textAlign: textAlign,
    lineHeight: 1.6
  };

  const containerClass = `simple-content ${className}`;

  // Process all content through our unified markdown converter
  const processedContent = processContentForDisplay(content);

  return (
    <div 
      className={containerClass}
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(processedContent) }}
    />
  );
};
