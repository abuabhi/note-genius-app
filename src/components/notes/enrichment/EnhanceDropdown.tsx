
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

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
    currentUsage,
    monthlyLimit,
    hasReachedLimit
  } = useNoteEnrichment();

  const handleEnhancementSelect = async (enhancement: EnhancementFunction) => {
    if (!noteId || !noteContent) return;
    
    // Check if it's the "create-flashcards" option which is coming soon
    if (enhancement === 'generate-questions') {
      toast.info("Coming Soon", {
        description: "Flashcard creation from notes will be available soon!"
      });
      return;
    }
    
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
  
  const isLimitReached = hasReachedLimit();
  const usagePercentage = monthlyLimit ? Math.min((currentUsage / monthlyLimit) * 100, 100) : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 relative group"
          disabled={isProcessing || isLimitReached}
          title={isLimitReached ? "Monthly limit reached" : "Enhance note"}
        >
          <Sparkles className="h-4 w-4 transition-all duration-300 group-hover:text-mint-500 group-hover:scale-110 group-hover:rotate-12" />
          <span className="absolute inset-0 rounded-full bg-mint-200/0 group-hover:bg-mint-100/50 transition-colors duration-300"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white border-mint-100 shadow-md rounded-md w-64 p-1"
      >
        {/* Usage stats */}
        {monthlyLimit !== null && (
          <>
            <div className="px-2 py-1.5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {currentUsage} / {monthlyLimit} used this month
                </span>
                <span className={`font-medium ${usagePercentage > 80 ? 'text-red-500' : 'text-mint-600'}`}>
                  {Math.round(usagePercentage)}%
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className={`h-1 ${usagePercentage > 80 ? 'bg-red-100' : 'bg-mint-100'}`}
              />
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Limit reached message */}
        {isLimitReached ? (
          <div className="px-3 py-2 text-sm text-amber-600">
            You've reached your monthly limit for note enhancements. Check back next month or upgrade your plan.
          </div>
        ) : (
          /* Enhancement options */
          enhancementOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleEnhancementSelect(option.value as EnhancementFunction)}
              className={`cursor-pointer flex items-start p-2 rounded hover:bg-mint-50 focus:bg-mint-50 transition-colors ${option.value === 'generate-questions' ? 'opacity-60' : ''}`}
              disabled={isProcessing || option.value === 'generate-questions'}
            >
              <div className="flex flex-col">
                <span className="font-medium text-mint-800">{option.title}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
                {option.value === 'generate-questions' && (
                  <span className="text-xs text-amber-600 mt-0.5 font-medium">Coming soon</span>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
