
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { TextAlignType } from "../hooks/useStudyViewState";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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
  console.log("🎨 EnhancementContent rendering:", {
    title,
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
        message={`Generating ${title.toLowerCase()}...`} 
      />
    );
  }
  
  if (hasError) {
    return (
      <EnhancementError 
        error={`Failed to generate ${title.toLowerCase()}`}
        onRetry={() => onRetry?.(enhancementType)}
        title={`${title} Generation Failed`}
        enhancementType={enhancementType}
      />
    );
  }
  
  if (!content || content.trim() === '') {
    return (
      <div className="p-8 bg-gray-50 rounded-lg border border-gray-100 text-center">
        <p className="text-muted-foreground mb-4">No {title.toLowerCase()} available</p>
        {onRetry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRetry(enhancementType)}
            className="text-mint-600 hover:text-mint-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Generate {title}
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <RichTextDisplay 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign}
        className={`prose-sm prose-headings:font-medium prose-headings:text-mint-800 prose-ul:pl-6 prose-ol:pl-6 ${
          isMarkdown ? "font-mono" : ""
        }`}
      />
    </div>
  );
};
