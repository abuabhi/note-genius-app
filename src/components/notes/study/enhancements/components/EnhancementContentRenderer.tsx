
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { TextAlignType } from "../../hooks/useStudyViewState";
import { EnhancementContentType } from "../EnhancementSelector";
import { UnifiedContentRenderer } from "../UnifiedContentRenderer";
import { hasEnhancementMarkers } from "../utils/contentProcessing";

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
  // SIMPLIFIED: Original content = plain text, everything else = markdown
  const isOriginalContent = contentType === 'original';
  
  console.log("🎨 EnhancementContentRenderer:", {
    contentType,
    isOriginalContent,
    hasEnhancementMarkers: hasEnhancementMarkers(content),
    contentLength: content.length
  });

  // Use RichTextDisplay only for original content (plain text)
  if (isOriginalContent) {
    return (
      <RichTextDisplay 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign}
        removeTitle={true}
        className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
      />
    );
  }
  
  // Use UnifiedContentRenderer for all AI-generated content (markdown)
  return (
    <UnifiedContentRenderer 
      content={content} 
      fontSize={fontSize} 
      textAlign={textAlign}
      isMarkdown={true}
      className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
    />
  );
};
