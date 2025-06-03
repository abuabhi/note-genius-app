
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Note } from "@/types/note";
import { FlashcardSet } from "@/types/flashcard";
import { SmartContentProcessor } from "./SmartContentProcessor";
import { FlashcardType } from "./FlashcardTypeSelector";
import { toast } from "sonner";

interface BulkNoteConversionProps {
  notes: Note[];
  onSuccess: (flashcardSet: FlashcardSet) => void;
  onCancel: () => void;
}

export const BulkNoteConversion = ({
  notes,
  onSuccess,
  onCancel
}: BulkNoteConversionProps) => {
  const [setName, setSetName] = useState("New Flashcard Set");
  const [setDescription, setSetDescription] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const { createFlashcardSet, createFlashcard } = useFlashcards();

  const handleCreateFlashcards = async (flashcards: Array<{
    front: string;
    back: string;
    type: FlashcardType;
  }>) => {
    try {
      setIsConverting(true);
      
      // Create the flashcard set first
      const newSet = await createFlashcardSet({
        name: setName,
        description: setDescription,
        subject: notes[0]?.title || "General",
        is_public: false
      });

      if (!newSet) {
        throw new Error("Failed to create flashcard set");
      }

      // Create individual flashcards and add them to the set
      for (const flashcard of flashcards) {
        await createFlashcard({
          front_content: flashcard.front,
          back_content: flashcard.back,
          set_id: newSet.id
        });
      }

      toast.success(`Created ${flashcards.length} flashcards successfully!`);
      onSuccess(newSet);
      
    } catch (error) {
      console.error("Error creating flashcards:", error);
      toast.error("Failed to convert notes to flashcards. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  // For now, we'll work with the first note
  const primaryNote = notes[0];

  if (!primaryNote) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No notes selected for conversion.</p>
          <div className="flex justify-center mt-4">
            <Button onClick={onCancel}>Back to Notes</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Flashcard Set Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="setName">Set Name</Label>
            <Input
              id="setName"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="Enter flashcard set name"
            />
          </div>
          <div>
            <Label htmlFor="setDescription">Description (optional)</Label>
            <Textarea
              id="setDescription"
              value={setDescription}
              onChange={(e) => setSetDescription(e.target.value)}
              placeholder="Enter a description for this flashcard set"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <SmartContentProcessor
        noteContent={primaryNote.content || primaryNote.description}
        noteTitle={primaryNote.title}
        onCreateFlashcards={handleCreateFlashcards}
      />

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
