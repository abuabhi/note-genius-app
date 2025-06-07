
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancementHeaderProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  content: string;
  contentType: string;
  onRetryEnhancement?: (enhancementType: string) => void;
  retryLoading: boolean;
  getEnhancementTypeFromContent: (contentType: string) => string;
}

export const EnhancementHeader = ({
  title,
  description,
  icon: Icon,
  color,
  content,
  contentType,
  onRetryEnhancement,
  retryLoading,
  getEnhancementTypeFromContent
}: EnhancementHeaderProps) => {
  // Calculate reading stats
  const wordCount = content ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 words/minute

  return (
    <div className="border-b border-border py-3 px-4 bg-gradient-to-r from-mint-50/30 to-white h-[73px] flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Icon className={cn("h-5 w-5", color)} />
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>{description}</span>
            {content && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{wordCount} words</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{readingTime} min read</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {contentType !== 'original' && onRetryEnhancement && (
        <Button
          onClick={() => onRetryEnhancement(getEnhancementTypeFromContent(contentType))}
          disabled={retryLoading}
          variant="ghost"
          size="sm"
          className="text-mint-600 hover:text-mint-700 hover:bg-mint-50"
        >
          {retryLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin text-mint-600" />
          ) : (
            <RefreshCw className="h-4 w-4 text-mint-600" />
          )}
        </Button>
      )}
    </div>
  );
};
