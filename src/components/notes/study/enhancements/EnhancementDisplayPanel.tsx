
import { useState } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
import { LoadingAnimations } from "./LoadingAnimations";
import { EnhancementContentType } from "./EnhancementSelector";
import { cn } from "@/lib/utils";

interface EnhancementDisplayPanelProps {
  note: Note;
  contentType: EnhancementContentType;
  fontSize: number;
  textAlign: TextAlignType;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => void;
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
  className
}: EnhancementDisplayPanelProps) => {
  const [retryLoading, setRetryLoading] = useState(false);

  const getContent = () => {
    switch (contentType) {
      case 'original':
        return note.content || note.description || "";
      case 'summary':
        return note.summary || "";
      case 'keyPoints':
        return note.key_points || "";
      case 'improved':
        return note.improved_content || "";
      case 'markdown':
        return note.markdown_content || "";
      default:
        return "";
    }
  };

  const getContentTitle = () => {
    switch (contentType) {
      case 'original':
        return "Original Content";
      case 'summary':
        return "Summary";
      case 'keyPoints':
        return "Key Points";
      case 'improved':
        return "Improved Clarity";
      case 'markdown':
        return "Markdown Format";
      default:
        return "";
    }
  };

  const content = getContent();
  const title = getContentTitle();

  const handleRetry = async (enhancementType: string) => {
    if (!onRetryEnhancement) return;
    
    setRetryLoading(true);
    try {
      await onRetryEnhancement(enhancementType);
    } finally {
      setRetryLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="border-b border-border p-4 h-[73px] flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <LoadingAnimations />
        </div>
      </div>
    );
  }

  // Show empty state with retry option for non-original content
  if (!content && contentType !== 'original') {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="border-b border-border p-4 h-[73px] flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No {title.toLowerCase()} available</p>
            {onRetryEnhancement && (
              <Button
                onClick={() => handleRetry(getEnhancementTypeFromContent(contentType))}
                disabled={retryLoading}
                variant="outline"
                size="sm"
              >
                {retryLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Generate {title}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header with consistent height */}
      <div className="border-b border-border p-4 h-[73px] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {contentType !== 'original' && onRetryEnhancement && (
          <Button
            onClick={() => handleRetry(getEnhancementTypeFromContent(contentType))}
            disabled={retryLoading}
            variant="ghost"
            size="sm"
          >
            {retryLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <RichTextDisplay 
          content={content} 
          fontSize={fontSize} 
          textAlign={textAlign}
          removeTitle={contentType !== 'original'} // Remove auto-generated titles for enhanced content
        />
      </div>
    </div>
  );
};

// Helper function to map content type to enhancement type
const getEnhancementTypeFromContent = (contentType: EnhancementContentType): string => {
  switch (contentType) {
    case 'summary':
      return 'summarize';
    case 'keyPoints':
      return 'extract-key-points';
    case 'improved':
      return 'improve-clarity';
    case 'markdown':
      return 'convert-to-markdown';
    default:
      return 'summarize';
  }
};
