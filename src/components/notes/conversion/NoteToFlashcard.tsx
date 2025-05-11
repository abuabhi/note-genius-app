import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, ArrowRight } from "lucide-react";
import { Note } from "@/types/note";
import { CreateFlashcardPayload } from "@/types/flashcard";

interface NoteToFlashcardProps {
  note: Note;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const NoteToFlashcard = ({ note, onSuccess, onCancel }: NoteToFlashcardProps) => {
  const [frontContent, setFrontContent] = useState(note.title || "");
  const [backContent, setBackContent] = useState(note.content || note.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(3);
  const [selectedSetId, setSelectedSetId] = useState<string | undefined>(undefined);

  const { createFlashcard } = useFlashcards();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!frontContent.trim() || !backContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please fill in both sides of the flashcard.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const cardData: CreateFlashcardPayload = {
        front_content: frontContent.trim(),
        back_content: backContent.trim(),
      };

      const result = await createFlashcard(cardData, selectedSetId);
      
      if (result) {
        toast({
          title: "Conversion successful",
          description: "Note has been converted to flashcard.",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error converting note to flashcard:", error);
      toast({
        title: "Conversion failed",
        description: "Failed to convert note to flashcard. Please try again.",
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
          <FileText className="h-5 w-5" />
          <ArrowRight className="h-4 w-4" />
          Convert Note to Flashcard
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="front" className="block text-sm font-medium mb-1">
              Front (Question)
            </label>
            <Textarea
              id="front"
              value={frontContent}
              onChange={(e) => setFrontContent(e.target.value)}
              className="min-h-[100px]"
              placeholder="Enter question or concept"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="back" className="block text-sm font-medium mb-1">
              Back (Answer)
            </label>
            <Textarea
              id="back"
              value={backContent}
              onChange={(e) => setBackContent(e.target.value)}
              className="min-h-[100px]"
              placeholder="Enter answer or explanation"
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Convert to Flashcard"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
