
import { Button } from "@/components/ui/button";
import { useEvernoteAuth } from "@/integrations/evernote/evernoteOAuth";
import { CircleCheck, Loader2, LogIn, LogOut } from "lucide-react";

interface EvernoteConnectionProps {
  onConnected: (token: string) => void;
}

export const EvernoteConnection = ({ onConnected }: EvernoteConnectionProps) => {
  const { isAuthenticated, accessToken, userName, loading, error, connect, disconnect } = useEvernoteAuth();
  
  // Effect to call onConnected when authenticated
  if (isAuthenticated && accessToken) {
    onConnected(accessToken);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Evernote Integration</h3>
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
            Connect to Evernote
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
          "Connect your Evernote account to import notes directly." :
          "You've successfully connected your Evernote account. You can now import your notes."
        }
      </div>
    </div>
  );
};
