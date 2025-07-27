
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementContentType } from "./EnhancementSelector";
import { EnhancementContent } from "./EnhancementContent";
import { LoadingAnimations } from "./LoadingAnimations";
import { ContentMetadata } from "./ContentMetadata";

interface EnhancementDisplayPanelProps {
  note: Note;
  contentType: EnhancementContentType;
  fontSize: number;
  textAlign: TextAlignType;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => Promise<void>;
  onCancelEnhancement?: () => void;
  enhancedContents?: Record<string, string>;
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
  enhancedContents = {},
  className = ""
}: EnhancementDisplayPanelProps) => {
  
  // Check generating status for enhancement types (only 'generating', not 'pending')
  const getGeneratingStatus = (type: EnhancementContentType): boolean => {
    switch (type) {
      case 'summary':
        return note.summary_status === 'generating';
      case 'keyPoints':
        return note.key_points_status === 'generating';
      case 'improved':
        return note.improved_content_status === 'generating';
      case 'markdown':
        return note.markdown_content_status === 'generating';
      case 'enriched':
        return note.enriched_status === 'generating';
      case 'original':
        return false; // Original content doesn't have generating status
      default:
        return false;
    }
  };

  const isContentGenerating = getGeneratingStatus(contentType);
  
  // SIMPLIFIED: Direct mapping for enhancement types
  const getEnhancementTypeForRetry = (contentType: EnhancementContentType): string => {
    const mappings = {
      'summary': 'summarize',
      'keyPoints': 'extract-key-points', 
      'improved': 'improve-clarity',
      'markdown': 'convert-to-markdown',
      'enriched': 'enrich-note',
      'original': 'original'
    };
    
    return mappings[contentType] || 'summarize';
  };

  const getContentForType = (type: EnhancementContentType): string => {
    let content = '';
    
    // Check in-memory enhanced contents first
    const enhancementType = getEnhancementTypeForRetry(type);
    if (enhancedContents[enhancementType]) {
      content = enhancedContents[enhancementType];
    } else {
      // Fallback to note database fields
      switch (type) {
        case 'summary': 
          content = note.summary || '';
          break;
        case 'keyPoints': 
          content = note.key_points || '';
          break;
        case 'improved': 
          content = note.improved_content || '';
          break;
        case 'markdown': 
          content = note.markdown_content || '';
          break;
        case 'enriched': 
          content = note.enriched_content || '';
          break;
        case 'original': 
          content = note.content || note.description || '';
          break;
        default: 
          content = '';
      }
    }
    
    console.log(`🎯 EnhancementDisplayPanel - Getting content for ${type}:`, {
      contentType: type,
      hasContent: !!content,
      contentLength: content.length,
      isGenerating: isContentGenerating,
      contentPreview: content.substring(0, 100)
    });
    
    return content;
  };

  const getTitleForType = (type: EnhancementContentType): string => {
    const titles = {
      'summary': 'Summary',
      'keyPoints': 'Key Points',
      'improved': 'Improved Clarity',
      'markdown': 'Markdown',
      'enriched': 'Enriched Note',
      'original': 'Original Content'
    };
    
    return titles[type] || 'Content';
  };

  // Handle explicit retry calls with proper error handling
  const handleExplicitRetry = async (enhancementType: string) => {
    console.log("🚀 Enhancement generation requested for:", enhancementType);
    if (onRetryEnhancement) {
      try {
        await onRetryEnhancement(enhancementType);
      } catch (error) {
        console.error("❌ Enhancement generation failed:", error);
      }
    }
  };

  const enhancementType = getEnhancementTypeForRetry(contentType);
  const content = getContentForType(contentType);
  const title = getTitleForType(contentType);

  console.log("🎯 EnhancementDisplayPanel - FINAL RENDER:", {
    contentType,
    enhancementType,
    hasContent: !!content,
    contentLength: content.length,
    isLoading,
    isContentGenerating,
    title,
    contentPreview: content.substring(0, 100)
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Show loading state when processing */}
      {(isLoading || isContentGenerating) && (
        <div className="flex-1 flex items-center justify-center p-8">
          <LoadingAnimations enhancementType={enhancementType} />
        </div>
      )}
      
      {/* Show content when not loading - with metadata header */}
      {!isLoading && !isContentGenerating && content && (
        <div className="flex-1 overflow-auto">
          {/* Content metadata header */}
          <ContentMetadata 
            content={content}
            enhancementType={enhancementType}
            sourceType={note.sourceType}
            videoUrl={note.video_url}
          />
          
          {/* Main content */}
          <EnhancementContent
            content={content}
            title={title}
            fontSize={fontSize}
            textAlign={textAlign}
            enhancementType={enhancementType}
            noteId={note.id}
            contentType={contentType}
            onRetry={handleExplicitRetry}
          />
        </div>
      )}

      {/* Show empty state when no content and not loading - NEVER AUTO-GENERATE */}
      {!isLoading && !isContentGenerating && !content && (
        <div className="flex-1 overflow-auto">
          <EnhancementContent
            content=""
            title={title}
            fontSize={fontSize}
            textAlign={textAlign}
            enhancementType={enhancementType}
            noteId={note.id}
            contentType={contentType}
            onRetry={handleExplicitRetry}
          />
        </div>
      )}
    </div>
  );
};
