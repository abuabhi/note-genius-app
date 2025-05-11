
import { useState } from "react";
import { useFlashcardState } from "@/contexts/flashcards/useFlashcardState";
import { useFlashcardOperations } from "@/contexts/flashcards/useFlashcardOperations";
import { Button } from "@/components/ui/button";
import { TextSelectionPopover } from "./TextSelectionPopover";
import { toast } from "sonner";

interface TextSelectionToFlashcardProps {
  noteContent: string;
  noteTitle: string;
  flashcardSetId: string | null;
  onFlashcardCreated?: () => void;
  subjectName: string;
}

export const TextSelectionToFlashcard = ({
  noteContent,
  noteTitle,
  flashcardSetId,
  onFlashcardCreated,
  subjectName
}: TextSelectionToFlashcardProps) => {
  const flashcardState = useFlashcardState();
  const { addFlashcard } = useFlashcardOperations(flashcardState);
  const [selectedText, setSelectedText] = useState("");

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleCreateFlashcard = async (frontText: string, backText: string) => {
    if (!flashcardSetId) {
      toast.error("Please select a flashcard set first");
      return;
    }

    try {
      await addFlashcard({
        front_content: frontText,
        back_content: backText,
        set_id: flashcardSetId,
        subject: subjectName,
      });
      
      toast.success("Flashcard created from selection");
      setSelectedText("");
      
      if (onFlashcardCreated) {
        onFlashcardCreated();
      }
    } catch (error) {
      console.error("Error creating flashcard from selection:", error);
      toast.error("Failed to create flashcard");
    }
  };
  
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Create from Text Selection</h3>
      <p className="text-sm text-gray-600 mb-2">
        Select text in the content below to create flashcards.
      </p>
      
      <div 
        className="border rounded-md p-3 bg-white min-h-[100px] max-h-[200px] overflow-auto text-sm"
        onMouseUp={handleMouseUp}
      >
        {noteContent || (
          <span className="text-gray-400 italic">No content to display.</span>
        )}
      </div>
      
      {selectedText && (
        <TextSelectionPopover 
          selectedText={selectedText} 
          flashcardSetId={flashcardSetId} 
          onCreateFlashcard={handleCreateFlashcard}
          onCancel={() => setSelectedText("")}
        />
      )}
    </div>
  );
};
