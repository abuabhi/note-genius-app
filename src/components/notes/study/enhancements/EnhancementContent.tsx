
import { TextAlignType } from "../hooks/useStudyViewState";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { EnhancementError } from "../../enrichment/EnhancementError";
import { LoadingAnimations } from "./LoadingAnimations";
import { ExpandableContentRenderer } from "../expansion/ExpandableContentRenderer";
import { debugLogger } from '@/utils/debug/EnhancementDebugLogger';
import { DEBUG_CONFIG } from '@/config/debug';

interface EnhancementContentProps {
  content: string;
  title: string;
  fontSize: number;
  textAlign: TextAlignType;
  isLoading?: boolean;
  hasError?: boolean;
  enhancementType?: string;
  noteId: string;
  contentType: string;
  onGenerate?: (enhancementType: string) => Promise<void>;
  onCancel?: () => void;
}

export const EnhancementContent = ({
  content,
  title,
  fontSize,
  textAlign,
  isLoading = false,
  hasError = false,
  enhancementType = "",
  noteId,
  contentType,
  onGenerate,
  onCancel
}: EnhancementContentProps) => {
  const safeTitle = title || "Content";
  
  // Remove extensive logging - keeping only essential debugging for enhancement flow
  if (DEBUG_CONFIG.ENHANCEMENT_FLOW) {
    debugLogger.log('ENHANCEMENT_CONTENT', `Rendering ${safeTitle}`, {
      hasContent: !!content,
      contentLength: content?.length || 0,
      isLoading,
      hasError,
      enhancementType
    });
  }

  if (isLoading) {
    return (
      <LoadingAnimations 
        enhancementType={enhancementType}
        message={`Generating ${safeTitle.toLowerCase()}...`} 
      />
    );
  }
  
  if (hasError) {
    return (
      <EnhancementError 
        error={`Failed to generate ${safeTitle.toLowerCase()}`}
        onRetry={() => onGenerate?.(enhancementType)}
        title={`${safeTitle} Generation Failed`}
        enhancementType={enhancementType}
      />
    );
  }
  
  if (!content || content.trim() === '') {
    return (
      <div className="p-8 bg-gradient-to-br from-mint-50/50 to-mint-100/30 rounded-xl border-2 border-mint-200/50 text-center shadow-sm">
        <div className="flex flex-col items-center space-y-6">
          <div className="p-4 bg-mint-100/60 rounded-full shadow-sm">
            <Sparkles className="h-8 w-8 text-mint-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-mint-900 mb-3">Generate {safeTitle}</h3>
            <p className="text-sm text-mint-700/80 mb-2 max-w-md mx-auto leading-relaxed">
              AI will analyze your note and create {safeTitle.toLowerCase()} tailored to your content.
            </p>
            <p className="text-xs text-mint-600/70 mb-6">
              Processing typically takes 10-30 seconds
            </p>
          </div>
          {onGenerate && (
            <Button 
              size="lg" 
              onClick={async (e) => {
                // BASIC CLICK DETECTION - ALWAYS LOG
                console.log("🟡 BASIC CLICK DETECTED in EnhancementContent");
                
                if (DEBUG_CONFIG.ENHANCEMENT_FLOW) {
                  debugLogger.log('BUTTON_CLICK', `Generate button clicked for ${enhancementType}`);
                }
                
                e.preventDefault();
                e.stopPropagation();
                
                if (!onGenerate) {
                  console.error("❌ NO onGenerate function provided");
                  debugLogger.logError('No onGenerate function provided to button');
                  return;
                }
                
                console.log("🟢 Calling onGenerate with:", enhancementType);
                
                try {
                  await onGenerate(enhancementType);
                  console.log("✅ onGenerate completed successfully");
                  if (DEBUG_CONFIG.ENHANCEMENT_FLOW) {
                    debugLogger.log('ENHANCEMENT_SUCCESS', `Enhancement completed for ${enhancementType}`);
                  }
                } catch (error) {
                  console.error("❌ Enhancement generation failed:", error);
                  debugLogger.logError('Enhancement generation failed', { enhancementType, error });
                }
              }}
              className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              data-testid={`generate-${enhancementType}-button`}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            >
              <Sparkles className="mr-3 h-5 w-5" /> 
              Generate {safeTitle}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Use ExpandableContentRenderer for interactive content expansion
  return (
    <div className="animate-fade-in px-6 py-4">
      <ExpandableContentRenderer 
        content={content}
        fontSize={fontSize}
        textAlign={textAlign}
        contentType={contentType}
        noteTitle={title}
        noteId={noteId}
        className="text-foreground"
      />
    </div>
  );
};
