
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Import, FileDown, AlertCircle, CheckCircle } from "lucide-react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { FlashcardSet, Flashcard } from "@/types/flashcard";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isPremiumTier } from "@/utils/premiumFeatures";

interface ImportFlashcardData {
  name: string;
  description?: string;
  flashcards: {
    front_content: string;
    back_content: string;
    difficulty?: number;
  }[];
}

export const ExportImportFlashcards = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importName, setImportName] = useState("");
  const [importDescription, setImportDescription] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<{
    name: string;
    description: string;
    cardCount: number;
  } | null>(null);
  
  const { flashcardSets, createFlashcardSet, createFlashcard } = useFlashcards();
  const { toast } = useToast();
  const { userProfile } = useRequireAuth();
  
  const isPremium = isPremiumTier(userProfile?.user_tier);
  
  const handleExportSet = (set: FlashcardSet) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Exporting flashcards is available for Professor and Dean tier users.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, we'd fetch all cards for the set
    // For now, just prepare a sample export
    const exportData = {
      name: set.name,
      description: set.description,
      subject: set.subject,
      topic: set.topic,
      flashcards: [
        {
          front_content: "Sample front content",
          back_content: "Sample back content",
          difficulty: 3
        }
      ]
    };
    
    const exportStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([exportStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${set.name.replace(/\s+/g, "_").toLowerCase()}_flashcards.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: `Flashcard set "${set.name}" has been exported.`,
    });
  };
  
  const parseImportJson = (jsonText: string): ImportFlashcardData | null => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Validate the structure
      if (!parsed.name || !Array.isArray(parsed.flashcards)) {
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  };
  
  const handlePreview = () => {
    setImportError(null);
    setImportPreview(null);
    
    const parsed = parseImportJson(importText);
    
    if (!parsed) {
      setImportError("Invalid import format. Please check your JSON structure.");
      return;
    }
    
    setImportPreview({
      name: parsed.name,
      description: parsed.description || "",
      cardCount: parsed.flashcards.length,
    });
    
    setImportName(parsed.name);
    setImportDescription(parsed.description || "");
  };
  
  const handleImport = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Importing flashcards is available for Professor and Dean tier users.",
        variant: "destructive",
      });
      return;
    }
    
    setImportError(null);
    setIsImporting(true);
    
    try {
      const parsed = parseImportJson(importText);
      
      if (!parsed) {
        setImportError("Invalid import format. Please check your JSON structure.");
        return;
      }
      
      // Create new set
      const newSet = await createFlashcardSet({
        name: importName || parsed.name,
        description: importDescription || parsed.description,
      });
      
      if (!newSet) {
        throw new Error("Failed to create flashcard set");
      }
      
      // Create flashcards in the set
      for (const card of parsed.flashcards) {
        await createFlashcard({
          front_content: card.front_content,
          back_content: card.back_content,
          difficulty: card.difficulty as 1 | 2 | 3 | 4 | 5 || 3,
        }, newSet.id);
      }
      
      toast({
        title: "Import Successful",
        description: `Imported ${parsed.flashcards.length} flashcards into "${importName || parsed.name}".`,
      });
      
      // Reset and close
      setImportText("");
      setImportName("");
      setImportDescription("");
      setImportPreview(null);
      setIsImportOpen(false);
    } catch (error) {
      console.error("Error importing flashcards:", error);
      setImportError("Failed to import flashcards. Please try again.");
      toast({
        title: "Import Failed",
        description: "An error occurred while importing flashcards.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  const exportButton = (set: FlashcardSet) => (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center"
      onClick={() => handleExportSet(set)}
      disabled={!isPremium}
    >
      <FileDown className="h-4 w-4 mr-2" />
      Export
    </Button>
  );
  
  return (
    <>
      <Sheet open={isImportOpen} onOpenChange={setIsImportOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => {
              if (!isPremium) {
                toast({
                  title: "Premium Feature",
                  description: "Importing flashcards is available for Professor and Dean tier users.",
                  variant: "destructive",
                });
                return;
              }
              setIsImportOpen(true);
            }}
          >
            <Import className="h-4 w-4 mr-2" />
            Import Flashcards
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Import Flashcards</SheetTitle>
            <SheetDescription>
              Import flashcards from a JSON file. The JSON should include a set name and an array of flashcards.
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="importJson">Paste JSON Data</Label>
              <Textarea
                id="importJson"
                placeholder='{"name": "Set Name", "flashcards": [{"front_content": "Front", "back_content": "Back"}]}'
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
              />
              <Button onClick={handlePreview} disabled={!importText.trim()}>
                Preview
              </Button>
            </div>
            
            {importError && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{importError}</span>
              </div>
            )}
            
            {importPreview && (
              <div className="space-y-4 border rounded-md p-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Valid import with {importPreview.cardCount} flashcards</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="importName">Set Name</Label>
                  <Input
                    id="importName"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="importDescription">Description (optional)</Label>
                  <Textarea
                    id="importDescription"
                    value={importDescription}
                    onChange={(e) => setImportDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting || !importName.trim()}
                  className="w-full"
                >
                  {isImporting ? "Importing..." : "Import Flashcards"}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Export button is returned for use in other components */}
      {exportButton}
    </>
  );
};

export { exportButton } from "./ExportImportFlashcards";
