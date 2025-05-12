
import React from "react";
import { Button } from "@/components/ui/button";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { toast } from "sonner";

interface EnhanceDropdownProps {
  noteId: string;
  noteTitle: string;
  noteContent: string;
  onEnhance: (enhancedContent: string) => void;
}

export const EnhanceDropdown = ({
  noteId,
  noteTitle,
  noteContent,
  onEnhance,
}: EnhanceDropdownProps) => {
  const {
    isProcessing,
    enhancementOptions,
    enrichNote,
    isEnabled,
  } = useNoteEnrichment();

  const handleEnhancementSelect = async (enhancement: EnhancementFunction) => {
    if (!noteId || !noteContent) return;
    
    try {
      const result = await enrichNote(noteId, noteContent, enhancement, noteTitle);
      
      if (result.success) {
        onEnhance(result.content);
      }
    } catch (error) {
      console.error("Error enhancing note:", error);
      toast.error("Failed to enhance note");
    }
  };

  if (!isEnabled) {
    return (
      <Button disabled size="icon" className="h-8 w-8" title="Enhancement requires premium">
        <Sparkles className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          disabled={isProcessing}
          title="Enhance note"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white w-56">
        {enhancementOptions.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => handleEnhancementSelect(option.id as EnhancementFunction)}
            className="cursor-pointer"
            disabled={isProcessing}
          >
            <div className="flex flex-col">
              <span>{option.title}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
