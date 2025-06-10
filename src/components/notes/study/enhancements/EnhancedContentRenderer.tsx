
import React from 'react';
import { TextAlignType } from '../hooks/useStudyViewState';
import { NuclearContentRenderer } from './NuclearContentRenderer';

interface EnhancedContentRendererProps {
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  className?: string;
}

/**
 * NUCLEAR REWRITE: Enhanced Content Renderer now uses Nuclear Renderer
 */
export const EnhancedContentRenderer = ({
  content,
  fontSize,
  textAlign,
  className
}: EnhancedContentRendererProps) => {
  console.log("🚀 NUCLEAR ENHANCED: Everything is nuclear-rendered markdown:", {
    contentLength: content?.length || 0,
    fontSize,
    textAlign
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
