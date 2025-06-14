
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Copy, ExternalLink } from "lucide-react";

interface GoogleDocsActionBarProps {
  isAuthenticated: boolean;
  documentsCount: number;
  selectedDocsCount: number;
  isRefreshing: boolean;
  loading: boolean;
  onRefresh: () => void;
  onImport: () => void;
  onConnect: () => void;
  isImporting?: boolean;
}

export const GoogleDocsActionBar = ({
  isAuthenticated,
  documentsCount,
  selectedDocsCount,
  isRefreshing,
  loading,
  onRefresh,
  onImport,
  onConnect,
  isImporting = false
}: GoogleDocsActionBarProps) => {
  if (!isAuthenticated) {
    return (
      <div className="text-center py-4">
        <Button onClick={onConnect} disabled={loading} className="w-full max-w-sm">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect to Google Docs
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading || isRefreshing || isImporting}
        >
          {isRefreshing ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Refresh
        </Button>
        {documentsCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {selectedDocsCount} of {documentsCount} selected
          </span>
        )}
      </div>
      
      {selectedDocsCount > 0 && (
        <Button 
          onClick={onImport} 
          size="sm"
          disabled={isImporting || loading}
        >
          {isImporting ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Import ({selectedDocsCount})
            </>
          )}
        </Button>
      )}
    </div>
  );
};
