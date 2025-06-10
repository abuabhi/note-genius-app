
import React from 'react';
import { TextAlignType } from '../hooks/useStudyViewState';
import { UnifiedContentRenderer } from './UnifiedContentRenderer';

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
  // DRASTIC REWRITE: Everything is now markdown - no conditional logic
  return (
    <UnifiedContentRenderer
      content={content}
      fontSize={fontSize}
      textAlign={textAlign}
      className={className}
      isMarkdown={true}
    />
  );
};
