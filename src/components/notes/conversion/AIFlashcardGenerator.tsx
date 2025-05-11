import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb } from "lucide-react";
import { useGemini } from "@/hooks/useGemini";

interface AIFlashcardGeneratorProps {
  noteContent: string;
  onClose: () => void;
}

export const AIFlashcardGenerator = ({ noteContent, onClose }: AIFlashcardGeneratorProps) => {
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState("");

  const { generateFlashcardContent } = useGemini();
  const { createFlashcard } = useFlashcards();
  const { toast } = useToast();

  useEffect(() => {
    const generateContent = async () => {
      setIsGenerating(true);
      try {
        const generatedContent = await generateFlashcardContent(noteContent);
        if (generatedContent) {
          setFrontContent(generatedContent.question);
          setBackContent(generatedContent.answer);
        } else {
          toast({
            title: "Generation failed",
            description: "Failed to generate flashcard content. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error generating flashcard content:", error);
        toast({
          title: "Generation error",
          description: "An error occurred while generating flashcard content.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    };

    generateContent();
  }, [noteContent, generateFlashcardContent, toast]);

  const handleCreateFlashcard = async () => {
    setIsSubmitting(true);

    try {
      // Create the flashcard with the generated content
      await createFlashcard(
        {
          front_content: frontContent,
          back_content: backContent,
          // Add any other required fields
          difficulty: 3 // Default to medium difficulty
        },
        selectedSetId // Pass the setId separately
      );

      toast({
        title: "Flashcard created",
        description: "Flashcard has been created from the generated content.",
      });
      onClose();
    } catch (error) {
      console.error("Error creating flashcard from AI:", error);
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
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Generate Flashcard with AI
        </CardTitle>
      </CardHeader>
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
            placeholder="AI generated question will appear here"
            disabled={isGenerating || isSubmitting}
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
            placeholder="AI generated answer will appear here"
            disabled={isGenerating || isSubmitting}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating || isSubmitting}>
          Cancel
        </Button>
        <Button type="button" onClick={handleCreateFlashcard} disabled={isGenerating || isSubmitting}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Flashcard"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

