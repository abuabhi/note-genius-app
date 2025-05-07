import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GeneratedFlashcard } from "@/services/aiService";
import { generateFlashcardsFromNotes } from "@/services/aiService";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { PremiumFeatureNotice } from "./PremiumFeatureNotice";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isPremiumTier } from "@/utils/premiumFeatures";

interface AIFlashcardGeneratorProps {
  noteContent: string;
  subject?: string;
  onFlashcardsGenerated?: (flashcards: GeneratedFlashcard[]) => void;
}

export const AIFlashcardGenerator = ({ noteContent, subject, onFlashcardsGenerated }: AIFlashcardGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<GeneratedFlashcard[]>([]);
  const { toast } = useToast();
  const { createFlashcard } = useFlashcards();
  const { userProfile } = useRequireAuth();
  
  const isPremium = isPremiumTier(userProfile?.user_tier);
  
  const handleGenerateFlashcards = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "AI flashcard generation is available for Master and Dean tier users.",
        variant: "destructive",
      });
      return;
    }
    
    if (!noteContent.trim()) {
      toast({
        title: "Empty Content",
        description: "Please provide note content to generate flashcards.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const flashcards = await generateFlashcardsFromNotes(noteContent, 5, subject);
      setGeneratedFlashcards(flashcards);
      
      if (onFlashcardsGenerated) {
        onFlashcardsGenerated(flashcards);
      }
      
      toast({
        title: "Flashcards Generated",
        description: `Successfully created ${flashcards.length} flashcards.`,
      });
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate flashcards. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveFlashcard = async (flashcard: GeneratedFlashcard) => {
    try {
      await createFlashcard({
        front_content: flashcard.front,
        back_content: flashcard.back,
        difficulty: 3,
      });
      
      toast({
        title: "Flashcard Saved",
        description: "The flashcard has been added to your collection.",
      });
    } catch (error) {
      console.error("Error saving flashcard:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save the flashcard. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <PremiumFeatureNotice 
        isPremium={isPremium}
        onAIExtract={handleGenerateFlashcards}
      />
      
      {generatedFlashcards.length > 0 && (
        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-semibold">Generated Flashcards</h3>
          <div className="grid grid-cols-1 gap-4">
            {generatedFlashcards.map((flashcard, index) => (
              <Card key={index} className="p-4">
                <div className="flex flex-col space-y-2">
                  <div className="font-medium">Front: {flashcard.front}</div>
                  <div className="text-muted-foreground">Back: {flashcard.back}</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="self-end"
                    onClick={() => handleSaveFlashcard(flashcard)}
                  >
                    Save as Flashcard
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {isGenerating && (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
