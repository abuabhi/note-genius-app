
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ManualApiImportFormProps {
  importType: string;
  apiKey: string;
  setApiKey: (key: string) => void;
  pageId: string;
  setPageId: (id: string) => void;
  isProcessing: boolean;
  onImport: () => void;
}

export const ManualApiImportForm = ({
  importType,
  apiKey,
  setApiKey,
  pageId,
  setPageId,
  isProcessing,
  onImport
}: ManualApiImportFormProps) => {
  return (
    <div className="space-y-4">
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
        onClick={onImport} 
        disabled={isProcessing || !apiKey || !pageId}
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
  );
};

// Helper functions
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

function getLabelText(type: string): string {
  switch (type) {
    case 'notion': return 'Notion Page ID';
    case 'onenote': return 'OneNote Page ID';
    case 'evernote': return 'Note GUID';
    case 'googledocs': return 'Document ID';
    default: return 'Document ID';
  }
}

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
