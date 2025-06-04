
import { useState } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FlashcardDifficulty } from "@/types/flashcard";

interface CreateFlashcardProps {
  setId?: string;
  onSuccess?: () => void;
}

const CreateFlashcard = ({ setId, onSuccess }: CreateFlashcardProps) => {
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createFlashcard } = useFlashcards();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!frontContent.trim() || !backContent.trim()) {
      toast.error("Please fill in both sides of the flashcard.");
      return;
    }

    if (!setId) {
      toast.error("No flashcard set specified.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const cardData = {
        front_content: frontContent.trim(),
        back_content: backContent.trim(),
        difficulty,
        set_id: setId
      };
      
      console.log("Creating flashcard with data:", cardData);
      
      const result = await createFlashcard(cardData);
      
      if (result) {
        setFrontContent("");
        setBackContent("");
        setDifficulty(3);
        
        toast.success("Flashcard created successfully!");
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast.error("Failed to create flashcard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Flashcard</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front">Front</Label>
            <Textarea 
              id="front"
              placeholder="Enter the question or prompt"
              value={frontContent}
              onChange={(e) => setFrontContent(e.target.value)}
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="back">Back</Label>
            <Textarea 
              id="back"
              placeholder="Enter the answer or explanation"
              value={backContent}
              onChange={(e) => setBackContent(e.target.value)}
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select 
              value={difficulty.toString()} 
              onValueChange={(value) => setDifficulty(parseInt(value) as FlashcardDifficulty)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Very Easy (1)</SelectItem>
                <SelectItem value="2">Easy (2)</SelectItem>
                <SelectItem value="3">Medium (3)</SelectItem>
                <SelectItem value="4">Hard (4)</SelectItem>
                <SelectItem value="5">Very Hard (5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
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

export default CreateFlashcard;
