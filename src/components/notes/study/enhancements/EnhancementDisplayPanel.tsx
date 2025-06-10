
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
  className = ""
}: EnhancementDisplayPanelProps) => {
  // Check if summary is in generating/pending state
  const isSummaryGenerating = contentType === 'summary' && 
    (note.summary_status === 'generating' || note.summary_status === 'pending');

  // Check if enriched content is in generating/pending state
  const isEnrichedGenerating = contentType === 'enriched' && 
    (note.enriched_status === 'generating' || note.enriched_status === 'pending');
  
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
    
    console.log(`🎯 EnhancementDisplayPanel - Getting content for ${type}:`, {
      contentType: type,
      hasContent: !!content,
      contentLength: content.length,
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

  const enhancementType = getEnhancementTypeForRetry(contentType);
  const content = getContentForType(contentType);
  const title = getTitleForType(contentType);

  console.log("🎯 EnhancementDisplayPanel - FINAL RENDER:", {
    contentType,
    enhancementType,
    hasContent: !!content,
    contentLength: content.length,
    isLoading,
    isSummaryGenerating,
    isEnrichedGenerating,
    title,
    contentPreview: content.substring(0, 100)
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Show loading state when processing - SIMPLIFIED without cancel/retry buttons */}
      {(isLoading || isSummaryGenerating || isEnrichedGenerating) && (
        <div className="flex-1 flex items-center justify-center p-8">
          <LoadingAnimations enhancementType={enhancementType} />
        </div>
      )}
      
      {/* Show content when not loading - with metadata header */}
      {!isLoading && !isSummaryGenerating && !isEnrichedGenerating && content && (
        <div className="flex-1 overflow-auto">
          {/* Content metadata header */}
          <ContentMetadata 
            content={content}
            enhancementType={enhancementType}
          />
          
          {/* Main content */}
          <EnhancementContent
            content={content}
            title={title}
            fontSize={fontSize}
            textAlign={textAlign}
            enhancementType={enhancementType}
            onRetry={onRetryEnhancement}
          />
        </div>
      )}

      {/* Show empty state when no content and not loading */}
      {!isLoading && !isSummaryGenerating && !isEnrichedGenerating && !content && (
        <div className="flex-1 overflow-auto">
          <EnhancementContent
            content=""
            title={title}
            fontSize={fontSize}
            textAlign={textAlign}
            enhancementType={enhancementType}
            onRetry={onRetryEnhancement}
          />
        </div>
      )}
    </div>
  );
};
