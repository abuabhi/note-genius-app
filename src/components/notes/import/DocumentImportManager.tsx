import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DocumentAuthService } from '@/services/auth/DocumentAuthService';
import { useDocumentAuth } from '@/hooks/useDocumentAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface DocumentItem {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  [key: string]: any;
}

interface DocumentImportManagerProps {
  authService: DocumentAuthService;
  provider: string;
  onBack: () => void;
  onImport: (documents: DocumentItem[], accessToken: string) => Promise<void>;
  fetchDocuments: (accessToken: string) => Promise<DocumentItem[]>;
  onAuthStateChange?: (isAuthenticated: boolean) => void;
}

export const DocumentImportManager: React.FC<DocumentImportManagerProps> = ({
  authService,
  provider,
  onBack,
  onImport,
  fetchDocuments,
  onAuthStateChange
}) => {
  const { isAuthenticated, credentials, loading, error, connect, disconnect } = useDocumentAuth(authService);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Notify parent of auth state changes
  useEffect(() => {
    onAuthStateChange?.(isAuthenticated);
  }, [isAuthenticated, onAuthStateChange]);

  // Fetch documents when authenticated
  useEffect(() => {
    if (isAuthenticated && credentials?.accessToken) {
      loadDocuments();
    } else {
      setDocuments([]);
      setSelectedDocIds([]);
    }
  }, [isAuthenticated, credentials?.accessToken]);

  const loadDocuments = async () => {
    if (!credentials?.accessToken) return;

    setIsLoadingDocs(true);
    setImportError(null);

    try {
      console.log(`🔍 [${provider.toUpperCase()}] Fetching documents...`);
      const docs = await fetchDocuments(credentials.accessToken);
      setDocuments(docs);
      
      if (docs.length === 0) {
        toast.info(`No ${provider} documents found`);
      } else {
        toast.success(`Found ${docs.length} ${provider} document${docs.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error(`❌ [${provider.toUpperCase()}] Error fetching documents:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents';
      setImportError(errorMessage);
      toast.error(`Failed to fetch ${provider} documents: ${errorMessage}`);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllDocs = () => {
    setSelectedDocIds(documents.map(doc => doc.id));
  };

  const clearSelection = () => {
    setSelectedDocIds([]);
  };

  const handleImport = async () => {
    if (selectedDocIds.length === 0) {
      toast.error('Please select at least one document to import');
      return;
    }

    if (!credentials?.accessToken) {
      toast.error('Authentication required. Please reconnect.');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const selectedDocs = documents.filter(doc => selectedDocIds.includes(doc.id));
      console.log(`🚀 [${provider.toUpperCase()}] Starting import of ${selectedDocs.length} documents`);
      
      await onImport(selectedDocs, credentials.accessToken);
      
      // Clear selection after successful import
      setSelectedDocIds([]);
      
      toast.success(`Successfully imported ${selectedDocs.length} document${selectedDocs.length !== 1 ? 's' : ''}!`);
      
    } catch (error) {
      console.error(`❌ [${provider.toUpperCase()}] Import failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setImportError(errorMessage);
      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  const getProviderDisplayName = () => {
    switch (provider) {
      case 'googledocs': return 'Google Docs';
      case 'onenote': return 'OneNote';
      default: return provider;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h3 className="text-lg font-semibold">{getProviderDisplayName()} Import</h3>
        </div>

        {/* Auth Status */}
        {isAuthenticated && credentials ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Connected as {credentials.userName || credentials.email || 'User'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={disconnect}
              disabled={loading}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <p className="text-sm text-muted-foreground">
              Connect to your {getProviderDisplayName()} account to import documents
            </p>
            <Button 
              onClick={connect}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                `Connect to ${getProviderDisplayName()}`
              )}
            </Button>
          </div>
        )}

        {/* Error Display */}
        {(error || importError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                {error || importError}
              </div>
            </div>
          </div>
        )}

        {/* Document Actions */}
        {isAuthenticated && documents.length > 0 && (
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="text-sm text-muted-foreground">
              {selectedDocIds.length} of {documents.length} selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDocuments}
                disabled={isLoadingDocs}
              >
                {isLoadingDocs ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              {selectedDocIds.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllDocs}
                >
                  Select All
                </Button>
              )}
              <Button
                onClick={handleImport}
                disabled={selectedDocIds.length === 0 || isImporting}
                size="sm"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import Selected (${selectedDocIds.length})`
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Document List */}
      {isAuthenticated && (
        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoadingDocs ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading documents...</span>
            </div>
          ) : documents.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleDocSelection(doc.id)}
                  >
                    <Checkbox
                      checked={selectedDocIds.includes(doc.id)}
                      onChange={() => toggleDocSelection(doc.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{doc.name}</h4>
                      {doc.modifiedTime && (
                        <p className="text-sm text-muted-foreground">
                          Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">No documents found</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={loadDocuments}
                  disabled={isLoadingDocs}
                  className="mt-2"
                >
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};