import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GoogleDoc {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

export default function GoogleDocsImportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<GoogleDoc[]>([]);
  const [importing, setImporting] = useState<Set<string>>(new Set());
  const [imported, setImported] = useState<Set<string>>(new Set());

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'true') {
      setIsConnected(true);
      loadDocuments();
      toast.success('Successfully connected to Google Docs!');
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
    }
  }, [searchParams]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      // Get the OAuth URL from our edge function
      const { data, error } = await supabase.functions.invoke('googledocs-auth', {
        body: { action: 'get_auth_url', redirect_uri: `${window.location.origin}/auth/google-docs/callback` }
      });

      if (error) throw error;

      // Redirect to Google OAuth
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect to Google Docs');
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('googledocs-auth', {
        body: { action: 'list_documents' }
      });

      if (error) throw error;
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load Google Docs');
    } finally {
      setIsLoading(false);
    }
  };

  const importDocument = async (doc: GoogleDoc) => {
    try {
      setImporting(prev => new Set([...prev, doc.id]));
      
      const { data, error } = await supabase.functions.invoke('googledocs-auth', {
        body: { 
          action: 'import_document',
          document_id: doc.id 
        }
      });

      if (error) throw error;

      // Save the imported content as a note
      const { error: saveError } = await supabase
        .from('notes')
        .insert({
          title: doc.name,
          description: `Imported from Google Docs: ${doc.name}`,
          content: data.content,
          source_type: 'google_docs',
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (saveError) throw saveError;

      setImported(prev => new Set([...prev, doc.id]));
      toast.success(`Imported "${doc.name}" successfully!`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Failed to import "${doc.name}"`);
    } finally {
      setImporting(prev => {
        const newSet = new Set(prev);
        newSet.delete(doc.id);
        return newSet;
      });
    }
  };

  const handleBackToNotes = () => {
    navigate('/notes');
    if (imported.size > 0) {
      toast.success(`Successfully imported ${imported.size} document${imported.size === 1 ? '' : 's'}!`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBackToNotes}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Import from Google Docs</h1>
        <p className="text-muted-foreground">
          Connect your Google account and import your documents as notes.
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Connect to Google Docs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              To import your Google Docs, you'll need to connect your Google account. 
              We'll only access your documents with your permission.
            </p>
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Connecting...' : 'Connect Google Account'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Google Documents
                {imported.size > 0 && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {imported.size} imported
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No Google Docs found in your account.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {imported.has(doc.id) ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Imported</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => importDocument(doc)}
                            disabled={importing.has(doc.id)}
                            size="sm"
                          >
                            {importing.has(doc.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Importing...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Import
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {documents.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <Button
                    onClick={handleBackToNotes}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Done - Return to Notes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}