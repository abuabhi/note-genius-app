
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Book, File, FileText, Loader2 } from "lucide-react";
import { processSelectedDocument } from "./importUtils";
import { OneNoteConnection } from "./OneNoteConnection";

interface ApiImportProps {
  onImport: (type: string, content: string) => void;
}

export const ApiImport = ({ onImport }: ApiImportProps) => {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [pageId, setPageId] = useState("");
  const [importType, setImportType] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [oneNoteToken, setOneNoteToken] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!importType) {
      toast({
        title: "Selection Required",
        description: "Please select an import type first.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate inputs based on import type
    if (importType === "onenote") {
      if (!oneNoteToken) {
        toast({
          title: "Authentication Required",
          description: "Please connect to OneNote first.",
          variant: "destructive",
        });
        return;
      }
      
      if (!pageId) {
        toast({
          title: "Page ID Required",
          description: "Please enter a OneNote page ID.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please enter a valid API key or access token.",
          variant: "destructive",
        });
        return;
      }
      
      if (!pageId) {
        toast({
          title: "Page/Document ID Required",
          description: "Please enter a valid page or document ID.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      // Prepare API parameters based on the import type
      const apiParams: Record<string, any> = {};
      
      // Add specific parameters based on import type
      switch (importType) {
        case "notion":
          apiParams.token = apiKey;
          apiParams.pageId = pageId;
          break;
        case "onenote":
          apiParams.token = oneNoteToken;
          apiParams.pageId = pageId;
          break;
        case "evernote":
          apiParams.token = apiKey;
          apiParams.noteGuid = pageId;
          break;
        case "googledocs":
          apiParams.token = apiKey;
          apiParams.documentId = pageId;
          break;
      }
      
      // Process the document using the external API
      const result = await processSelectedDocument(null, importType, apiParams);
      
      // Pass the extracted content to parent component
      onImport(importType, result.text);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported from ${importType}.`,
      });
    } catch (error) {
      console.error("API import error:", error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import content",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select a service to import notes from:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer hover:border-mint-500 ${importType === 'notion' ? 'border-mint-500 bg-mint-50' : ''}`}
          onClick={() => setImportType('notion')}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <Book className="h-8 w-8 text-mint-600 mb-2" />
            <p className="font-medium">Notion</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-mint-500 ${importType === 'onenote' ? 'border-mint-500 bg-mint-50' : ''}`}
          onClick={() => setImportType('onenote')}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <File className="h-8 w-8 text-mint-600 mb-2" />
            <p className="font-medium">OneNote</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-mint-500 ${importType === 'evernote' ? 'border-mint-500 bg-mint-50' : ''}`}
          onClick={() => setImportType('evernote')}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <FileText className="h-8 w-8 text-mint-600 mb-2" />
            <p className="font-medium">Evernote</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-mint-500 ${importType === 'googledocs' ? 'border-mint-500 bg-mint-50' : ''}`}
          onClick={() => setImportType('googledocs')}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <File className="h-8 w-8 text-mint-600 mb-2" />
            <p className="font-medium">Google Docs</p>
          </CardContent>
        </Card>
      </div>
      
      {importType && (
        <div className="space-y-4 mt-4 p-4 border rounded-md">
          {importType === 'onenote' ? (
            <OneNoteConnection onConnected={token => setOneNoteToken(token)} />
          ) : (
            <div>
              <Label htmlFor="api-token">API Token/Integration Key</Label>
              <Input
                id="api-token"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={getPlaceholderText(importType, 'token')}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {getApiInstructions(importType)}
              </p>
            </div>
          )}
          
          <div>
            <Label htmlFor="page-id">{getLabelText(importType)}</Label>
            <Input
              id="page-id"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder={getPlaceholderText(importType, 'id')}
              className="mt-1"
            />
          </div>
          
          <Button 
            onClick={handleImport} 
            disabled={isProcessing || 
              (importType === 'onenote' ? !oneNoteToken || !pageId : !apiKey || !pageId)}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>Import from {getServiceName(importType)}</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// Helper function to get service name with proper capitalization
function getServiceName(type: string | null): string {
  if (!type) return '';
  
  switch (type) {
    case 'notion': return 'Notion';
    case 'onenote': return 'OneNote';
    case 'evernote': return 'Evernote';
    case 'googledocs': return 'Google Docs';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

// Helper function to get the correct label based on import type
function getLabelText(type: string): string {
  switch (type) {
    case 'notion': return 'Notion Page ID';
    case 'onenote': return 'OneNote Page ID';
    case 'evernote': return 'Note GUID';
    case 'googledocs': return 'Document ID';
    default: return 'Document ID';
  }
}

// Helper function to get placeholder text based on import type and field
function getPlaceholderText(type: string, field: 'token' | 'id'): string {
  if (field === 'token') {
    switch (type) {
      case 'notion': return 'Enter Notion integration token';
      case 'onenote': return 'Enter Microsoft Graph API token';
      case 'evernote': return 'Enter Evernote Developer Token';
      case 'googledocs': return 'Enter Google API token';
      default: return 'Enter API token';
    }
  } else { // id field
    switch (type) {
      case 'notion': return 'e.g., 2d7345ab-cdef-4567-8901-23456789abcd';
      case 'onenote': return 'e.g., {section-id}!{page-id}';
      case 'evernote': return 'e.g., 12345678-1234-1234-1234-123456789abc';
      case 'googledocs': return 'e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
      default: return 'Enter document ID';
    }
  }
}

// Helper function to get API-specific instructions
function getApiInstructions(type: string): string {
  switch (type) {
    case 'notion':
      return 'Get your integration token from the Notion Integrations page and make sure to share the page with your integration.';
    case 'onenote':
      return 'Use a Microsoft Graph API access token with Notes.Read permissions.';
    case 'evernote':
      return 'Generate a developer token from your Evernote account settings.';
    case 'googledocs':
      return 'Use a Google API token with access to Google Drive and Docs APIs.';
    default:
      return '';
  }
}
