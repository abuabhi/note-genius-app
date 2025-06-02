
import { EnhancedContentRenderer } from "./EnhancedContentRenderer";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { EnhancementTabHeader } from "./EnhancementTabHeader";
import { EnhancementContent } from "./EnhancementContent";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementContentType } from "./EnhancementSelector";
import { Note } from "@/types/note";

interface EnhancementDisplayPanelProps {
  note: Note;
  contentType: EnhancementContentType;
  fontSize: number;
  textAlign: TextAlignType;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => void;
  onCancelEnhancement?: () => void;
  className?: string;
}

export const EnhancementDisplayPanel = ({
  note,
  contentType,
  fontSize,
  textAlign,
  isLoading = false,
  onRetryEnhancement,
  onCancelEnhancement,
  className
}: EnhancementDisplayPanelProps) => {
  // Get the appropriate content based on the selected content type
  const getContent = () => {
    switch (contentType) {
      case 'original':
        return note.content || note.description || "";
      case 'summary':
        return note.summary || "";
      case 'keyPoints':
        return note.key_points || "";
      case 'markdown':
        return note.markdown_content || "";
      case 'improved':
        return note.improved_content || "";
      default:
        return note.content || note.description || "";
    }
  };

  // Get the appropriate title based on the selected content type
  const getTitle = () => {
    switch (contentType) {
      case 'original':
        return "Original Note";
      case 'summary':
        return "Summary";
      case 'keyPoints':
        return "Key Points";
      case 'markdown':
        return "Markdown Format";
      case 'improved':
        return "Improved Clarity";
      default:
        return "Note Content";
    }
  };

  // Determine if this content type has a status
  const isGenerating = contentType === 'summary' && 
    (note.summary_status === 'generating' || note.summary_status === 'pending');
  const hasError = contentType === 'summary' && note.summary_status === 'failed';

  const content = getContent();
  const title = getTitle();
  const isMarkdownFormat = contentType === 'markdown';

  // Check if content contains AI enhancement markers
  const hasEnhancementMarkers = content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');

  console.log("🎯 EnhancementDisplayPanel - Rendering content:", {
    contentType,
    title,
    hasContent: !!content,
    contentLength: content.length,
    hasEnhancementMarkers,
    isGenerating,
    hasError
  });

  return (
    <div className={className}>
      <EnhancementTabHeader 
        title={title} 
        showAiIndicator={contentType === 'improved' && !!content}
      />
      
      {/* Always show original content as-is */}
      {contentType === 'original' ? (
        <RichTextDisplay 
          content={content} 
          fontSize={fontSize} 
          textAlign={textAlign} 
        />
      ) : contentType === 'improved' && hasEnhancementMarkers ? (
        // For improved content with markers, use enhanced renderer
        <EnhancedContentRenderer
          content={content}
          fontSize={fontSize}
          textAlign={textAlign}
        />
      ) : contentType === 'improved' && content && !hasEnhancementMarkers ? (
        // For legacy improved content without markers, show as regular content
        <div className="space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-300 p-4 rounded-r-md">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                Legacy AI Content
              </div>
            </div>
            <p className="text-sm text-amber-700">
              This content was generated with an older version. Re-generate for better highlighting of AI enhancements.
            </p>
          </div>
          <RichTextDisplay 
            content={content} 
            fontSize={fontSize} 
            textAlign={textAlign} 
          />
        </div>
      ) : (
        // For all other content types, use the standard enhancement content component
        <EnhancementContent
          content={content}
          title={title}
          fontSize={fontSize}
          textAlign={textAlign}
          isLoading={isGenerating || isLoading}
          hasError={hasError}
          isMarkdown={isMarkdownFormat}
          enhancementType={contentType}
          onRetry={onRetryEnhancement}
          onCancel={onCancelEnhancement}
        />
      )}
    </div>
  );
};
