
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { TextAlignType } from "../../hooks/useStudyViewState";
import { EnhancementContentType } from "../EnhancementSelector";
import { UnifiedContentRenderer } from "../UnifiedContentRenderer";
import { hasEnhancementMarkers, cleanMarkdownContent, processKeyPoints, formatMarkdownStructure } from "../utils/contentProcessing";

interface EnhancementContentRendererProps {
  content: string;
  contentType: EnhancementContentType;
  fontSize: number;
  textAlign: TextAlignType;
  isMarkdown: boolean;
}

export const EnhancementContentRenderer = ({
  content,
  contentType,
  fontSize,
  textAlign,
  isMarkdown
}: EnhancementContentRendererProps) => {
  // Route content based on type and AI enhancement markers
  if (hasEnhancementMarkers(content)) {
    // Content with AI enhancement markers - use UnifiedContentRenderer for green highlighting
    return (
      <UnifiedContentRenderer 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign}
        className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
      />
    );
  } else if (isMarkdown) {
    // Pure markdown content without AI markers
    let processedContent = content;
    
    if (contentType === 'keyPoints') {
      processedContent = processKeyPoints(content);
    } else {
      processedContent = formatMarkdownStructure(cleanMarkdownContent(content));
    }
    
    return (
      <UnifiedContentRenderer 
        content={processedContent} 
        fontSize={fontSize} 
        textAlign={textAlign}
        className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
      />
    );
  } else {
    // Original content - use RichTextDisplay
    return (
      <RichTextDisplay 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign}
        removeTitle={contentType !== 'original'}
        className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
      />
    );
  }
};
