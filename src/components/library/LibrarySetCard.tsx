
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { FlashcardSet } from "@/types/flashcard";
import { UserTier } from "@/hooks/useRequireAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LibrarySetCardProps {
  set: FlashcardSet;
  userTier: UserTier;
}

// Define which sets are available to which tiers
const tierAccess: Record<string, UserTier[]> = {
  "Mathematics": [UserTier.SCHOLAR, UserTier.GRADUATE, UserTier.MASTER, UserTier.DEAN],
  "Basic Sciences": [UserTier.SCHOLAR, UserTier.GRADUATE, UserTier.MASTER, UserTier.DEAN],
  "English": [UserTier.SCHOLAR, UserTier.GRADUATE, UserTier.MASTER, UserTier.DEAN],
  "History": [UserTier.GRADUATE, UserTier.MASTER, UserTier.DEAN],
  "Advanced Sciences": [UserTier.GRADUATE, UserTier.MASTER, UserTier.DEAN],
  "Computer Science": [UserTier.MASTER, UserTier.DEAN],
  "Advanced Mathematics": [UserTier.MASTER, UserTier.DEAN],
  "Foreign Languages": [UserTier.DEAN],
  "Medicine": [UserTier.DEAN],
};

export function LibrarySetCard({ set, userTier }: LibrarySetCardProps) {
  const { cloneFlashcardSet } = useFlashcards();
  const [isCloning, setIsCloning] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Determine if user has access to this set
  const hasAccess = () => {
    const subject = set.subject || "";
    const requiredTiers = tierAccess[subject] || [UserTier.DEAN]; // Default to highest tier if not specified
    
    const tierLevels: Record<UserTier, number> = {
      [UserTier.SCHOLAR]: 1,
      [UserTier.GRADUATE]: 2,
      [UserTier.MASTER]: 3,
      [UserTier.DEAN]: 4
    };
    
    const userLevel = tierLevels[userTier];
    const requiredLevel = Math.min(...requiredTiers.map(tier => tierLevels[tier]));
    
    return userLevel >= requiredLevel;
  };
  
  const handleClone = async () => {
    if (!hasAccess()) {
      toast({
        title: "Access Restricted",
        description: `Upgrade your account to access ${set.subject} flashcard sets.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsCloning(true);
    try {
      await cloneFlashcardSet(set.id);
      toast({
        title: "Success!",
        description: "Flashcard set added to your library.",
      });
      navigate("/flashcards");
    } catch (error) {
      console.error("Error cloning set:", error);
      toast({
        title: "Failed to add set",
        description: "An error occurred while adding this set to your library.",
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
  };
  
  const cardCount = set.card_count || 0;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{set.name}</span>
          {!hasAccess() && <Lock className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          {set.subject ? `${set.subject}${set.topic ? ` - ${set.topic}` : ''}` : 'General'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{set.description || "No description available."}</p>
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>{set.card_count || 0} {(set.card_count || 0) === 1 ? 'card' : 'cards'}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleClone} 
          disabled={isCloning}
          variant={hasAccess() ? "default" : "outline"}
          className="w-full"
        >
          {isCloning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding to Library...
            </>
          ) : hasAccess() ? (
            "Add to My Flashcards"
          ) : (
            "Upgrade to Access"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
