
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
import { useUserSubjects } from "@/hooks/useUserSubjects";

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
  const { createFlashcardSet, createFlashcard, fetchFlashcardSets } = useFlashcards();
  const { subjects } = useUserSubjects();

  // Extract subject from the primary note
  const primaryNote = notes[0];
  const noteSubject = primaryNote?.subject_id 
    ? subjects.find(s => s.id === primaryNote.subject_id)?.name || "General"
    : "General";

  const handleCreateFlashcards = async (flashcards: Array<{
    front: string;
    back: string;
    type: FlashcardType;
  }>) => {
    try {
      setIsConverting(true);
      console.log("Starting flashcard creation process...");
      
      // Create the flashcard set first with the proper subject
      const newSet = await createFlashcardSet({
        name: setName,
        description: setDescription,
        subject: noteSubject // Use the extracted subject from the note
      });

      if (!newSet) {
        throw new Error("Failed to create flashcard set");
      }

      console.log("Created flashcard set with subject:", noteSubject, newSet);

      // Create individual flashcards and add them to the set
      let successCount = 0;
      for (const flashcard of flashcards) {
        try {
          console.log("Creating flashcard:", flashcard);
          await createFlashcard({
            front_content: flashcard.front,
            back_content: flashcard.back,
            set_id: newSet.id
          });
          successCount++;
        } catch (error) {
          console.error("Failed to create flashcard:", flashcard, error);
          // Continue with other flashcards even if one fails
        }
      }

      if (successCount > 0) {
        // Refresh the flashcard sets to get updated counts
        await fetchFlashcardSets();
        
        toast.success(`Created ${successCount} flashcards successfully!`);
        
        // Update the set with the correct count and pass it to onSuccess
        const updatedSet = { ...newSet, card_count: successCount };
        onSuccess(updatedSet);
      } else {
        throw new Error("No flashcards were created successfully");
      }
      
    } catch (error) {
      console.error("Error creating flashcards:", error);
      toast.error("Failed to convert notes to flashcards. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

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
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm font-medium text-blue-700">Subject: {noteSubject}</p>
            <p className="text-xs text-blue-600">This will be automatically assigned based on your note's subject</p>
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
