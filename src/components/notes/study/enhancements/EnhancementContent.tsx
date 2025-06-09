
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { EnhancedContentRenderer } from "./EnhancedContentRenderer";
import { TextAlignType } from "../hooks/useStudyViewState";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { EnhancementError } from "../../enrichment/EnhancementError";
import { LoadingAnimations } from "./LoadingAnimations";

interface EnhancementContentProps {
  content: string;
  title: string;
  fontSize: number;
  textAlign: TextAlignType;
  isMarkdown?: boolean;
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
  isMarkdown = false,
  isLoading = false,
  hasError = false,
  enhancementType = "",
  onRetry,
  onCancel
}: EnhancementContentProps) => {
  // FIXED: Ensure title is always a string and safe to use
  const safeTitle = title || "Content";
  
  console.log("🎨 EnhancementContent rendering:", {
    title: safeTitle,
    hasContent: !!content,
    contentLength: content?.length || 0,
    isLoading,
    hasError,
    enhancementType
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

  // Check if content contains AI enhancement markers
  const hasEnhancementMarkers = content.includes('[AI_ENHANCED]') && content.includes('[/AI_ENHANCED]');
  
  return (
    <div className="animate-fade-in">
      {hasEnhancementMarkers ? (
        <EnhancedContentRenderer
          content={content}
          fontSize={fontSize}
          textAlign={textAlign}
          className={`prose-sm prose-headings:font-medium prose-headings:text-mint-800 prose-ul:pl-6 prose-ol:pl-6 ${
            isMarkdown ? "font-mono" : ""
          }`}
        />
      ) : (
        <RichTextDisplay 
          content={content} 
          fontSize={fontSize} 
          textAlign={textAlign}
          className={`prose-sm prose-headings:font-medium prose-headings:text-mint-800 prose-ul:pl-6 prose-ol:pl-6 ${
            isMarkdown ? "font-mono" : ""
          }`}
        />
      )}
    </div>
  );
};
