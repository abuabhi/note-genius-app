
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOneNoteAuth } from "@/integrations/microsoft/oneNoteOAuth";
import { Loader2, Check, X, AlertCircle, ExternalLink } from "lucide-react";

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
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
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
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect to OneNote
              </>
            )}
          </Button>
        )}
      </div>

      {!isAuthenticated && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Setup Required:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Configure Microsoft Graph app in Azure portal</li>
              <li>Add client ID and secret to Supabase secrets</li>
              <li>Set redirect URL to: <code className="bg-blue-100 px-1 rounded">{window.location.origin}/auth/microsoft-callback</code></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
