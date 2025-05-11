
// Create a new file to handle individual note to flashcard conversion
import { useState } from "react";
import { Note } from "@/types/note";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Button } from "@/components/ui/button";
import { TextSelectionToFlashcard } from "./TextSelectionToFlashcard";
import { toast } from "sonner";
import { AIFlashcardGenerator } from "./AIFlashcardGenerator";
import { PremiumFeatureNotice } from "./PremiumFeatureNotice";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface NoteToFlashcardProps {
  note: Note;
  flashcardSetId: string | null;
  onFlashcardCreated?: () => void;
}

export const NoteToFlashcard = ({ note, flashcardSetId, onFlashcardCreated }: NoteToFlashcardProps) => {
  const { addFlashcard } = useFlashcards();
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
      onFlashcardCreated?.();
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
        note={note} 
        flashcardSetId={flashcardSetId}
        onFlashcardCreated={onFlashcardCreated}
        subjectName={subjectName}
      />
      
      {/* AI-Based Generation */}
      {aiFlashcardGenerationEnabled ? (
        <AIFlashcardGenerator
          note={note}
          flashcardSetId={flashcardSetId}
          onFlashcardCreated={onFlashcardCreated}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          subjectName={subjectName}
        />
      ) : (
        <PremiumFeatureNotice
          title="AI Flashcard Generation"
          description="Automatically generate flashcards from your notes using AI"
        />
      )}
    </div>
  );
};
