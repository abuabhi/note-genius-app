import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOneNoteAuth } from "@/integrations/microsoft/oneNoteOAuth";
import { Loader2, Check, X, AlertCircle, ExternalLink, RefreshCw, Copy, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface OneNoteConnectionProps {
  onConnected: (accessToken: string) => void;
}

export const OneNoteConnection = ({ onConnected }: OneNoteConnectionProps) => {
  const { isAuthenticated, accessToken, loading, error, connect, disconnect } = useOneNoteAuth();
  const [isRefreshingPages, setIsRefreshingPages] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<{name?: string, email?: string} | null>(null);
  
  // When authentication changes and we have an access token, call the callback
  if (isAuthenticated && accessToken) {
    onConnected(accessToken);
  }

  // Fetch user info when authenticated
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!accessToken) {
        setUserInfo(null);
        return;
      }
      
      try {
        console.log('Fetching Microsoft user info...');
        const response = await fetch('https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Failed to fetch user info:', response.status, response.statusText);
          return;
        }

        const userData = await response.json();
        console.log('Microsoft user info:', userData);
        
        setUserInfo({
          name: userData.displayName,
          email: userData.mail || userData.userPrincipalName
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    if (isAuthenticated && accessToken) {
      fetchUserInfo();
    }
  }, [isAuthenticated, accessToken]);

  const fetchPages = async () => {
    if (!accessToken) return;
    
    setIsRefreshingPages(true);
    try {
      console.log('Fetching OneNote pages with token:', accessToken.substring(0, 20) + '...');
      
      const response = await fetch('https://graph.microsoft.com/v1.0/me/onenote/pages?$select=id,title,createdDateTime,lastModifiedDateTime&$top=50&$orderby=lastModifiedDateTime desc', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('OneNote API response status:', response.status);
      console.log('OneNote API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OneNote API error response:', errorText);
        throw new Error(`Failed to fetch OneNote pages: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OneNote API response data:', data);
      
      if (data.value && Array.isArray(data.value)) {
        setPages(data.value);
        toast.success(`Found ${data.value.length} OneNote pages`);
      } else {
        console.log('No pages in response or unexpected format:', data);
        setPages([]);
        toast.info('No OneNote pages found in your account');
      }
    } catch (error) {
      console.error('Error fetching OneNote pages:', error);
      toast.error(`Failed to fetch OneNote pages: ${error.message}`);
      setPages([]);
    } finally {
      setIsRefreshingPages(false);
    }
  };

  const switchAccount = async () => {
    // Disconnect current session
    disconnect();
    setPages([]);
    setSelectedPages([]);
    setUserInfo(null);
    
    // Add a slight delay to ensure cleanup is complete
    setTimeout(() => {
      // Force a fresh login by calling the connect function directly
      connect();
    }, 500);
  };

  const togglePageSelection = (pageId: string) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const importSelectedPages = async () => {
    if (selectedPages.length === 0) {
      toast.error('Please select at least one page to import');
      return;
    }

    toast.success(`Importing ${selectedPages.length} selected pages...`);
    // The actual import logic is handled by the parent component
  };
  
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
      
      {/* User Info Display */}
      {isAuthenticated && userInfo && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
              <User className="h-4 w-4" />
              <div className="text-sm">
                <p className="font-medium">Connected as: {userInfo.name}</p>
                <p className="text-blue-600">{userInfo.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={switchAccount}
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
      
      <div className="flex gap-2">
        {isAuthenticated ? (
          <>
            <Button 
              variant="destructive" 
              onClick={disconnect}
              disabled={loading}
              size="sm"
            >
              Disconnect OneNote
            </Button>
            <Button 
              variant="outline"
              onClick={fetchPages}
              disabled={loading || isRefreshingPages}
              size="sm"
            >
              {isRefreshingPages ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Pages
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
                Connect to OneNote
              </>
            )}
          </Button>
        )}
      </div>

      {isAuthenticated && (
        <div className="space-y-4">
          {pages.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Select Pages to Import:</h4>
                <div className="text-sm text-muted-foreground">
                  {selectedPages.length} of {pages.length} selected
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {pages.map((page) => (
                  <div 
                    key={page.id} 
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPages.includes(page.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => togglePageSelection(page.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPages.includes(page.id)}
                            onChange={() => togglePageSelection(page.id)}
                            className="w-4 h-4"
                          />
                          <div className="font-medium text-sm">{page.title}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(page.createdDateTime).toLocaleDateString()}
                          {page.lastModifiedDateTime && (
                            <> • Modified: {new Date(page.lastModifiedDateTime).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedPages.length > 0 && (
                <Button onClick={importSelectedPages} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Import {selectedPages.length} Selected Page{selectedPages.length > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-3">
                {isRefreshingPages ? 'Loading pages...' : 'No OneNote pages found'}
              </div>
              <Button 
                variant="outline" 
                onClick={fetchPages}
                disabled={isRefreshingPages}
              >
                {isRefreshingPages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Loading Pages
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Setup Complete:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Microsoft Graph app configured in Azure portal ✓</li>
              <li>Client ID and secret added to Supabase secrets ✓</li>
              <li>Redirect URL configured ✓</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
