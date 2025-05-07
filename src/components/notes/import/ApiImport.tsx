
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { processSelectedDocument } from "./importUtils";
import { OneNoteConnection } from "./OneNoteConnection";
import { NotionConnection } from "./NotionConnection";
import { GoogleDocsConnection } from "./GoogleDocsConnection";
import { ImportServiceGrid } from "./services/ImportServiceGrid";
import { ManualApiImportForm } from "./services/ManualApiImportForm";

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
  const [notionToken, setNotionToken] = useState<string | null>(null);
  const [googleDocsToken, setGoogleDocsToken] = useState<string | null>(null);
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
    } else if (importType === "notion") {
      if (!notionToken) {
        toast({
          title: "Authentication Required",
          description: "Please connect to Notion first.",
          variant: "destructive",
        });
        return;
      }
      
      if (!pageId) {
        toast({
          title: "Page ID Required",
          description: "Please enter a Notion page ID.",
          variant: "destructive",
        });
        return;
      }
    } else if (importType === "googledocs") {
      if (!googleDocsToken) {
        toast({
          title: "Authentication Required",
          description: "Please connect to Google Docs first.",
          variant: "destructive",
        });
        return;
      }
      
      if (!pageId) {
        toast({
          title: "Document ID Required",
          description: "Please enter a Google Docs document ID.",
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
          apiParams.token = notionToken;
          apiParams.pageId = pageId;
          break;
        case "onenote":
          apiParams.token = oneNoteToken;
          apiParams.pageId = pageId;
          break;
        case "googledocs":
          apiParams.token = googleDocsToken;
          apiParams.documentId = pageId;
          break;
        case "evernote":
          apiParams.token = apiKey;
          apiParams.noteGuid = pageId;
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
      
      <ImportServiceGrid 
        selectedService={importType}
        onSelectService={setImportType}
      />
      
      {importType && (
        <div className="space-y-4 mt-4 p-4 border rounded-md">
          {importType === 'onenote' ? (
            <OneNoteConnection onConnected={token => setOneNoteToken(token)} />
          ) : importType === 'notion' ? (
            <NotionConnection onConnected={token => setNotionToken(token)} />
          ) : importType === 'googledocs' ? (
            <GoogleDocsConnection onConnected={token => setGoogleDocsToken(token)} />
          ) : (
            <ManualApiImportForm
              importType={importType}
              apiKey={apiKey}
              setApiKey={setApiKey}
              pageId={pageId}
              setPageId={setPageId}
              isProcessing={isProcessing}
              onImport={handleImport}
            />
          )}
        </div>
      )}
    </div>
  );
};
