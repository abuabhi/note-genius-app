
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
          className="h-8 w-8 relative group"
          disabled={isProcessing}
          title="Enhance note"
        >
          <Sparkles className="h-4 w-4 transition-all duration-300 group-hover:text-mint-500 group-hover:scale-110 group-hover:rotate-12" />
          <span className="absolute inset-0 rounded-full bg-mint-200/0 group-hover:bg-mint-100/50 transition-colors duration-300"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white border-mint-100 shadow-md rounded-md w-64 p-1"
      >
        {enhancementOptions.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => handleEnhancementSelect(option.value as EnhancementFunction)}
            className="cursor-pointer flex items-start p-2 rounded hover:bg-mint-50 focus:bg-mint-50 transition-colors"
            disabled={isProcessing}
          >
            <div className="flex flex-col">
              <span className="font-medium text-mint-800">{option.title}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
