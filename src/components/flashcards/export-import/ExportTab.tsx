
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";

interface ExportTabProps {
  isPremium: boolean;
}

export const ExportTab = ({ isPremium }: ExportTabProps) => {
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
