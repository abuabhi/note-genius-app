
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
  // AI-generated enhancement types that should always be treated as markdown
  const aiEnhancementTypes: EnhancementContentType[] = ['summary', 'keyPoints', 'improved', 'markdown'];
  const isAIGenerated = aiEnhancementTypes.includes(contentType);
  
  console.log("🎨 EnhancementContentRenderer:", {
    contentType,
    isAIGenerated,
    isMarkdown,
    hasEnhancementMarkers: hasEnhancementMarkers(content),
    contentLength: content.length
  });

  // SIMPLIFIED LOGIC: Route AI-generated content or markdown content to UnifiedContentRenderer
  if (isAIGenerated || hasEnhancementMarkers(content) || isMarkdown) {
    let processedContent = content;
    
    // Apply specific processing for different content types
    if (contentType === 'keyPoints' && !hasEnhancementMarkers(content)) {
      processedContent = processKeyPoints(content);
    } else if (isAIGenerated && !hasEnhancementMarkers(content)) {
      // Clean and format AI-generated markdown content
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
  }
  
  // Only use RichTextDisplay for original content
  return (
    <RichTextDisplay 
      content={content} 
      fontSize={fontSize} 
      textAlign={textAlign}
      removeTitle={true}
      className="prose-mint prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
    />
  );
};
