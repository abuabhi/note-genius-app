
import { useState, Dispatch, SetStateAction } from "react";
import { useFlashcardState } from "@/contexts/flashcards/useFlashcardState";
import { useFlashcardOperations } from "@/contexts/flashcards/useFlashcardOperations";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface AIFlashcardGeneratorProps {
  noteContent: string;
  noteTitle: string;
  flashcardSetId: string | null;
  onFlashcardCreated?: () => void;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  subjectName: string;
}

export const AIFlashcardGenerator = ({
  noteContent,
  noteTitle,
  flashcardSetId,
  onFlashcardCreated,
  isGenerating,
  setIsGenerating,
  subjectName
}: AIFlashcardGeneratorProps) => {
  const flashcardState = useFlashcardState();
  const { addFlashcard } = useFlashcardOperations(flashcardState);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleGenerateFlashcards = async () => {
    if (!flashcardSetId) {
      toast.error("Please select a flashcard set first");
      return;
    }
    
    if (!noteContent || noteContent.trim() === "") {
      toast.error("Note content is empty");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Here we would normally call an AI service to generate flashcards
      // For now, we'll simulate it by creating a single flashcard
      await new Promise(resolve => setTimeout(resolve, 1500)); // simulate API call
      
      await addFlashcard({
        front_content: `<p><strong>AI Generated from: ${noteTitle}</strong></p>`,
        back_content: noteContent.substring(0, 100) + "...",
        set_id: flashcardSetId,
        subject: subjectName,
      });
      
      setGeneratedCount(1);
      toast.success("AI generated 1 flashcard");
      
      if (onFlashcardCreated) {
        onFlashcardCreated();
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border border-mint-100 bg-mint-50 rounded-md p-4">
      <h3 className="text-md font-medium text-mint-800 mb-2">AI Flashcard Generation</h3>
      <p className="text-sm text-gray-600 mb-3">
        Let AI analyze your note and create flashcards automatically.
      </p>
      
      <Button
        onClick={handleGenerateFlashcards}
        disabled={isGenerating || !flashcardSetId}
        className="flex items-center gap-2 bg-mint-600 hover:bg-mint-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>Generate Flashcards with AI</>
        )}
      </Button>
      
      {generatedCount > 0 && (
        <p className="text-sm text-mint-700 mt-2">
          Successfully generated {generatedCount} flashcards!
        </p>
      )}
    </div>
  );
};
