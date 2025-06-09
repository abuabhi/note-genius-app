
import { TextAlignType } from "../hooks/useStudyViewState";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { EnhancementError } from "../../enrichment/EnhancementError";
import { LoadingAnimations } from "./LoadingAnimations";
import { UnifiedContentRenderer } from "./UnifiedContentRenderer";

interface EnhancementContentProps {
  content: string;
  title: string;
  fontSize: number;
  textAlign: TextAlignType;
  isLoading?: boolean;
  hasError?: boolean;
  enhancementType?: string;
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
    contentPreview: content?.substring(0, 100)
  });

  // SIMPLIFIED: Original content = plain text, everything else = markdown
  const isMarkdown = enhancementType !== 'original';
  
  console.log("🎯 Simplified rendering decision:", {
    enhancementType,
    isMarkdown,
    reasoning: enhancementType === 'original' ? 'Original content uses plain text' : 'AI-enhanced content uses markdown'
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
              Generate AI-enhanced content to see {safeTitle.toLowerCase()} here
            </p>
          </div>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRetry(enhancementType)}
              className="text-primary hover:text-primary/80 border-primary/20 hover:border-primary/30"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Generate {safeTitle}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // SIMPLIFIED: Always use UnifiedContentRenderer with proper container padding
  return (
    <div className="animate-fade-in px-6 py-4">
      <UnifiedContentRenderer 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign}
        isMarkdown={isMarkdown}
        className="text-foreground"
      />
    </div>
  );
};
