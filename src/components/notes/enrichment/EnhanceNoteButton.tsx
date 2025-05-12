
import { Button } from "@/components/ui/button";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useUserTier } from "@/hooks/useUserTier";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface EnhanceNoteButtonProps {
  noteId: string;
  noteContent: string;
  noteTitle?: string; // Make this optional to accommodate both old and new callers
  onEnhance: (enhancedContent: string) => void;
}

export const EnhanceNoteButton = ({
  noteId,
  noteContent,
  noteTitle = "", // Default to empty string if not provided
  onEnhance,
}: EnhanceNoteButtonProps) => {
  const { 
    isProcessing,
    enrichNote,
    hasReachedLimit,
    currentUsage,
    monthlyLimit
  } = useNoteEnrichment();
  
  const { userTier, isLoading } = useUserTier();
  
  const handleEnhance = async () => {
    if (!noteId || !noteContent) return;
    
    // Check if user has reached their monthly limit
    if (hasReachedLimit()) {
      toast.error("Monthly limit reached", {
        description: "You've reached your monthly limit for note enhancements"
      });
      return;
    }
    
    try {
      // Use a default enhancement function since we're not using the selectedEnrichment anymore
      const enhancementType: EnhancementFunction = "improve-clarity";
      const result = await enrichNote(
        noteId, 
        noteContent, 
        enhancementType,
        noteTitle || "Note" // Use provided title or default
      );
      
      if (result.success) {
        onEnhance(result.content);
      }
    } catch (error) {
      console.error("Error enhancing note:", error);
    }
  };

  if (isLoading) {
    return <Button disabled size="sm" variant="outline"><Sparkles className="mr-2 h-4 w-4" /> Enhance</Button>;
  }

  // Show disabled button with different message if limit reached
  if (hasReachedLimit()) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        title={`Monthly limit reached (${currentUsage}/${monthlyLimit || "∞"})`}
      >
        <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />
        Limit Reached
      </Button>
    );
  }

  return (
    <Button
      onClick={handleEnhance}
      size="sm"
      variant="outline"
      disabled={isProcessing}
    >
      <Sparkles className="mr-2 h-4 w-4" />
      {isProcessing ? "Enhancing..." : "Enhance"}
    </Button>
  );
};

export default EnhanceNoteButton;
