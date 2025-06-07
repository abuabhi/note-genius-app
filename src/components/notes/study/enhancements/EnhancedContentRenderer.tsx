
import React from 'react';
import { RichTextDisplay } from '@/components/ui/rich-text/RichTextDisplay';
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

  // Content with enhancement markers - use unified renderer
  return (
    <UnifiedContentRenderer
      content={content}
      fontSize={fontSize}
      textAlign={textAlign}
      className={className}
    />
  );
};
