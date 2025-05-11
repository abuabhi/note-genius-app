
import { useState } from "react";
import { useFlashcardState } from "@/contexts/flashcards/useFlashcardState";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFlashcardsOperations } from "@/contexts/flashcards/useFlashcardOperations";

export interface TextSelectionToFlashcardProps {
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
  const [selectedText, setSelectedText] = useState<string>("");
  const flashcardState = useFlashcardState();
  const { addFlashcard } = useFlashcardsOperations(flashcardState);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString());
    }
  };

  const handleCreateFromSelection = async () => {
    if (!flashcardSetId) {
      toast.error("Please select a flashcard set first");
      return;
    }
    
    if (!selectedText || selectedText.trim() === "") {
      toast.error("No text selected");
      return;
    }
    
    try {
      await addFlashcard({
        front_content: `<p><strong>Selection from: ${noteTitle}</strong></p>`,
        back_content: selectedText,
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
      <h3 className="text-md font-medium mb-2">Create from Selection</h3>
      <p className="text-sm text-gray-600 mb-2">
        Select text from your note and create a flashcard from it.
      </p>
      
      <div className="bg-gray-50 border rounded-md p-3 mb-3" onClick={handleTextSelection}>
        <div 
          className="prose max-w-none text-sm overflow-auto max-h-40" 
          dangerouslySetInnerHTML={{ __html: noteContent }}
        />
      </div>
      
      {selectedText && (
        <div className="mb-3">
          <h4 className="text-sm font-medium">Selected Text:</h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 text-sm">
            {selectedText}
          </div>
        </div>
      )}
      
      <Button
        size="sm"
        disabled={!selectedText || !flashcardSetId}
        onClick={handleCreateFromSelection}
      >
        Create Card from Selection
      </Button>
    </div>
  );
};
