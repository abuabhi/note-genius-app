import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useGoogleDocsAuth } from "@/integrations/google/googleDocsOAuth";
import { 
  Loader2, 
  Check, 
  X, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  User, 
  LogOut, 
  FileText,
  ChevronDown,
  ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DedicatedGoogleDocsImportProps {
  onConnected: (accessToken: string) => void;
  onBack: () => void;
}

export const DedicatedGoogleDocsImport = ({ onConnected, onBack }: DedicatedGoogleDocsImportProps) => {
  const { isAuthenticated, accessToken, userName, loading, error, connect, disconnect } = useGoogleDocsAuth();
  const [isRefreshingDocs, setIsRefreshingDocs] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      onConnected(accessToken);
      fetchDocuments();
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
      
      // Validate token with userinfo
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        throw new Error(`Token validation failed (${userInfoResponse.status}): ${errorText}`);
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('✅ Token validated successfully for user:', userInfo.email);
      
      // Fetch documents from Google Drive API
      const driveApiUrl = 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
        q: "mimeType='application/vnd.google-apps.document'",
        fields: 'files(id,name,createdTime,modifiedTime,owners,permissions)',
        orderBy: 'modifiedTime desc',
        pageSize: '20'
      });
      
      const driveResponse = await fetch(driveApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!driveResponse.ok) {
        const errorText = await driveResponse.text();
        let errorMessage = `Google Drive API Error (${driveResponse.status}): ${driveResponse.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = `${errorMessage}\n\nDetails: ${errorData.error.message || errorData.error}`;
            
            if (errorData.error.code === 403) {
              errorMessage += '\n\n🔧 Troubleshooting:\n• Enable Google Drive API in Google Cloud Console\n• Verify OAuth consent screen includes required scopes\n• Try disconnecting and reconnecting your account';
            }
          }
        } catch (e) {
          errorMessage += `\n\nRaw Response: ${errorText}`;
        }
        
        setDetailedError(errorMessage);
        throw new Error(errorMessage);
      }

      const driveData = await driveResponse.json();
      
      if (driveData.files && Array.isArray(driveData.files)) {
        setDocuments(driveData.files);
        toast.success(`Found ${driveData.files.length} Google Docs`);
        
        if (driveData.files.length === 0) {
          setDetailedError('No Google Docs found in your account. Create some documents in Google Drive first.');
        }
      } else {
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
    console.log('Toggling selection for doc:', docId);
    setSelectedDocs(prev => {
      const newSelection = prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const importSelectedDocs = async () => {
    if (selectedDocs.length === 0) {
      toast.error('Please select at least one document to import');
      return;
    }

    toast.success(`Importing ${selectedDocs.length} selected document${selectedDocs.length > 1 ? 's' : ''}...`);
  };

  const handleDisconnect = () => {
    disconnect();
    setDocuments([]);
    setSelectedDocs([]);
    setDetailedError(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Compact Header */}
      <div className="flex-shrink-0 space-y-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Google Docs Import</h3>
                <p className="text-sm text-muted-foreground">
                  Select and import your Google Docs
                </p>
              </div>
            </div>
          </div>
          
          {/* Connection Status & User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 hover:bg-green-600">
                <Check className="h-3 w-3 mr-1" /> Connected
              </Badge>
              {userName && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-3">
                      <User className="h-3 w-3 mr-1" />
                      {userName.split(' ')[0]}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 text-sm border-b">
                      <p className="font-medium">{userName}</p>
                    </div>
                    <DropdownMenuItem onClick={handleDisconnect}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Switch Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <Badge className="bg-gray-400 hover:bg-gray-500">
              <X className="h-3 w-3 mr-1" /> Not Connected
            </Badge>
          )}
        </div>

        {/* Error Display */}
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
            <AlertDescription className="text-orange-700">
              <Collapsible open={showErrorDetails} onOpenChange={setShowErrorDetails}>
                <CollapsibleTrigger className="flex items-center gap-2 font-medium hover:underline">
                  Error Details
                  <ChevronDown className={`h-3 w-3 transition-transform ${showErrorDetails ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 text-xs whitespace-pre-line">
                  {detailedError}
                </CollapsibleContent>
              </Collapsible>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Bar */}
        {isAuthenticated ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={fetchDocuments}
                disabled={loading || isRefreshingDocs}
              >
                {isRefreshingDocs ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Refresh
              </Button>
              {documents.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedDocs.length} of {documents.length} selected
                </span>
              )}
            </div>
            
            {selectedDocs.length > 0 && (
              <Button onClick={importSelectedDocs} size="sm">
                <Copy className="h-3 w-3 mr-1" />
                Import ({selectedDocs.length})
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Button onClick={connect} disabled={loading} className="w-full max-w-sm">
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
        )}
      </div>

      {/* Document List - Takes Remaining Space */}
      {isAuthenticated && (
        <div className="flex-1 mt-4 min-h-0">
          {documents.length > 0 ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 border rounded-lg overflow-hidden bg-white">
                <ScrollArea className="h-full" style={{ height: '100%' }}>
                  <div className="p-1">
                    {documents.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                          selectedDocs.includes(doc.id) ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`doc-${doc.id}`}
                            checked={selectedDocs.includes(doc.id)}
                            onCheckedChange={(checked) => {
                              console.log('Checkbox changed:', doc.id, checked);
                              if (checked) {
                                setSelectedDocs(prev => [...prev, doc.id]);
                              } else {
                                setSelectedDocs(prev => prev.filter(id => id !== doc.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <FileText className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => toggleDocSelection(doc.id)}
                          >
                            <div className="font-medium text-sm truncate">{doc.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
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
                </ScrollArea>
              </div>
            </div>
          ) : !isRefreshingDocs && !detailedError ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <div className="text-muted-foreground mb-3">
                  Click "Refresh" to load your Google Docs
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
            </div>
          ) : isRefreshingDocs ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Loading your Google Docs...</div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
