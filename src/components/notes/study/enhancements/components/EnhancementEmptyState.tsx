
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface EnhancementEmptyStateProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onRetryEnhancement?: (enhancementType: string) => void;
  retryLoading: boolean;
  getEnhancementTypeFromContent: (contentType: string) => string;
  contentType: string;
}

export const EnhancementEmptyState = ({
  title,
  icon: Icon,
  onRetryEnhancement,
  retryLoading,
  getEnhancementTypeFromContent,
  contentType
}: EnhancementEmptyStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-mint-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-mint-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No {title.toLowerCase()} available</h3>
        <p className="text-sm text-gray-500 mb-6">
          Generate AI-enhanced content to see {title.toLowerCase()} here
        </p>
        {onRetryEnhancement && (
          <Button
            onClick={() => onRetryEnhancement(getEnhancementTypeFromContent(contentType))}
            disabled={retryLoading}
            variant="outline"
            size="sm"
            className="text-mint-600 hover:text-mint-700 border-mint-200 hover:border-mint-300 bg-mint-50 hover:bg-mint-100"
          >
            {retryLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2 text-mint-600" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2 text-mint-600" />
            )}
            Generate {title}
          </Button>
        )}
      </div>
    </div>
  );
};
