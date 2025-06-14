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
    if (!accessToken) {
      setDetailedError('No access token available. Please reconnect.');
      return;
    }
    
    setIsRefreshingDocs(true);
    setDetailedError(null);
    
    try {
      console.log('🔍 Fetching Google Docs with token:', accessToken.substring(0, 20) + '...');
      
      // First, validate the token with a simple userinfo call
      console.log('🧪 Validating token with userinfo endpoint...');
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('👤 User info response:', {
        status: userInfoResponse.status,
        statusText: userInfoResponse.statusText,
        headers: Object.fromEntries(userInfoResponse.headers.entries())
      });
      
      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error('❌ Token validation failed:', errorText);
        throw new Error(`Token validation failed (${userInfoResponse.status}): ${errorText}`);
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('✅ Token validated successfully for user:', userInfo.email);
      
      // Now try to fetch documents from Google Drive API
      console.log('📚 Fetching documents from Google Drive API...');
      const driveApiUrl = 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
        q: "mimeType='application/vnd.google-apps.document'",
        fields: 'files(id,name,createdTime,modifiedTime,owners,permissions)',
        orderBy: 'modifiedTime desc',
        pageSize: '10'
      });
      
      console.log('🔗 Drive API URL:', driveApiUrl);
      
      const driveResponse = await fetch(driveApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📋 Google Drive API response:', {
        status: driveResponse.status,
        statusText: driveResponse.statusText,
        headers: Object.fromEntries(driveResponse.headers.entries())
      });

      if (!driveResponse.ok) {
        const errorText = await driveResponse.text();
        console.error('❌ Google Drive API error:', errorText);
        
        let errorMessage = `Google Drive API Error (${driveResponse.status}): ${driveResponse.statusText}`;
        
        // Parse error details if available
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = `${errorMessage}\n\nDetails: ${errorData.error.message || errorData.error}`;
            
            // Provide specific guidance based on error codes
            if (errorData.error.code === 403) {
              errorMessage += '\n\n🔧 Troubleshooting Steps:\n';
              errorMessage += '• Ensure Google Drive API is enabled in Google Cloud Console\n';
              errorMessage += '• Verify OAuth consent screen includes required scopes\n';
              errorMessage += '• Check that you are added as a test user\n';
              errorMessage += '• Try disconnecting and reconnecting your account';
            } else if (errorData.error.code === 401) {
              errorMessage += '\n\n🔧 Authentication Issue:\n';
              errorMessage += '• Your access token may have expired\n';
              errorMessage += '• Try disconnecting and reconnecting your Google account\n';
              errorMessage += '• Ensure all required scopes are granted';
            }
          }
        } catch (e) {
          // Error text is not JSON, use as is
          errorMessage += `\n\nRaw Response: ${errorText}`;
        }
        
        setDetailedError(errorMessage);
        throw new Error(errorMessage);
      }

      const driveData = await driveResponse.json();
      console.log('📄 Google Drive API response data:', driveData);
      
      if (driveData.files && Array.isArray(driveData.files)) {
        setDocuments(driveData.files);
        toast.success(`Found ${driveData.files.length} Google Docs`);
        
        if (driveData.files.length === 0) {
          setDetailedError('No Google Docs found in your account. Create some documents in Google Drive first.');
        }
      } else {
        console.log('⚠️ Unexpected response format:', driveData);
        setDocuments([]);
        setDetailedError('Unexpected response format from Google Drive API');
      }
    } catch (error) {
      console.error('💥 Error fetching Google Docs:', error);
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
          <AlertDescription className="text-orange-700 whitespace-pre-line text-xs">
            {detailedError}
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
