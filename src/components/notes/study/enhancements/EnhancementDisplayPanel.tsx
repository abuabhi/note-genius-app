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
  // Helper function to aggressively clean content from AI enhancement markers
  const cleanOriginalContent = (content: string): string => {
    if (!content || typeof content !== 'string') return content || '';
    
    // Remove AI enhancement markers and their content, keeping only original text
    let cleaned = content;
    
    // Remove everything between [AI_ENHANCED] and [/AI_ENHANCED] tags
    cleaned = cleaned.replace(/\[AI_ENHANCED\][\s\S]*?\[\/AI_ENHANCED\]/g, '');
    
    // Remove any remaining standalone markers
    cleaned = cleaned.replace(/\[AI_ENHANCED\]/g, '');
    cleaned = cleaned.replace(/\[\/AI_ENHANCED\]/g, '');
    
    // Clean up any "Original:" prefixes that might have been added
    cleaned = cleaned.replace(/^Original:\s*["""]?([^"""\n]*)["""]?\s*$/m, '$1');
    cleaned = cleaned.replace(/^Original:\s*/gm, '');
    
    return cleaned.trim();
  };

  // Get the appropriate content based on the selected content type
  const getContent = () => {
    switch (contentType) {
      case 'original':
        // For original content, aggressively clean any AI enhancement markers
        const rawContent = note.content || note.description || "";
        return cleanOriginalContent(rawContent);
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

  // Enhanced content marker detection - only for improved content
  const hasEnhancementMarkers = contentType === 'improved' && content && 
    typeof content === 'string' && 
    content.includes('[AI_ENHANCED]') && 
    content.includes('[/AI_ENHANCED]');

  // Check if improved content exists and has proper generation timestamp
  const hasValidImprovedContent = contentType === 'improved' && 
    Boolean(note.improved_content && note.improved_content_generated_at);

  console.log("🎯 EnhancementDisplayPanel - Fixed content analysis:", {
    contentType,
    title,
    noteId: note.id,
    hasContent: !!content,
    contentLength: content?.length || 0,
    contentPreview: content?.substring(0, 100) || 'none',
    hasEnhancementMarkers,
    hasValidImprovedContent,
    isOriginalContent: contentType === 'original',
    cleanedOriginal: contentType === 'original' ? content : 'N/A',
    isGenerating,
    hasError,
    timestamp: new Date().toISOString()
  });

  // Handle regeneration for improved clarity
  const handleRegenerate = () => {
    console.log("🔄 Regenerating improved clarity content");
    if (onRetryEnhancement) {
      onRetryEnhancement('improve-clarity');
    } else {
      console.warn("⚠️ onRetryEnhancement not available");
    }
  };

  return (
    <div className={className}>
      <EnhancementTabHeader 
        title={title} 
        showAiIndicator={contentType === 'improved' && hasValidImprovedContent}
      />
      
      {/* Always show original content as cleaned text */}
      {contentType === 'original' ? (
        <RichTextDisplay 
          content={content} 
          fontSize={fontSize} 
          textAlign={textAlign} 
        />
      ) : contentType === 'improved' && hasEnhancementMarkers ? (
        // For improved content with proper markers, use enhanced renderer
        <EnhancedContentRenderer
          content={content}
          fontSize={fontSize}
          textAlign={textAlign}
        />
      ) : contentType === 'improved' && hasValidImprovedContent && !hasEnhancementMarkers ? (
        // For improved content without markers, show with regenerate option
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
                disabled={isLoading || !onRetryEnhancement}
                className="text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300"
              >
                <RefreshCw className={`mr-2 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Regenerating...' : 'Regenerate'}
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
