
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

  // FIXED: Updated markdown detection to include all enhanced content types
  const getIsMarkdown = (type: string): boolean => {
    const markdownEnhancements = [
      // OpenAI enhancement types that generate markdown
      'summarize',
      'extract-key-points', 
      'improve-clarity',
      'convert-to-markdown',
      // Content type mappings
      'summary',
      'keyPoints', 
      'improved',
      'markdown',
      // Legacy and alternative names
      'key-points',
      'markdown-format',
      'clarity',
      'original++',
      // All enhanced content should be markdown except original
      'enhanced'
    ];
    
    const lowerType = type.toLowerCase();
    return markdownEnhancements.includes(lowerType) || lowerType !== 'original';
  };

  const isMarkdown = getIsMarkdown(enhancementType);

  console.log("🔍 Content rendering decision:", {
    enhancementType,
    isMarkdown,
    willUseMarkdownRenderer: isMarkdown,
    typeCheck: enhancementType.toLowerCase()
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
      <div className="p-8 bg-gray-50 rounded-lg border border-gray-100 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Sparkles className="h-12 w-12 text-mint-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {safeTitle.toLowerCase()} available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate AI-enhanced content to see {safeTitle.toLowerCase()} here
            </p>
          </div>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRetry(enhancementType)}
              className="text-mint-600 hover:text-mint-700 border-mint-200 hover:border-mint-300"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Generate {safeTitle}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render content with appropriate renderer
  return (
    <div className="animate-fade-in px-4 py-2">
      <UnifiedContentRenderer 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign}
        isMarkdown={isMarkdown}
        className="text-gray-700"
      />
    </div>
  );
};
