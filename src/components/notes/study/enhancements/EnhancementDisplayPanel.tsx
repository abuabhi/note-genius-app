
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementContentType } from "./EnhancementSelector";
import { EnhancementContent } from "./EnhancementContent";
import { LoadingAnimations } from "./LoadingAnimations";
import { ContentMetadata } from "./ContentMetadata";
import { debugLogger } from '@/utils/debug/EnhancementDebugLogger';
import { DEBUG_CONFIG } from '@/config/debug';

interface EnhancementDisplayPanelProps {
  note: Note;
  contentType: EnhancementContentType;
  fontSize: number;
  textAlign: TextAlignType;
  isLoading?: boolean;
  onGenerateEnhancement?: (enhancementType: string) => Promise<void>;
  onCancelEnhancement?: () => void;
  enhancedContents?: Record<string, string>;
  className?: string;
  processingStage?: string;
}

export const EnhancementDisplayPanel = ({
  note,
  contentType,
  fontSize,
  textAlign,
  isLoading = false,
  onGenerateEnhancement,
  onCancelEnhancement,
  enhancedContents = {},
  className = "",
  processingStage
}: EnhancementDisplayPanelProps) => {
  
  // Check generating status for enhancement types (only 'generating', not 'pending')
  const getGeneratingStatus = (type: EnhancementContentType): boolean => {
    switch (type) {
      case 'summary':
        return note.summary_status === 'generating';
      case 'keyPoints':
        return note.key_points_status === 'generating';
      case 'questions':
        return note.questions_status === 'generating';
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
  const getEnhancementTypeForGenerate = (contentType: EnhancementContentType): string => {
    const mappings = {
      'summary': 'summarize',
      'keyPoints': 'extract-key-points', 
      'questions': 'generate-questions',
      'markdown': 'convert-to-markdown',
      'enriched': 'enrich-note',
      'original': 'original'
    };
    
    return mappings[contentType] || 'summarize';
  };

  const getContentForType = (type: EnhancementContentType): string => {
    let content = '';
    
    // Check in-memory enhanced contents first
    const enhancementType = getEnhancementTypeForGenerate(type);
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
        case 'questions': 
          content = note.questions_content || '';
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
    
    // Content fetch logging disabled for cleaner console
    
    return content;
  };

  const getTitleForType = (type: EnhancementContentType): string => {
    const titles = {
      'summary': 'Summary',
      'keyPoints': 'Key Points',
      'questions': 'Top 10 Questions',
      'markdown': 'Markdown',
      'enriched': 'Enriched Note',
      'original': 'Original Content'
    };
    
    return titles[type] || 'Content';
  };

  // Handle explicit generate calls with proper error handling
  const handleExplicitGenerate = async (enhancementType: string) => {
    // BASIC CLICK DETECTION - ALWAYS LOG
    console.log("🟡 BASIC CLICK DETECTED in EnhancementDisplayPanel");
    
    if (DEBUG_CONFIG.ENHANCEMENT_FLOW) {
      debugLogger.log('GENERATE_CALL', `Enhancement requested for ${enhancementType}`, {
        hasHandler: !!onGenerateEnhancement,
        noteId: note.id,
        contentType
      });
    }
    
    if (onGenerateEnhancement) {
      console.log("🟢 Calling onGenerateEnhancement with:", enhancementType);
      try {
        await onGenerateEnhancement(enhancementType);
        console.log("✅ onGenerateEnhancement completed successfully");
        if (DEBUG_CONFIG.ENHANCEMENT_FLOW) {
          debugLogger.log('ENHANCEMENT_SUCCESS', `Enhancement completed for ${enhancementType}`);
        }
      } catch (error) {
        console.error("❌ Enhancement generation failed:", error);
        debugLogger.logError('Enhancement generation failed', { enhancementType, error });
      }
    } else {
      console.error("❌ NO onGenerateEnhancement function provided");
      debugLogger.logError('No enhancement handler provided to DisplayPanel');
    }
  };

  const enhancementType = getEnhancementTypeForGenerate(contentType);
  const content = getContentForType(contentType);
  const title = getTitleForType(contentType);

  // Panel render logging disabled for cleaner console

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Show loading state when processing */}
      {(isLoading || isContentGenerating) && (
        <div className="flex-1 flex items-center justify-center p-8">
          <LoadingAnimations 
            enhancementType={enhancementType} 
            processingStage={processingStage}
          />
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
            onGenerate={handleExplicitGenerate}
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
            onGenerate={handleExplicitGenerate}
          />
        </div>
      )}
    </div>
  );
};
