
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CreateFlashcardPayload } from "@/types/flashcard";

interface TextSelectionToFlashcardProps {
  selectedText: string;
  onClose: () => void;
}

export const TextSelectionToFlashcard = ({ selectedText, onClose }: TextSelectionToFlashcardProps) => {
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState(selectedText);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const result = await createFlashcard(cardData);
      
      if (result) {
        toast({
          title: "Flashcard created",
          description: "Selected text has been converted to a flashcard.",
        });
        
        onClose();
      }
    } catch (error) {
      console.error("Error creating flashcard from selection:", error);
      toast({
        title: "Creation failed",
        description: "Failed to create flashcard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Flashcard from Selection</CardTitle>
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
              placeholder="Enter a question based on the selected text"
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
              placeholder="Your selected text will appear here"
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Flashcard"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
