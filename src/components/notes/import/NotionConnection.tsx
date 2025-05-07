
import { Button } from "@/components/ui/button";
import { useNotionAuth } from "@/integrations/notion/notionOAuth";
import { CircleCheck, Loader2, LogIn, LogOut } from "lucide-react";

interface NotionConnectionProps {
  onConnected: (token: string) => void;
}

export const NotionConnection = ({ onConnected }: NotionConnectionProps) => {
  const { isAuthenticated, accessToken, workspaceName, loading, error, connect, disconnect } = useNotionAuth();
  
  // Effect to call onConnected when authenticated
  if (isAuthenticated && accessToken) {
    onConnected(accessToken);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Notion Integration</h3>
        <div>
          {loading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <CircleCheck className="text-green-500 h-5 w-5" /> 
              <span className="text-sm">Connected</span>
            </div>
          ) : null}
        </div>
      </div>

      {workspaceName && (
        <div className="text-sm">
          <span className="font-medium">Connected Workspace:</span> {workspaceName}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 mt-1">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {!isAuthenticated ? (
          <Button onClick={connect} type="button" className="mt-2">
            <LogIn className="mr-2 h-4 w-4" />
            Connect to Notion
          </Button>
        ) : (
          <Button onClick={disconnect} variant="outline" type="button" className="mt-2">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        {!isAuthenticated ? 
          "Connect your Notion account to import pages and databases." :
          "You've successfully connected your Notion account. You can now import your pages."
        }
      </div>
    </div>
  );
};
