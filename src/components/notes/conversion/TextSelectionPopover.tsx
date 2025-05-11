
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFlashcardState } from "@/contexts/flashcards/useFlashcardState";
import { useFlashcardOperations } from "@/contexts/flashcards";

interface TextSelectionPopoverProps {
  selectedText: string;
  flashcardSetId: string | null;
  onCreateFlashcard: (frontText: string, backText: string) => Promise<void>;
  onCancel: () => void;
}

export const TextSelectionPopover = ({ 
  selectedText, 
  flashcardSetId, 
  onCreateFlashcard, 
  onCancel 
}: TextSelectionPopoverProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleCreateFlashcard = async () => {
    try {
      // Call the parent component's handler
      await onCreateFlashcard("<p>Question</p>", selectedText);
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create flashcard");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onCancel();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span className="hidden">Trigger</span>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Create Flashcard</h3>
            <p className="text-sm text-gray-500">
              Create a flashcard from your selected text
            </p>
          </div>
          
          <div className="bg-gray-50 border rounded-md p-2 text-sm max-h-24 overflow-auto">
            {selectedText}
          </div>
          
          <div className="flex justify-between space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="w-full"
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleCreateFlashcard}
              className="w-full"
              disabled={!flashcardSetId}
            >
              Create Flashcard
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
