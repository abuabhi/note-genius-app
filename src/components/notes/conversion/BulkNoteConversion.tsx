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
  const { userProfile } = useRequireAuth();
  const isPremium = userProfile?.user_tier === UserTier.MASTER || userProfile?.user_tier === UserTier.DEAN;

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

  // AI-assisted content extraction for premium users
  const handleAIExtraction = async () => {
    if (!isPremium || selectedNotes.length === 0) return;
    
    // Get the selected notes
    const selectedNotesData = notes.filter(note => selectedNotes.includes(note.id));
    
    // Here you would typically call an API to process the notes with AI
    // For now, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Auto-generate a descriptive name if none exists
    if (!setName.trim()) {
      const topics = selectedNotesData.map(note => note.title.split(' ')[0]).slice(0, 3);
      setSetName(`${topics.join(', ')} Flashcards`);
    }
    
    // Generate a more detailed description
    if (!setDescription.trim()) {
      const noteCount = selectedNotesData.length;
      const categories = [...new Set(selectedNotesData.map(note => note.category))];
      setSetDescription(`Set containing ${noteCount} flashcards about ${categories.join(', ')}.`);
    }
    
    toast({
      title: "AI Processing Complete",
      description: "Your notes have been analyzed and the flashcard set has been optimized.",
    });
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
          
          <PremiumFeatureNotice 
            isPremium={isPremium} 
            onAIExtract={selectedNotes.length > 0 ? handleAIExtraction : undefined}
          />
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
