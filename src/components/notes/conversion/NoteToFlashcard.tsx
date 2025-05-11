
import { useState } from "react";
import { Note } from "@/types/note";
import { Button } from "@/components/ui/button";
import { TextSelectionToFlashcard } from "./TextSelectionToFlashcard";
import { toast } from "sonner";
import { AIFlashcardGenerator } from "./AIFlashcardGenerator";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { useFlashcardsOperations } from "@/contexts/flashcards/useFlashcards";
import { useFlashcardState } from "@/contexts/flashcards/useFlashcardState";

interface NoteToFlashcardProps {
  note: Note;
  flashcardSetId: string | null;
  onFlashcardCreated?: () => void;
}

export const NoteToFlashcard = ({ note, flashcardSetId, onFlashcardCreated }: NoteToFlashcardProps) => {
  const flashcardState = useFlashcardState();
  const { addFlashcard } = useFlashcardsOperations(flashcardState);
  const [isGenerating, setIsGenerating] = useState(false);
  const { subjects } = useUserSubjects();
  const { aiFlashcardGenerationEnabled } = usePremiumFeatures();
  
  // Find the subject name if we have a subject_id
  const subjectName = note.subject_id 
    ? subjects.find(s => s.id === note.subject_id)?.name || "Unknown Subject"
    : note.category || "General";
  
  // Create flashcard from the entire note content
  const handleCreateFromFullNote = async () => {
    if (!flashcardSetId) {
      toast.error("Please select a flashcard set first");
      return;
    }
    
    if (!note.content || note.content.trim() === "") {
      toast.error("Note content is empty");
      return;
    }
    
    try {
      await addFlashcard({
        front_content: `<p><strong>${note.title}</strong></p>`,
        back_content: note.content || "",
        set_id: flashcardSetId,
        subject: subjectName,
      });
      
      toast.success("Flashcard created from note");
      if (onFlashcardCreated) {
        onFlashcardCreated();
      }
    } catch (error) {
      console.error("Error creating flashcard from note:", error);
      toast.error("Failed to create flashcard");
    }
  };
  
  if (!note) return null;
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Convert Note to Flashcard</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleCreateFromFullNote} 
            disabled={!flashcardSetId}
            size="sm"
          >
            Create Card from Full Note
          </Button>
        </div>
      </div>
      
      {/* Selection based conversion */}
      <TextSelectionToFlashcard 
        noteContent={note.content || ''}
        noteTitle={note.title}
        flashcardSetId={flashcardSetId}
        onFlashcardCreated={onFlashcardCreated}
        subjectName={subjectName}
      />
      
      {/* AI-Based Generation */}
      {aiFlashcardGenerationEnabled ? (
        <AIFlashcardGenerator
          noteContent={note.content || ''}
          noteTitle={note.title}
          flashcardSetId={flashcardSetId}
          onFlashcardCreated={onFlashcardCreated}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          subjectName={subjectName}
        />
      ) : (
        <div className="border border-yellow-200 bg-yellow-50 rounded-md p-4">
          <h3 className="font-medium text-amber-700">AI Flashcard Generation</h3>
          <p className="text-sm text-amber-600 mt-1">
            Automatically generate flashcards from your notes using AI. Upgrade to premium to access this feature.
          </p>
        </div>
      )}
    </div>
  );
};
