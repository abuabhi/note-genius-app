import { Dispatch, SetStateAction, useState } from "react";
import { useFlashcardState } from "@/contexts/flashcards/useFlashcardState";
import { useFlashcardOperations } from "@/contexts/flashcards/useFlashcardOperations";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateFlashcardsFromNotes } from "@/services/aiService";

export interface AIFlashcardGeneratorProps {
  noteContent: string;
  /** Optional AI-enriched version of the note. Preferred over `noteContent` when present. */
  enrichedContent?: string | null;
  noteTitle: string;
  flashcardSetId: string | null;
  onFlashcardCreated?: () => void;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  subjectName: string;
}

export const AIFlashcardGenerator = ({
  noteContent,
  enrichedContent,
  noteTitle,
  flashcardSetId,
  onFlashcardCreated,
  isGenerating,
  setIsGenerating,
  subjectName,
}: AIFlashcardGeneratorProps) => {
  const sourceContent =
    enrichedContent && enrichedContent.trim().length > 0 ? enrichedContent : noteContent;
  const usingEnriched = !!(enrichedContent && enrichedContent.trim().length > 0);
  const flashcardState = useFlashcardState();
  const { addFlashcard } = useFlashcardOperations(flashcardState);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleGenerateFlashcards = async () => {
    if (!flashcardSetId) {
      toast.error("Please select a flashcard set first");
      return;
    }
    if (!sourceContent || sourceContent.trim().length < 20) {
      toast.error("Note content is too short for AI generation");
      return;
    }

    setIsGenerating(true);
    try {
      const cards = await generateFlashcardsFromNotes(sourceContent, 5, subjectName);
      if (!cards.length) {
        toast.error("AI could not generate any flashcards from this note");
        return;
      }

      let inserted = 0;
      for (const c of cards) {
        try {
          await addFlashcard({
            front_content: c.front,
            back_content: c.back,
            set_id: flashcardSetId,
            subject: subjectName,
          });
          inserted++;
        } catch (err) {
          console.error("Failed to insert flashcard:", err);
        }
      }

      setGeneratedCount(inserted);
      toast.success(`AI generated ${inserted} flashcard${inserted === 1 ? "" : "s"} from "${noteTitle}"`);
      onFlashcardCreated?.();
    } catch (error) {
      console.error("Error generating flashcards:", error);
      // aiService already toasts the specific error
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border border-mint-100 bg-mint-50 rounded-md p-4">
      <h3 className="text-md font-medium text-mint-800 mb-2">AI Flashcard Generation</h3>
      <p className="text-sm text-gray-600 mb-1">
        Let AI analyze your note and create flashcards automatically.
      </p>
      <p className="text-xs text-mint-700 mb-3">
        Source: {usingEnriched ? 'Enriched note (higher quality)' : 'Original note'}
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
          <>
            <Sparkles className="h-4 w-4" />
            Generate Flashcards with AI
          </>
        )}
      </Button>

      {generatedCount > 0 && (
        <p className="text-sm text-mint-700 mt-2">
          Successfully generated {generatedCount} flashcard{generatedCount === 1 ? "" : "s"}!
        </p>
      )}
    </div>
  );
};
