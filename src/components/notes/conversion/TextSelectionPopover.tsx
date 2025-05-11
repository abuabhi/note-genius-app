
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TextSelectionToFlashcard } from "./TextSelectionToFlashcard";
import { useFlashcardState } from "@/contexts/flashcards";
import { useFlashcardsOperations } from "@/contexts/flashcards";

interface TextSelectionPopoverProps {
  selectedText: string;
  onClose: () => void;
}

export const TextSelectionPopover = ({ selectedText, onClose }: TextSelectionPopoverProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const flashcardState = useFlashcardState();
  const { addFlashcard } = useFlashcardsOperations(flashcardState);

  const handleCreateFlashcard = async () => {
    try {
      // Implementation for direct flashcard creation
      await addFlashcard({
        front_content: "<p>Question</p>",
        back_content: selectedText,
        set_id: "default-set-id", // This would need to be dynamically set
      });
      
      toast({
        title: "Success",
        description: "Flashcard created from selection",
      });
      
      setIsOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create flashcard",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
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
            >
              Create Flashcard
            </Button>
          </div>
          
          {/* Pass the necessary props to TextSelectionToFlashcard component */}
          {/* <TextSelectionToFlashcard 
            selectedText={selectedText}
            onClose={onClose}
          /> */}
        </div>
      </PopoverContent>
    </Popover>
  );
};
