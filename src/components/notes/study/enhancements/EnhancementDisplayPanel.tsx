
import { EnhancedContentRenderer } from "./EnhancedContentRenderer";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { EnhancementTabHeader } from "./EnhancementTabHeader";
import { EnhancementContent } from "./EnhancementContent";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementContentType } from "./EnhancementSelector";
import { Note } from "@/types/note";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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

  // More robust enhanced content marker detection
  const hasEnhancementMarkers = content && typeof content === 'string' && 
    content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');

  // Enhanced debug logging
  console.log("🎯 EnhancementDisplayPanel - Enhanced content detection (FIXED):", {
    contentType,
    title,
    noteId: note.id,
    hasContent: !!content,
    contentLength: content?.length || 0,
    contentPreview: content?.substring(0, 100) || 'none',
    hasEnhancementMarkers,
    markerCheck: {
      hasOpenMarker: content?.includes('[AI_ENHANCED]') || false,
      hasCloseMarker: content?.includes('[/AI_ENHANCED]') || false,
      contentType: typeof content,
      isString: typeof content === 'string'
    },
    isGenerating,
    hasError,
    timestamp: new Date().toISOString()
  });

  // Handle regeneration for improved clarity
  const handleRegenerate = () => {
    console.log("🔄 Regenerating improved clarity content");
    if (onRetryEnhancement) {
      onRetryEnhancement('improve-clarity');
    }
  };

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
        <>
          <div className="mb-4 text-xs text-gray-500">
            Debug: Enhanced markers detected ✓
          </div>
          <EnhancedContentRenderer
            content={content}
            fontSize={fontSize}
            textAlign={textAlign}
          />
        </>
      ) : contentType === 'improved' && content && !hasEnhancementMarkers ? (
        // For legacy improved content without markers, show as regular content with regenerate option
        <div className="space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-300 p-4 rounded-r-md">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                Legacy AI Content
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRegenerate}
                className="text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Regenerate
              </Button>
            </div>
            <p className="text-sm text-amber-700">
              This content was generated with an older version. Regenerate for better highlighting of AI enhancements.
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
