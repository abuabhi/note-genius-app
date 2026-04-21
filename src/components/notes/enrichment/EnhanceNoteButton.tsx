
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAiEnrichmentUsage } from "@/hooks/usage/useAiEnrichmentUsage";
import { useAIRequestGuard } from "@/hooks/useAIRequestGuard";


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
  const { hasReachedLimit, isNearLimit, usageCount, monthlyLimit } = useAiEnrichmentUsage();
  const guardAIRequest = useAIRequestGuard();

  
  const handleEnhance = async () => {
    if (!noteContent) return;
    
    setIsProcessing(true);
    try {
      const { data, error } = await guardAIRequest(
        `enrich-note:${noteId}:generate-questions`,
        () => supabase.functions.invoke('enrich-note', {
          body: { 
            noteId, 
            noteContent, 
            enhancementType: 'generate-questions',
            noteTitle: noteTitle || 'Study Questions'
          }
        })
      );

      if (error) throw error;
      
      if (data.enhancedContent) {
        onEnhance(data.enhancedContent);
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={handleEnhance}
            disabled={isProcessing || hasReachedLimit}
            aria-disabled={isProcessing || hasReachedLimit}
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
                {hasReachedLimit ? 'Limit reached' : 'Enhance Note'}
              </>
            )}
          </Button>
        </TooltipTrigger>
        {(hasReachedLimit || isNearLimit) && (
          <TooltipContent side="top" align="center">
            <p className="max-w-xs text-sm">
              {hasReachedLimit
                ? `You've reached your monthly enhancement limit${typeof monthlyLimit === 'number' ? ` (${usageCount}/${monthlyLimit}).` : '.'} Upgrade to continue.`
                : `You're approaching your monthly enhancement limit${typeof monthlyLimit === 'number' ? ` (${usageCount}/${monthlyLimit}).` : '.'}`}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default EnhanceNoteButton;
