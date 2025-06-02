
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, ChevronDown, Loader2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { toast } from "sonner";
import { Note } from "@/types/note";

interface StudyViewEnhancementDropdownProps {
  note: Note;
  processingEnhancement: EnhancementFunction | null;
  onEnhancementSelect: (enhancement: EnhancementFunction) => Promise<void>;
}

export const StudyViewEnhancementDropdown = ({
  note,
  processingEnhancement,
  onEnhancementSelect,
}: StudyViewEnhancementDropdownProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { enhancementOptions, isProcessing } = useNoteEnrichment();

  const handleEnhancementSelect = async (enhancement: EnhancementFunction) => {
    if (!note.id || !note.content) return;
    
    if (enhancement === 'create-flashcards') {
      toast.info("Coming Soon", {
        description: "Flashcard creation from notes will be available soon!"
      });
      return;
    }
    
    setDropdownOpen(false);
    await onEnhancementSelect(enhancement);
  };

  // Group enhancement options by category for the dropdown
  const nonReplacementOptions = enhancementOptions.filter(opt => !opt.replaceContent);
  const replacementOptions = enhancementOptions.filter(opt => opt.replaceContent);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white border border-mint-200 text-mint-700 hover:bg-mint-50 hover:text-mint-800 transition-all gap-1 group h-8"
          disabled={isProcessing || !!processingEnhancement}
        >
          {processingEnhancement ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-1 group-hover:text-mint-600 transition-colors" />
          )}
          Use AI
          <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Non-replacement options */}
        {nonReplacementOptions.map((option, index) => (
          <div key={option.id}>
            <DropdownMenuItem
              onClick={() => handleEnhancementSelect(option.value as EnhancementFunction)}
              className="cursor-pointer flex items-start p-2 rounded hover:bg-mint-50 focus:bg-mint-50 transition-colors"
              disabled={isProcessing || option.value === 'create-flashcards' || !!processingEnhancement}
            >
              <div className="flex flex-col">
                <span className="font-medium text-mint-800">{option.title}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
                {option.value === 'create-flashcards' && (
                  <span className="text-xs text-amber-600 mt-0.5 font-medium">Coming soon</span>
                )}
              </div>
            </DropdownMenuItem>
            {index < nonReplacementOptions.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}

        {/* Separator between categories */}
        {nonReplacementOptions.length > 0 && replacementOptions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs text-muted-foreground">
              Content Improvements
            </div>
          </>
        )}

        {/* Replacement options */}
        {replacementOptions.map((option, index) => (
          <div key={option.id}>
            <DropdownMenuItem
              onClick={() => handleEnhancementSelect(option.value as EnhancementFunction)}
              className="cursor-pointer flex items-start p-2 rounded hover:bg-mint-50 focus:bg-mint-50 transition-colors"
              disabled={isProcessing || !!processingEnhancement}
            >
              <div className="flex flex-col">
                <span className="font-medium text-mint-800">{option.title}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
              </div>
            </DropdownMenuItem>
            {index < replacementOptions.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
