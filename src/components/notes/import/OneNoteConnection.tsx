
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOneNoteAuth } from "@/integrations/microsoft/oneNoteOAuth";
import { Loader2, Check, X } from "lucide-react";

interface OneNoteConnectionProps {
  onConnected: (accessToken: string) => void;
}

export const OneNoteConnection = ({ onConnected }: OneNoteConnectionProps) => {
  const { isAuthenticated, accessToken, loading, error, connect, disconnect } = useOneNoteAuth();
  
  // When authentication changes and we have an access token, call the callback
  if (isAuthenticated && accessToken) {
    onConnected(accessToken);
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">Microsoft OneNote</h3>
          <p className="text-sm text-muted-foreground">
            Connect to import notes from OneNote
          </p>
        </div>
        
        {isAuthenticated ? (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="h-3 w-3 mr-1" /> Connected
          </Badge>
        ) : (
          <Badge className="bg-gray-400 hover:bg-gray-500">
            <X className="h-3 w-3 mr-1" /> Not Connected
          </Badge>
        )}
      </div>
      
      {error && (
        <div className="p-2 text-sm bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}
      
      <div className="flex gap-2">
        {isAuthenticated ? (
          <Button 
            variant="destructive" 
            onClick={disconnect}
            disabled={loading}
            size="sm"
          >
            Disconnect OneNote
          </Button>
        ) : (
          <Button 
            onClick={connect} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>Connect to OneNote</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
