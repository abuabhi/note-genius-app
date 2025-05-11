import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { useToast } from "@/hooks/use-toast";
import { useUserTier } from "@/hooks/useUserTier";

interface EnhanceNoteButtonProps {
  noteId: string;
  onEnrichmentComplete?: () => void;
}

export function EnhanceNoteButton({ noteId, onEnrichmentComplete }: EnhanceNoteButtonProps) {
  const { userTier, isUserPremium } = useUserTier();
  const { enrichNote, isEnriching, remainingEnrichments } = useNoteEnrichment();
  
  // Get the tier limits directly from the hook
  const { tierLimits } = useUserTier();
  
  const { toast } = useToast();

  const handleEnrichNote = async () => {
    if (!isUserPremium) {
      toast({
        title: "Upgrade Required",
        description: "You need to upgrade to a premium plan to use this feature.",
        variant: "destructive",
      });
      return;
    }

    if (remainingEnrichments <= 0) {
      toast({
        title: "Daily Limit Reached",
        description: "You have reached your daily limit for note enrichments. Upgrade your plan for more.",
        variant: "destructive",
      });
      return;
    }

    try {
      await enrichNote(noteId);
      toast({
        title: "Note Enriched",
        description: "Your note has been successfully enriched with AI.",
      });
      if (onEnrichmentComplete) {
        onEnrichmentComplete();
      }
    } catch (error) {
      console.error("Error enriching note:", error);
      toast({
        title: "Enrichment Failed",
        description: "Failed to enrich the note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isDisabled = isEnriching || !isUserPremium || remainingEnrichments <= 0;

  return (
    <Button
      onClick={handleEnrichNote}
      disabled={isDisabled}
    >
      {isEnriching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enriching...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Enrich with AI
        </>
      )}
    </Button>
  );
}
