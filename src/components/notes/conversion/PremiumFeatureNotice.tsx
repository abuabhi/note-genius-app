
import { useState } from "react";
import { UserTier } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumFeatureNoticeProps {
  isPremium: boolean;
  onAIExtract?: () => Promise<void>;
}

export const PremiumFeatureNotice = ({ isPremium, onAIExtract }: PremiumFeatureNoticeProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const handleAIExtract = async () => {
    if (!onAIExtract) {
      toast({
        title: "Feature not available",
        description: "AI extraction is not available for this operation.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await onAIExtract();
      toast({
        title: "AI Extraction Complete",
        description: "Your content has been processed with AI assistance.",
      });
    } catch (error) {
      console.error("AI extraction failed:", error);
      toast({
        title: "AI Extraction Failed",
        description: "There was a problem processing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPremium) {
    return (
      <div className="rounded-md bg-gradient-to-r from-purple-50 to-blue-50 p-3 text-sm border border-blue-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-blue-700 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
              Premium Feature Available
            </p>
            <p className="text-blue-600">Use AI to extract key concepts and create better flashcards.</p>
          </div>
          <Button 
            size="sm"
            onClick={handleAIExtract}
            disabled={isProcessing || !onAIExtract}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Use AI
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
      <p className="font-medium">Premium Feature</p>
      <p>Upgrade to Professor or Dean tier for AI-assisted content extraction and improved flashcard generation.</p>
    </div>
  );
};
