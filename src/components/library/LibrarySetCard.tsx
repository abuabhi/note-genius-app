
import { useState } from 'react';
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { FlashcardSet } from "@/types/flashcard";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LibrarySetCardProps {
  set: FlashcardSet;
}

export const LibrarySetCard = ({ set }: LibrarySetCardProps) => {
  const { cloneFlashcardSet } = useFlashcards();
  const { user } = useAuth();
  const [isCloning, setIsCloning] = useState(false);
  
  const handleClone = async () => {
    if (!user) {
      toast("Please sign in to clone this set");
      return;
    }
    
    try {
      setIsCloning(true);
      const clonedSet = await cloneFlashcardSet(set.id);
      if (clonedSet) {
        toast.success("Set cloned successfully!");
        // Navigate to the flashcards page or the cloned set
      }
    } catch (error) {
      console.error("Error cloning set:", error);
      toast.error("Failed to clone set");
    } finally {
      setIsCloning(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{set.name}</h3>
        <p className="text-sm text-muted-foreground">
          {set.card_count || 0} cards
          {set.academic_subjects?.name && ` • ${set.academic_subjects.name}`}
        </p>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm">
          {set.description || "No description provided"}
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleClone} 
          disabled={isCloning}
        >
          {isCloning ? "Cloning..." : "Clone to My Sets"}
        </Button>
      </CardFooter>
    </Card>
  );
};
