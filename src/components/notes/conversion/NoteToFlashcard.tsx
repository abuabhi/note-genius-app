
import { useState } from "react";
import { Note } from "@/types/note";
import { Button } from "@/components/ui/button";
import { TextSelectionToFlashcard } from "./TextSelectionToFlashcard";
import { toast } from "sonner";
import { AIFlashcardGenerator } from "./AIFlashcardGenerator";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { useFlashcardState } from "@/contexts/flashcards/useFlashcardState";
import { useFlashcardOperations } from "@/contexts/flashcards/useFlashcardOperations";

interface NoteToFlashcardProps {
  note: Note;
  flashcardSetId: string | null;
  onFlashcardCreated?: () => void;
}

export const NoteToFlashcard = ({ note, flashcardSetId, onFlashcardCreated }: NoteToFlashcardProps) => {
  const flashcardState = useFlashcardState();
  const { addFlashcard } = useFlashcardOperations(flashcardState);
  const [isGenerating, setIsGenerating] = useState(false);
  const { subjects } = useUserSubjects();
  const { aiFlashcardGenerationEnabled } = usePremiumFeatures();
  
  // Find the subject name using proper lookup - prioritize subject_id over subject
  const getSubjectName = () => {
    if (note.subject_id) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      return foundSubject?.name || note.subject || "General";
    }
    return note.subject || "General";
  };

  const subjectName = getSubjectName();
  
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
        <div className="bg-blue-50 p-3 rounded-md mb-3">
          <p className="text-sm font-medium text-blue-700">Note Subject: {subjectName}</p>
          <p className="text-xs text-blue-600">Flashcards will inherit this subject</p>
        </div>
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
