
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, FileText } from "lucide-react";

interface GoogleDocsEmptyStateProps {
  isRefreshing: boolean;
  hasDetailedError: boolean;
  onRefresh: () => void;
}

export const GoogleDocsEmptyState = ({ isRefreshing, hasDetailedError, onRefresh }: GoogleDocsEmptyStateProps) => {
  if (isRefreshing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">Loading your Google Docs...</div>
        </div>
      </div>
    );
  }

  if (hasDetailedError) {
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <div className="text-muted-foreground mb-3">
          Click "Refresh" to load your Google Docs
        </div>
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Load Documents
        </Button>
      </div>
    </div>
  );
};
