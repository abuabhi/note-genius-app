
import { Button } from "@/components/ui/button";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useUserTier } from "@/hooks/useUserTier";
import { Sparkles } from "lucide-react";

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
    remaining, 
    selectedEnhancement,
    enrichNote 
  } = useNoteEnrichment();
  
  const { userTier, isLoading } = useUserTier();
  
  const handleEnhance = async () => {
    if (!noteId || !noteContent) return;
    
    try {
      const result = await enrichNote(
        noteId, 
        noteContent, 
        selectedEnhancement,
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
