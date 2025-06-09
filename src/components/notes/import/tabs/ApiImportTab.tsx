
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, Database, Link, Zap } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";

interface ApiImportTabProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ApiImportTab = ({ onSaveNote, isPremiumUser }: ApiImportTabProps) => {
  const [activeApiTab, setActiveApiTab] = useState('notion');
  const [isImporting, setIsImporting] = useState(false);
  const [apiCredentials, setApiCredentials] = useState({
    notion: { token: '', pageId: '' },
    evernote: { token: '', notebookId: '' },
    googledocs: { documentId: '', accessToken: '' },
    url: { url: '', title: '' }
  });

  const handleCredentialChange = (service: string, field: string, value: string) => {
    setApiCredentials(prev => ({
      ...prev,
      [service]: { ...prev[service as keyof typeof prev], [field]: value }
    }));
  };

  const importFromApi = async (service: string) => {
    setIsImporting(true);
    try {
      // Simulate API import
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would make actual API calls
      const simulatedContent = `Content imported from ${service}\n\nThis is simulated content that would be fetched from the ${service} API. The actual implementation would:\n\n- Authenticate with the service\n- Fetch the specified content\n- Parse and format the data\n- Create structured notes\n\nImported at: ${new Date().toLocaleString()}`;
      
      const note: Omit<Note, 'id'> = {
        title: `${service} Import - ${new Date().toLocaleDateString()}`,
        content: simulatedContent,
        description: `Content imported from ${service}`,
        subject: 'Imports',
        tags: [{ name: service, color: '#3B82F6' }, { name: 'API Import', color: '#8B5CF6' }],
        sourceType: 'import',
        pinned: false,
        archived: false,
        date: new Date().toISOString().split('T')[0],
        category: 'Imports'
      };

      const success = await onSaveNote(note);
      if (success) {
        toast.success(`Successfully imported from ${service}!`);
      }
    } catch (error) {
      console.error(`Error importing from ${service}:`, error);
      toast.error(`Failed to import from ${service}`);
    } finally {
      setIsImporting(false);
    }
  };

  const importFromUrl = async () => {
    const { url, title } = apiCredentials.url;
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setIsImporting(true);
    try {
      // Simulate URL content extraction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const simulatedContent = `Content extracted from: ${url}\n\nTitle: ${title || 'Web Page Content'}\n\nThis is simulated content that would be extracted from the web page. The actual implementation would:\n\n- Fetch the webpage content\n- Extract main text content\n- Remove navigation and ads\n- Preserve formatting\n- Extract metadata\n\nExtracted at: ${new Date().toLocaleString()}`;
      
      const note: Omit<Note, 'id'> = {
        title: title || `Web Import - ${new Date().toLocaleDateString()}`,
        content: simulatedContent,
        description: `Content imported from ${url}`,
        subject: 'Web Imports',
        tags: [{ name: 'Web Import', color: '#10B981' }, { name: 'URL', color: '#6366F1' }],
        sourceType: 'import',
        pinned: false,
        archived: false,
        date: new Date().toISOString().split('T')[0],
        category: 'Web Imports'
      };

      const success = await onSaveNote(note);
      if (success) {
        toast.success("Successfully imported from URL!");
        setApiCredentials(prev => ({ ...prev, url: { url: '', title: '' } }));
      }
    } catch (error) {
      console.error('Error importing from URL:', error);
      toast.error("Failed to import from URL");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Import from External Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeApiTab} onValueChange={setActiveApiTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notion">Notion</TabsTrigger>
              <TabsTrigger value="evernote">Evernote</TabsTrigger>
              <TabsTrigger value="googledocs">Google Docs</TabsTrigger>
              <TabsTrigger value="url">Web URL</TabsTrigger>
            </TabsList>

            <TabsContent value="notion" className="space-y-4 mt-6">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="notion-token">Notion Integration Token</Label>
                  <Input
                    id="notion-token"
                    type="password"
                    placeholder="secret_..."
                    value={apiCredentials.notion.token}
                    onChange={(e) => handleCredentialChange('notion', 'token', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notion-page">Page ID</Label>
                  <Input
                    id="notion-page"
                    placeholder="Page or database ID"
                    value={apiCredentials.notion.pageId}
                    onChange={(e) => handleCredentialChange('notion', 'pageId', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => importFromApi('Notion')}
                  disabled={isImporting || !apiCredentials.notion.token}
                  className="w-full"
                >
                  {isImporting ? 'Importing...' : 'Import from Notion'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="evernote" className="space-y-4 mt-6">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="evernote-token">Evernote Developer Token</Label>
                  <Input
                    id="evernote-token"
                    type="password"
                    placeholder="Developer token"
                    value={apiCredentials.evernote.token}
                    onChange={(e) => handleCredentialChange('evernote', 'token', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="evernote-notebook">Notebook ID (optional)</Label>
                  <Input
                    id="evernote-notebook"
                    placeholder="Leave empty for all notes"
                    value={apiCredentials.evernote.notebookId}
                    onChange={(e) => handleCredentialChange('evernote', 'notebookId', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => importFromApi('Evernote')}
                  disabled={isImporting || !apiCredentials.evernote.token}
                  className="w-full"
                >
                  {isImporting ? 'Importing...' : 'Import from Evernote'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="googledocs" className="space-y-4 mt-6">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="googledocs-id">Google Docs Document ID</Label>
                  <Input
                    id="googledocs-id"
                    placeholder="Document ID from URL"
                    value={apiCredentials.googledocs.documentId}
                    onChange={(e) => handleCredentialChange('googledocs', 'documentId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="googledocs-token">Access Token</Label>
                  <Input
                    id="googledocs-token"
                    type="password"
                    placeholder="OAuth access token"
                    value={apiCredentials.googledocs.accessToken}
                    onChange={(e) => handleCredentialChange('googledocs', 'accessToken', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => importFromApi('Google Docs')}
                  disabled={isImporting || !apiCredentials.googledocs.documentId}
                  className="w-full"
                >
                  {isImporting ? 'Importing...' : 'Import from Google Docs'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-6">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="url-input">Web Page URL</Label>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/article"
                    value={apiCredentials.url.url}
                    onChange={(e) => handleCredentialChange('url', 'url', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="url-title">Custom Title (optional)</Label>
                  <Input
                    id="url-title"
                    placeholder="Will auto-extract if empty"
                    value={apiCredentials.url.title}
                    onChange={(e) => handleCredentialChange('url', 'title', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={importFromUrl}
                  disabled={isImporting || !apiCredentials.url.url}
                  className="w-full"
                >
                  {isImporting ? 'Extracting...' : 'Import from URL'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {!isPremiumUser && (
            <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  Premium Feature
                </Badge>
              </div>
              <p className="text-sm text-yellow-700">
                API imports are available for premium users. Upgrade to connect with external services.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
