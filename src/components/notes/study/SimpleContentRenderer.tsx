import React from 'react';
import { TextAlignType } from './hooks/useStudyViewState';
import { processContentForDisplay } from '@/utils/markdownConverter';
import { RichTextDisplay } from '@/components/ui/rich-text/RichTextDisplay';
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

  // Process all content through our unified markdown converter
  const processedContent = processContentForDisplay(content);

  // Check if content is rich HTML that should use the enhanced display
  const isRichHTML = processedContent.includes('<p>') || 
                     processedContent.includes('<strong>') || 
                     processedContent.includes('<table>') ||
                     processedContent.includes('<img>') ||
                     processedContent.includes('<a ') ||
                     processedContent.includes('font-size:') ||
                     processedContent.includes('color:');

  if (isRichHTML) {
    // Use enhanced rich text display for rich HTML content
    return (
      <RichTextDisplay
        content={processedContent}
        fontSize={fontSize}
        textAlign={textAlign}
        className={className}
      />
    );
  }

  // Fallback to original simple content renderer for basic content
  const containerClass = `simple-content ${className}`;

  return (
    <div 
      className={containerClass}
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(processedContent) }}
    />
  );
};
