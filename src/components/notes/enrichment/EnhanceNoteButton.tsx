
import { Button } from "@/components/ui/button";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useUserTier } from "@/hooks/useUserTier";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      console.log('🚀 Calling simple-enhance-note for generate-questions');
      
      const { data, error } = await supabase.functions.invoke('simple-enhance-note', {
        body: { 
          noteId,
          content: noteContent, 
          enhancementType: "generate-questions", 
          title: noteTitle || "Note" 
        }
      });

      if (error) {
        console.error('❌ Enhancement error:', error);
        toast.error(`Enhancement failed: ${error.message}`);
        return;
      }

      if (data.success) {
        onEnhance(data.data);
        toast.success('Questions generated successfully!');
      } else {
        toast.error(`Enhancement failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error enhancing note:", error);
      toast.error("Failed to enhance note");
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
