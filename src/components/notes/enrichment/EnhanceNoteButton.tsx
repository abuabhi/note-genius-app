
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface EnhanceNoteButtonProps {
  noteId: string;
  noteContent: string;
  noteTitle?: string; // Make this optional to accommodate both old and new callers
  onEnhance: (enhancedContent: string) => void;
}

export const EnhanceNoteButton: React.FC<EnhanceNoteButtonProps> = ({
  noteId,
  noteContent,
  noteTitle,
  onEnhance
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const handleEnhance = async () => {
    if (!noteContent) return;
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-enhance', {
        body: { text: noteContent, enhancementType: 'generate-questions' }
      });

      if (error) throw error;
      
      if (data.success) {
        onEnhance(JSON.stringify(data.result, null, 2));
        toast.success('Questions generated successfully!');
      }
    } catch (error) {
      console.error("Enhancement failed:", error);
      toast.error("Failed to enhance note");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleEnhance}
      disabled={isProcessing}
      className="flex items-center gap-2"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Enhance Note
        </>
      )}
    </Button>
  );
};

export default EnhanceNoteButton;
