
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { TextAlignType } from "../hooks/useStudyViewState";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { EnhancementProcessing } from "../../enrichment/EnhancementProcessing";
import { EnhancementError } from "../../enrichment/EnhancementError";

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
  onRetry
}: EnhancementContentProps) => {
  if (isLoading) {
    return <EnhancementProcessing message={`Generating ${title.toLowerCase()}...`} enhancementType={enhancementType} />;
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
  
  if (!content) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
        <p className="text-muted-foreground">No {title.toLowerCase()} available</p>
        {onRetry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRetry(enhancementType)}
            className="mt-2"
          >
            <RefreshCw className="mr-1 h-3 w-3" /> Generate
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <RichTextDisplay 
      content={content} 
      fontSize={fontSize} 
      textAlign={textAlign}
      className={`prose-sm prose-headings:font-medium prose-headings:text-mint-800 prose-ul:pl-6 prose-ol:pl-6 ${
        isMarkdown ? "font-mono" : ""
      }`}
    />
  );
};
