import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { GoogleDocsAuthService } from '@/services/auth/GoogleDocsAuthService';
import { GoogleDocsImporter } from '@/services/googleDocsImporter';

interface DocumentItem {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  error: string | null;
}

interface ImportResult {
  success: boolean;
  document: any;
  error?: string;
}

export default function GoogleDocsTestPage() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    error: null
  });
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);

  const authService = GoogleDocsAuthService.getInstance();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[GoogleDocsTest] ${message}`);
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        addLog('Checking existing authentication...');
        const authState = await authService.getAuthState();
        
        if (authState.isAuthenticated && authState.credentials) {
          setAuthState({
            isAuthenticated: true,
            accessToken: authState.credentials.accessToken,
            error: null
          });
          addLog('✅ Found existing authentication');
          addLog(`✅ User: ${authState.credentials.userName} (${authState.credentials.email})`);
        } else {
          addLog('ℹ️ No existing authentication found');
        }
      } catch (error) {
        addLog(`❌ Auth check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    checkExistingAuth();
  }, []);

  const handleAuth = async () => {
    try {
      setLoading(true);
      addLog('Starting authentication...');
      addLog('Opening Google OAuth popup...');
      
      const credentials = await authService.authenticate();
      
      setAuthState({
        isAuthenticated: true,
        accessToken: credentials.accessToken,
        error: null
      });
      addLog(`✅ Authentication successful! Token: ${credentials.accessToken.substring(0, 20)}...`);
      addLog(`✅ User: ${credentials.userName} (${credentials.email})`);
      addLog(`✅ Token expires at: ${credentials.expiresAt}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        error: errorMessage
      });
      addLog(`❌ Authentication error: ${errorMessage}`);
      addLog(`❌ Error details: ${JSON.stringify(error)}`);
    } finally {
      setLoading(false);
      addLog('Authentication process completed');
    }
  };

  const handleDisconnect = async () => {
    try {
      await authService.disconnect();
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        error: null
      });
      setDocuments([]);
      setSelectedDocs([]);
      setImportResults([]);
      addLog('🔌 Disconnected successfully');
    } catch (error) {
      addLog(`❌ Disconnect error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fetchDocuments = async () => {
    if (!authState.accessToken) {
      addLog('❌ No access token available');
      return;
    }

    try {
      setLoading(true);
      addLog('Fetching Google Docs...');

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.document"&fields=files(id,name,createdTime,modifiedTime)&orderBy=modifiedTime desc',
        {
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setDocuments(data.files || []);
      addLog(`✅ Fetched ${data.files?.length || 0} documents`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Fetch error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!authState.accessToken || selectedDocs.length === 0) {
      addLog('❌ No access token or no documents selected');
      return;
    }

    try {
      setLoading(true);
      addLog(`Starting import of ${selectedDocs.length} documents...`);

      const importer = new GoogleDocsImporter(authState.accessToken);
      const results = await importer.importDocuments(selectedDocs);
      
      setImportResults(results);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      addLog(`✅ Import completed: ${successful} successful, ${failed} failed`);
      
      results.forEach(result => {
        if (result.success) {
          addLog(`✅ Imported: ${result.document.title}`);
        } else {
          addLog(`❌ Failed: ${result.document.title} - ${result.error}`);
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Import error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Google Docs Test Page</h1>
        <Badge variant="outline" className="text-sm">
          Test Environment
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge variant={authState.isAuthenticated ? "default" : "secondary"}>
                {authState.isAuthenticated ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            {authState.accessToken && (
              <div className="text-sm text-muted-foreground">
                Token: {authState.accessToken.substring(0, 30)}...
              </div>
            )}
            
            {authState.error && (
              <div className="text-sm text-destructive">
                Error: {authState.error}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleAuth} 
                disabled={loading || authState.isAuthenticated}
                className="flex-1"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Connect Google
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={!authState.isAuthenticated}
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={fetchDocuments}
              disabled={!authState.isAuthenticated || loading}
              className="w-full"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Fetch Documents
            </Button>
            
            {documents.length > 0 && (
              <>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedDocs.includes(doc.id) ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleDocSelection(doc.id)}
                    >
                      <div className="font-medium text-sm">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Modified: {new Date(doc.modifiedTime || doc.createdTime).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedDocs.length} selected
                  </span>
                  <Button 
                    onClick={handleImport}
                    disabled={selectedDocs.length === 0 || loading}
                    size="sm"
                  >
                    Import Selected
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Results Section */}
      {importResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {importResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{result.document.title}</span>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Debug Logs ({logs.length})</span>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              Clear
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">No logs yet...</div>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}