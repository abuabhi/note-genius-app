
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
  onRetry?: (enhancementType: string) => void;
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
  onRetry,
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
        onRetry={() => onRetry?.(enhancementType)}
        title={`${safeTitle} Generation Failed`}
        enhancementType={enhancementType}
      />
    );
  }
  
  if (!content || content.trim() === '') {
    return (
      <div className="p-8 bg-accent/50 rounded-lg border border-border text-center">
        <div className="flex flex-col items-center space-y-4">
          <Sparkles className="h-12 w-12 text-primary" />
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">No {safeTitle.toLowerCase()} available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click the button below to generate AI-enhanced {safeTitle.toLowerCase()}
            </p>
          </div>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🎯 USER EXPLICITLY CLICKED GENERATE BUTTON for:", enhancementType);
                onRetry(enhancementType);
              }}
              className="text-primary hover:text-primary/80 border-primary/20 hover:border-primary/30"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Generate {safeTitle}
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
