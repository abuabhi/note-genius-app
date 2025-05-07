import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Note } from "@/types/note";
import { CreateFlashcardSetPayload } from "@/types/flashcard";
import { ArrowsUpFromLine, Loader2 } from "lucide-react";
import { FlashcardSet } from "@/types/flashcard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { UserTier } from "@/hooks/useRequireAuth";

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
          <div className="space-y-2">
            <Label htmlFor="setName">Flashcard Set Name</Label>
            <Input
              id="setName"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="Enter a name for your flashcard set"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="setDescription">Description (optional)</Label>
            <Input
              id="setDescription"
              value={setDescription}
              onChange={(e) => setSetDescription(e.target.value)}
              placeholder="Enter a description"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Notes to Convert</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={isSubmitting}
              >
                {selectedNotes.length === notes.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`note-${note.id}`}
                      checked={selectedNotes.includes(note.id)}
                      onCheckedChange={() => handleToggleNote(note.id)}
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor={`note-${note.id}`}
                      className="text-sm font-normal leading-none cursor-pointer"
                    >
                      <div className="font-medium">{note.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {note.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {!isPremium && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Premium Feature</p>
              <p>Upgrade to Professor or Dean tier for AI-assisted content extraction and improved flashcard generation.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || selectedNotes.length === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              `Convert ${selectedNotes.length} ${selectedNotes.length === 1 ? "Note" : "Notes"}`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
