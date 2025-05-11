
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportTabProps {
  isPremium: boolean;
}

export const ImportTab = ({ isPremium }: ImportTabProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Importing flashcards is available for premium users only.",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    // Implement actual import functionality here
    toast({
      title: "Import started",
      description: `Importing ${file.name}...`,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="file" className="block text-sm font-medium mb-1">
          Select File to Import
        </label>
        <input
          type="file"
          id="file"
          accept=".json,.csv"
          onChange={handleFileChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Supported formats: JSON, CSV
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleImport}
          disabled={!isPremium || !file}
        >
          <FileUp className="mr-2 h-4 w-4" />
          Import File
        </Button>
      </div>
      
      {!isPremium && (
        <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
          Importing flashcards is a premium feature. Upgrade your account to access this feature.
        </div>
      )}
    </div>
  );
};
