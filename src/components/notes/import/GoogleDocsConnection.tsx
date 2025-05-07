
import { Button } from "@/components/ui/button";
import { useGoogleDocsAuth } from "@/integrations/google/googleDocsOAuth";
import { CircleCheck, Loader2, LogIn, LogOut } from "lucide-react";

interface GoogleDocsConnectionProps {
  onConnected: (token: string) => void;
}

export const GoogleDocsConnection = ({ onConnected }: GoogleDocsConnectionProps) => {
  const { isAuthenticated, accessToken, userName, loading, error, connect, disconnect } = useGoogleDocsAuth();
  
  // Effect to call onConnected when authenticated
  if (isAuthenticated && accessToken) {
    onConnected(accessToken);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Google Docs Integration</h3>
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

      {userName && (
        <div className="text-sm">
          <span className="font-medium">Connected Account:</span> {userName}
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
            Connect to Google Docs
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
          "Connect your Google account to import documents from Google Docs." :
          "You've successfully connected your Google account. You can now import your documents."
        }
      </div>
    </div>
  );
};
