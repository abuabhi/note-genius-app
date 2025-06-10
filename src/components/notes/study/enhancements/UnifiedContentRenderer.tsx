
import React from 'react';
import { TextAlignType } from '../hooks/useStudyViewState';
import { NuclearContentRenderer } from './NuclearContentRenderer';

interface UnifiedContentRendererProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  className?: string;
  isMarkdown?: boolean;
}

/**
 * NUCLEAR REWRITE: Unified Content Renderer now uses Nuclear Renderer
 * All content is processed through the bulletproof nuclear rendering pipeline
 */
export const UnifiedContentRenderer = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = '',
  isMarkdown = true // This prop is now ignored - everything is markdown
}: UnifiedContentRendererProps) => {
  console.log("🚀 NUCLEAR UNIFIED: Delegating to Nuclear Renderer:", {
    contentLength: content?.length || 0,
    fontSize,
    textAlign,
    forcedMarkdown: true
  });

  // NUCLEAR: Everything goes through the nuclear renderer
  return (
    <NuclearContentRenderer
      content={content}
      fontSize={fontSize}
      textAlign={textAlign}
      className={className}
    />
  );
};
