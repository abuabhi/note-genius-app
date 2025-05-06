
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Apple, Book, File, Loader2 } from "lucide-react";
import { processSelectedDocument } from "./importUtils";

interface ApiImportProps {
  onImport: (type: string, content: string) => void;
}

export const ApiImport = ({ onImport }: ApiImportProps) => {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [pageId, setPageId] = useState("");
  const [importType, setImportType] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key or access token.",
        variant: "destructive",
      });
      return;
    }
    
    if (!pageId && importType !== "applenotes") {
      toast({
        title: "Page/Document ID Required",
        description: "Please enter a valid page or document ID.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Prepare API parameters based on the import type
      const apiParams: Record<string, any> = {
        token: apiKey,
      };
      
      // Add specific parameters based on import type
      switch (importType) {
        case "notion":
          apiParams.pageId = pageId;
          break;
        case "onenote":
          apiParams.pageId = pageId;
          break;
        case "applenotes":
          apiParams.noteId = pageId || "recent"; // Use "recent" as fallback
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer hover:border-mint-500 ${importType === 'applenotes' ? 'border-mint-500 bg-mint-50' : ''}`}
          onClick={() => setImportType('applenotes')}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <Apple className="h-8 w-8 text-mint-600 mb-2" />
            <p className="font-medium">Apple Notes</p>
          </CardContent>
        </Card>
        
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
      </div>
      
      {importType && (
        <div className="space-y-4 mt-4 p-4 border rounded-md">
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
          
          {importType !== 'applenotes' && (
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
          )}
          
          <Button 
            onClick={handleImport} 
            disabled={isProcessing || !apiKey || (importType !== 'applenotes' && !pageId)}
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
    case 'applenotes': return 'Apple Notes';
    case 'notion': return 'Notion';
    case 'onenote': return 'OneNote';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

// Helper function to get the correct label based on import type
function getLabelText(type: string): string {
  switch (type) {
    case 'notion': return 'Notion Page ID';
    case 'onenote': return 'OneNote Page ID';
    default: return 'Document ID';
  }
}

// Helper function to get placeholder text based on import type and field
function getPlaceholderText(type: string, field: 'token' | 'id'): string {
  if (field === 'token') {
    switch (type) {
      case 'applenotes': return 'Enter Apple Notes API token';
      case 'notion': return 'Enter Notion integration token';
      case 'onenote': return 'Enter Microsoft Graph API token';
      default: return 'Enter API token';
    }
  } else { // id field
    switch (type) {
      case 'notion': return 'e.g., 2d7345ab-cdef-4567-8901-23456789abcd';
      case 'onenote': return 'e.g., {section-id}!{page-id}';
      default: return 'Enter document ID';
    }
  }
}

// Helper function to get API-specific instructions
function getApiInstructions(type: string): string {
  switch (type) {
    case 'applenotes':
      return 'Note: Apple Notes does not have an official public API. This is for demonstration purposes.';
    case 'notion':
      return 'Get your integration token from the Notion Integrations page and make sure to share the page with your integration.';
    case 'onenote':
      return 'Use a Microsoft Graph API access token with Notes.Read permissions.';
    default:
      return '';
  }
}
