
import { TextAlignType } from "../hooks/useStudyViewState";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { EnhancementError } from "../../enrichment/EnhancementError";
import { LoadingAnimations } from "./LoadingAnimations";
import { ExpandableContentRenderer } from "../expansion/ExpandableContentRenderer";

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
  
  console.log("🎨 EnhancementContent rendering:", {
    title: safeTitle,
    hasContent: !!content,
    contentLength: content?.length || 0,
    isLoading,
    hasError,
    enhancementType,
    contentType,
    noteId: noteId?.substring(0, 8) + '...',
    contentPreview: content?.substring(0, 100)
  });

  // CRITICAL: Verify noteId and contentType are correct
  console.log("🔧 FIXED PROPAGATION CHECK:", {
    noteId: noteId ? 'VALID' : 'MISSING',
    contentType: contentType || 'MISSING',
    enhancementType: enhancementType || 'MISSING',
    tabIsolationKey: `${noteId}-${contentType}`
  });

  // SIMPLIFIED: ALL CONTENT IS MARKDOWN - NO EXCEPTIONS
  console.log("🎯 EVERYTHING IS MARKDOWN:", {
    enhancementType,
    reasoning: 'All content types now use markdown rendering'
  });

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
                console.log("🔥🔥🔥 GENERATE BUTTON CLICKED IN ENHANCEMENT CONTENT 🔥🔥🔥");
                e.preventDefault();
                e.stopPropagation();
                console.log("🚀 ENHANCEMENT CONTENT BUTTON - Generation started:", {
                  enhancementType,
                  hasOnGenerate: !!onGenerate,
                  noteId,
                  contentType,
                  timestamp: new Date().toISOString(),
                  buttonLocation: 'EnhancementContent'
                });
                
                if (!onGenerate) {
                  console.error("❌ NO onGenerate function provided to EnhancementContent button!");
                  return;
                }
                
                try {
                  console.log("🚀 CALLING onGenerate from EnhancementContent button...");
                  await onGenerate(enhancementType);
                  console.log("✅ onGenerate completed from EnhancementContent button");
                } catch (error) {
                  console.error("❌ Error during enhancement generation from EnhancementContent button:", error);
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
          
          {/* DEBUG: Show comprehensive debug info */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600 border">
            <div className="font-semibold mb-2">🔧 Enhanced Debug Info:</div>
            <div>• onGenerate: {onGenerate ? '✅ PROVIDED' : '❌ MISSING'}</div>
            <div>• enhancementType: {enhancementType || '❌ MISSING'}</div>
            <div>• noteId: {noteId ? '✅ ' + noteId.substring(0, 8) + '...' : '❌ MISSING'}</div>
            <div>• contentType: {contentType || '❌ MISSING'}</div>
            <div>• title: {safeTitle}</div>
            <div>• buttonTestId: generate-{enhancementType}-button</div>
          </div>
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
