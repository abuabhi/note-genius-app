
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";

interface ApiImportTabProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ApiImportTab = ({ onSaveNote, isPremiumUser }: ApiImportTabProps) => {
  const [activeApiTab, setActiveApiTab] = useState('onenote');
  const [isImporting, setIsImporting] = useState(false);
  const [apiCredentials, setApiCredentials] = useState({
    onenote: { token: '', pageId: '' },
    googledocs: { documentId: '', accessToken: '' },
    notion: { token: '', pageId: '' }
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
              <div className="space-y-3">
                <div>
                  <Label htmlFor="onenote-token">OneNote Access Token</Label>
                  <Input
                    id="onenote-token"
                    type="password"
                    placeholder="Microsoft Graph access token"
                    value={apiCredentials.onenote.token}
                    onChange={(e) => handleCredentialChange('onenote', 'token', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="onenote-page">Page ID</Label>
                  <Input
                    id="onenote-page"
                    placeholder="OneNote page ID"
                    value={apiCredentials.onenote.pageId}
                    onChange={(e) => handleCredentialChange('onenote', 'pageId', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => importFromApi('OneNote')}
                  disabled={isImporting || !apiCredentials.onenote.token}
                  className="w-full"
                >
                  {isImporting ? 'Importing...' : 'Import from OneNote'}
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
