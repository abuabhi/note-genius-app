
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { FlashcardSet } from "@/types/flashcard";
import { FileDown, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isPremiumTier } from "@/utils/premiumFeatures";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const ExportImportFlashcards = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const { userProfile } = useRequireAuth();
  
  const isPremium = isPremiumTier(userProfile?.user_tier);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => {
          setActiveTab("export");
          setIsOpen(true);
        }}
      >
        <FileDown className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => {
          setActiveTab("import");
          setIsOpen(true);
        }}
      >
        <FileUp className="h-4 w-4" />
        <span className="hidden sm:inline">Import</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Export/Import Flashcards</DialogTitle>
            <DialogDescription>
              Export your flashcards to share with others or import flashcards from a file.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "export" | "import")}
            className="mt-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="export" className="py-4">
              <ExportFlashcards isPremium={isPremium} />
            </TabsContent>
            
            <TabsContent value="import" className="py-4">
              <ImportFlashcards isPremium={isPremium} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ExportFlashcards = ({ isPremium }: { isPremium: boolean }) => {
  const { flashcardSets } = useFlashcards();
  const { toast } = useToast();
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const handleExport = () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Exporting flashcards is available for premium users only.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSetId) {
      toast({
        title: "No set selected",
        description: "Please select a flashcard set to export.",
        variant: "destructive",
      });
      return;
    }

    const selectedSet = flashcardSets.find((set) => set.id === selectedSetId);
    if (!selectedSet) return;

    // Implement actual export functionality here
    toast({
      title: "Export started",
      description: `Exporting ${selectedSet.name}...`,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="set" className="block text-sm font-medium mb-1">
          Select Flashcard Set
        </label>
        <select
          id="set"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          onChange={(e) => setSelectedSetId(e.target.value)}
          value={selectedSetId || ""}
        >
          <option value="">Select a set...</option>
          {flashcardSets.map((set) => (
            <option key={set.id} value={set.id}>
              {set.name} ({set.card_count || 0} cards)
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          disabled={!isPremium || !selectedSetId}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export Set
        </Button>
      </div>
      
      {!isPremium && (
        <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
          Exporting flashcards is a premium feature. Upgrade your account to access this feature.
        </div>
      )}
    </div>
  );
};

const ImportFlashcards = ({ isPremium }: { isPremium: boolean }) => {
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
