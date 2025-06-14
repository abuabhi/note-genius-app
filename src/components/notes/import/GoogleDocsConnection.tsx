
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoogleDocsAuth } from "@/integrations/google/googleDocsOAuth";
import { Loader2, Check, X, AlertCircle, ExternalLink, RefreshCw, Copy, User, LogOut, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface GoogleDocsConnectionProps {
  onConnected: (accessToken: string) => void;
}

export const GoogleDocsConnection = ({ onConnected }: GoogleDocsConnectionProps) => {
  const { isAuthenticated, accessToken, userName, loading, error, connect, disconnect } = useGoogleDocsAuth();
  const [isRefreshingDocs, setIsRefreshingDocs] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  
  // When authentication changes and we have an access token, call the callback
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      onConnected(accessToken);
    }
  }, [isAuthenticated, accessToken, onConnected]);

  const fetchDocuments = async () => {
    if (!accessToken) return;
    
    setIsRefreshingDocs(true);
    setDetailedError(null);
    
    try {
      console.log('Fetching Google Docs with token:', accessToken.substring(0, 20) + '...');
      
      // First, test token validity with userinfo endpoint
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('User info response status:', userInfoResponse.status);
      
      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error('Token validation failed:', errorText);
        throw new Error(`Token validation failed: ${userInfoResponse.status} - ${errorText}`);
      }
      
      // Now try to fetch documents from Google Drive
      const driveResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.document%27&fields=files(id%2Cname%2CcreatedTime%2CmodifiedTime%2Cowners%2Cpermissions)&orderBy=modifiedTime%20desc&pageSize=10',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Google Drive API response status:', driveResponse.status);
      console.log('Response headers:', Object.fromEntries(driveResponse.headers.entries()));

      if (!driveResponse.ok) {
        const errorText = await driveResponse.text();
        console.error('Google Drive API error response:', errorText);
        
        let errorMessage = `Failed to fetch Google Docs: ${driveResponse.status} ${driveResponse.statusText}`;
        
        // Parse error details if available
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = `${errorMessage}\nDetails: ${errorData.error.message || errorData.error}`;
            if (errorData.error.code === 403) {
              errorMessage += '\n\nPossible causes:\n- API not enabled in Google Cloud Console\n- Insufficient scopes\n- App not verified for sensitive scopes';
            }
          }
        } catch (e) {
          // Error text is not JSON, use as is
          errorMessage += `\nResponse: ${errorText}`;
        }
        
        setDetailedError(errorMessage);
        throw new Error(errorMessage);
      }

      const driveData = await driveResponse.json();
      console.log('Google Drive API response data:', driveData);
      
      if (driveData.files && Array.isArray(driveData.files)) {
        setDocuments(driveData.files);
        toast.success(`Found ${driveData.files.length} Google Docs`);
        
        if (driveData.files.length === 0) {
          setDetailedError('No Google Docs found in your account. Make sure you have documents in Google Drive.');
        }
      } else {
        console.log('No documents in response or unexpected format:', driveData);
        setDocuments([]);
        setDetailedError('Unexpected response format from Google Drive API');
      }
    } catch (error) {
      console.error('Error fetching Google Docs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDetailedError(errorMessage);
      toast.error(`Failed to fetch Google Docs: ${errorMessage}`);
      setDocuments([]);
    } finally {
      setIsRefreshingDocs(false);
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const importSelectedDocs = async () => {
    if (selectedDocs.length === 0) {
      toast.error('Please select at least one document to import');
      return;
    }

    toast.success(`Importing ${selectedDocs.length} selected document${selectedDocs.length > 1 ? 's' : ''}...`);
    // The actual import logic will be handled by the parent component
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">Google Docs</h3>
          <p className="text-sm text-muted-foreground">
            Connect to import documents from Google Docs
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
      
      {/* User Info Display */}
      {isAuthenticated && userName && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
              <User className="h-4 w-4" />
              <div className="text-sm">
                <p className="font-medium">Connected as: {userName}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                disconnect();
                setDocuments([]);
                setSelectedDocs([]);
                setDetailedError(null);
              }}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Switch Account
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {detailedError && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700 whitespace-pre-line">
            <strong>API Error Details:</strong>
            <br />
            {detailedError}
            <br /><br />
            <strong>Troubleshooting Steps:</strong>
            <br />
            1. Verify that Google Drive API is enabled in your Google Cloud Console
            <br />
            2. Check that your OAuth consent screen includes the required scopes
            <br />
            3. Ensure you've added yourself as a test user
            <br />
            4. Try disconnecting and reconnecting your Google account
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-2">
        {isAuthenticated ? (
          <>
            <Button 
              variant="destructive" 
              onClick={() => {
                disconnect();
                setDocuments([]);
                setSelectedDocs([]);
                setDetailedError(null);
              }}
              disabled={loading}
              size="sm"
            >
              Disconnect Google Docs
            </Button>
            <Button 
              variant="outline"
              onClick={fetchDocuments}
              disabled={loading || isRefreshingDocs}
              size="sm"
            >
              {isRefreshingDocs ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Documents
                </>
              )}
            </Button>
          </>
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
                Connect to Google Docs
              </>
            )}
          </Button>
        )}
      </div>

      {isAuthenticated && (
        <div className="space-y-4">
          {documents.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Select Documents to Import:</h4>
                <div className="text-sm text-muted-foreground">
                  {selectedDocs.length} of {documents.length} selected
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedDocs.includes(doc.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => toggleDocSelection(doc.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={() => toggleDocSelection(doc.id)}
                            className="w-4 h-4"
                          />
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div className="font-medium text-sm">{doc.name}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 ml-6">
                          Created: {new Date(doc.createdTime).toLocaleDateString()}
                          {doc.modifiedTime && (
                            <> • Modified: {new Date(doc.modifiedTime).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedDocs.length > 0 && (
                <Button onClick={importSelectedDocs} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Import {selectedDocs.length} Selected Document{selectedDocs.length > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          ) : !isRefreshingDocs && !detailedError ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-3">
                Click "Refresh Documents" to load your Google Docs
              </div>
              <Button 
                variant="outline" 
                onClick={fetchDocuments}
                disabled={isRefreshingDocs}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Documents
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
