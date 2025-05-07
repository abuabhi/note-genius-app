
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "@/types/flashcard";
import { getExplanationForCard } from "@/services/aiService";
import { Loader2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isPremiumTier } from "@/utils/premiumFeatures";

interface FlashcardExplanationProps {
  flashcard: Flashcard;
  isVisible: boolean;
}

export const FlashcardExplanation = ({ flashcard, isVisible }: FlashcardExplanationProps) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useRequireAuth();
  
  const isPremium = isPremiumTier(userProfile?.user_tier);
  
  const fetchExplanation = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "AI explanations are available for Professor and Dean tier users.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const explanationText = await getExplanationForCard(flashcard);
      setExplanation(explanationText);
    } catch (error) {
      console.error("Error fetching explanation:", error);
      toast({
        title: "Error",
        description: "Failed to get explanation. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="mt-4">
      {!explanation && !isLoading && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchExplanation}
          className="flex items-center"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Get Explanation
        </Button>
      )}
      
      {isLoading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating explanation...</span>
        </div>
      )}
      
      {explanation && (
        <Card className="mt-2 bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
              <h4 className="text-sm font-medium">AI Explanation</h4>
            </div>
            <p className="text-sm">{explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
