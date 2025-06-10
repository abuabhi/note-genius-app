
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle, AlertCircle } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";
import { OneNoteConnection } from "../OneNoteConnection";
import { useOneNoteAuth } from "@/integrations/microsoft/oneNoteOAuth";

interface ApiImportTabProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ApiImportTab = ({ onSaveNote, isPremiumUser }: ApiImportTabProps) => {
  const [activeApiTab, setActiveApiTab] = useState('onenote');
  const [isImporting, setIsImporting] = useState(false);
  const [apiCredentials, setApiCredentials] = useState({
    googledocs: { documentId: '', accessToken: '' },
    notion: { token: '', pageId: '' }
  });
  const [oneNotePages, setOneNotePages] = useState<any[]>([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [oneNoteAccessToken, setOneNoteAccessToken] = useState('');

  const { isAuthenticated, accessToken, loading, error } = useOneNoteAuth();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      setOneNoteAccessToken(accessToken);
      fetchOneNotePages(accessToken);
    }
  }, [isAuthenticated, accessToken]);

  const fetchOneNotePages = async (token: string) => {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/onenote/pages?$select=id,title,createdDateTime&$top=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch OneNote pages: ${response.statusText}`);
      }

      const data = await response.json();
      setOneNotePages(data.value || []);
    } catch (error) {
      console.error('Error fetching OneNote pages:', error);
      toast.error('Failed to fetch OneNote pages');
    }
  };

  const handleCredentialChange = (service: string, field: string, value: string) => {
    setApiCredentials(prev => ({
      ...prev,
      [service]: { ...prev[service as keyof typeof prev], [field]: value }
    }));
  };

  const importFromOneNote = async () => {
    if (!oneNoteAccessToken || !selectedPageId) {
      toast.error('Please select a OneNote page to import');
      return;
    }

    setIsImporting(true);
    try {
      // Fetch the page content from OneNote
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/onenote/pages/${selectedPageId}/content`, {
        headers: {
          'Authorization': `Bearer ${oneNoteAccessToken}`,
          'Accept': 'text/html'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch page content: ${response.statusText}`);
      }

      const htmlContent = await response.text();
      
      // Get page details for title
      const pageResponse = await fetch(`https://graph.microsoft.com/v1.0/me/onenote/pages/${selectedPageId}?$select=id,title,createdDateTime`, {
        headers: {
          'Authorization': `Bearer ${oneNoteAccessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const pageData = await pageResponse.json();
      
      // Convert HTML to plain text (basic conversion)
      const textContent = convertHtmlToText(htmlContent);
      
      const note: Omit<Note, 'id'> = {
        title: pageData.title || `OneNote Page - ${new Date().toLocaleDateString()}`,
        content: textContent,
        description: `Imported from OneNote page`,
        tags: [
          { name: 'OneNote', color: '#7719AA' }, 
          { name: 'API Import', color: '#8B5CF6' }
        ],
        sourceType: 'import',
        pinned: false,
        archived: false,
        date: new Date().toISOString().split('T')[0],
        category: 'Imports',
        importData: {
          originalFileUrl: `https://onenote.com/pages/${selectedPageId}`,
          fileType: 'onenote',
          importedAt: new Date().toISOString()
        }
      };

      const success = await onSaveNote(note);
      if (success) {
        toast.success('Successfully imported from OneNote!');
        setSelectedPageId('');
      }
    } catch (error) {
      console.error('Error importing from OneNote:', error);
      toast.error(`Failed to import from OneNote: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const convertHtmlToText = (html: string): string => {
    // Create a temporary DOM element to parse HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Remove script and style elements
    const scripts = div.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get text content and clean it up
    let text = div.textContent || div.innerText || '';
    
    // Clean up extra whitespace and line breaks
    text = text.replace(/\s+/g, ' ').trim();
    text = text.replace(/\n\s*\n/g, '\n\n');
    
    return text;
  };

  const importFromApi = async (service: string) => {
    setIsImporting(true);
    try {
      // Simulate API import for other services (Google Docs, Notion)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedContent = `Content imported from ${service}\n\nThis is simulated content that would be fetched from the ${service} API. The actual implementation would:\n\n- Authenticate with the service\n- Fetch the specified content\n- Parse and format the data\n- Create structured notes\n\nImported at: ${new Date().toLocaleString()}`;
      
      const note: Omit<Note, 'id'> = {
        title: `${service} Import - ${new Date().toLocaleDateString()}`,
        content: simulatedContent,
        description: `Content imported from ${service}`,
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

  const handleConnected = (token: string) => {
    setOneNoteAccessToken(token);
    fetchOneNotePages(token);
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="onenote">OneNote</TabsTrigger>
              <TabsTrigger value="googledocs">Google Docs</TabsTrigger>
              <TabsTrigger value="notion">Notion</TabsTrigger>
            </TabsList>

            <TabsContent value="onenote" className="space-y-4 mt-6">
              <OneNoteConnection onConnected={handleConnected} />
              
              {isAuthenticated && oneNotePages.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="onenote-page">Select OneNote Page</Label>
                    <select
                      id="onenote-page"
                      value={selectedPageId}
                      onChange={(e) => setSelectedPageId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a page to import...</option>
                      {oneNotePages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.title} ({new Date(page.createdDateTime).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button 
                    onClick={importFromOneNote}
                    disabled={isImporting || !selectedPageId}
                    className="w-full"
                  >
                    {isImporting ? 'Importing...' : 'Import Selected Page'}
                  </Button>
                </div>
              )}

              {isAuthenticated && oneNotePages.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500">
                  No OneNote pages found or unable to fetch pages.
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
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
