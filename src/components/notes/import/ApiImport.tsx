
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Apple, Book, File } from "lucide-react";

interface ApiImportProps {
  onImport: (type: string, content: string) => void;
}

export const ApiImport = ({ onImport }: ApiImportProps) => {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [importType, setImportType] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImport = () => {
    if (!importType) {
      toast({
        title: "Selection Required",
        description: "Please select an import type first.",
        variant: "destructive",
      });
      return;
    }
    
    // This is a mock implementation
    // In a real implementation, we would make API calls to the respective services
    
    let mockContent = "";
    
    switch (importType) {
      case "applenotes":
        mockContent = "This is a mock import from Apple Notes.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
        break;
      case "notion":
        mockContent = "This is a mock import from Notion.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
        break;
      case "onenote":
        mockContent = "This is a mock import from OneNote.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
        break;
      default:
        mockContent = "Imported content";
    }
    
    onImport(importType, mockContent);
    
    toast({
      title: "Import Successful",
      description: `Successfully imported from ${importType}.`,
    });
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
            <Label htmlFor="api-url">API URL or Integration Token</Label>
            <Input
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder={`Enter ${importType} API URL`}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="api-key">API Key (if required)</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
              className="mt-1"
            />
          </div>
          
          <Button onClick={handleImport}>
            Import from {importType.charAt(0).toUpperCase() + importType.slice(1)}
          </Button>
        </div>
      )}
    </div>
  );
};
