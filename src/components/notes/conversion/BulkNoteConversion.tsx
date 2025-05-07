
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Note } from "@/types/note";
import { CreateFlashcardSetPayload } from "@/types/flashcard";
import { ArrowsUpFromLine } from "lucide-react";
import { FlashcardSet } from "@/types/flashcard";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { FlashcardSetForm } from "./FlashcardSetForm";
import { NoteSelectionList } from "./NoteSelectionList";
import { PremiumFeatureNotice } from "./PremiumFeatureNotice";
import { ConversionFormFooter } from "./ConversionFormFooter";

interface BulkNoteConversionProps {
  notes: Note[];
  onSuccess: (flashcardSet: FlashcardSet) => void;
  onCancel: () => void;
}

export const BulkNoteConversion = ({ notes, onSuccess, onCancel }: BulkNoteConversionProps) => {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [setName, setSetName] = useState("");
  const [setDescription, setSetDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useRequireAuth();
  const isPremium = profile?.user_tier === UserTier.PROFESSOR || profile?.user_tier === UserTier.DEAN;

  const { createFlashcardSet, createFlashcard } = useFlashcards();
  const { toast } = useToast();

  const handleToggleNote = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotes.length === notes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notes.map(note => note.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedNotes.length === 0) {
      toast({
        title: "No notes selected",
        description: "Please select at least one note to convert.",
        variant: "destructive",
      });
      return;
    }

    if (!setName.trim()) {
      toast({
        title: "Missing set name",
        description: "Please provide a name for your flashcard set.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create flashcard set first
      const setData: CreateFlashcardSetPayload = {
        name: setName.trim(),
        description: setDescription.trim() || "Converted from notes",
      };

      const flashcardSet = await createFlashcardSet(setData);
      
      if (flashcardSet) {
        // Create flashcards and add them to the set
        const selectedNotesData = notes.filter(note => selectedNotes.includes(note.id));
        
        for (const note of selectedNotesData) {
          await createFlashcard({
            front_content: note.title,
            back_content: note.content || note.description,
          }, flashcardSet.id);
        }
        
        toast({
          title: "Conversion successful",
          description: `Created flashcard set "${setName}" with ${selectedNotes.length} cards.`,
        });
        
        onSuccess(flashcardSet);
      }
    } catch (error) {
      console.error("Error in bulk conversion:", error);
      toast({
        title: "Conversion failed",
        description: "Failed to convert notes to flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowsUpFromLine className="h-5 w-5" />
          Bulk Convert Notes to Flashcards
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <FlashcardSetForm
            setName={setName}
            setDescription={setDescription}
            onSetNameChange={setSetName}
            onSetDescriptionChange={setSetDescription}
            disabled={isSubmitting}
          />
          
          <NoteSelectionList
            notes={notes}
            selectedNotes={selectedNotes}
            onToggleNote={handleToggleNote}
            onSelectAll={handleSelectAll}
            disabled={isSubmitting}
          />
          
          <PremiumFeatureNotice isPremium={isPremium} />
        </CardContent>
        <CardFooter>
          <ConversionFormFooter
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            selectedCount={selectedNotes.length}
          />
        </CardFooter>
      </form>
    </Card>
  );
};
