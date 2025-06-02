
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Sparkles, RefreshCw } from "lucide-react";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { Note } from "@/types/note";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";

interface StudyViewEnhancementDropdownProps {
  note: Note;
  processingEnhancement: EnhancementFunction | null;
  onEnhancementSelect: (enhancement: EnhancementFunction) => Promise<void>;
}

export const StudyViewEnhancementDropdown = ({
  note,
  processingEnhancement,
  onEnhancementSelect
}: StudyViewEnhancementDropdownProps) => {
  const { hasReachedLimit } = useNoteEnrichment();

  const handleRegenerate = () => {
    onEnhancementSelect('improve-clarity');
  };

  // Check if note has improved content for regeneration option
  const hasImprovedContent = Boolean(
    note.improved_content && 
    typeof note.improved_content === 'string' && 
    note.improved_content.trim().length > 10
  );

  const isProcessing = processingEnhancement !== null;

  if (hasReachedLimit()) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Sparkles className="mr-2 h-4 w-4" />
        Limit Reached
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isProcessing}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isProcessing ? "Enhancing..." : "Use AI"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onEnhancementSelect('summarize')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Summary
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEnhancementSelect('extract-key-points')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Extract Key Points
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEnhancementSelect('improve-clarity')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Improve Clarity
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEnhancementSelect('convert-to-markdown')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Convert to Markdown
        </DropdownMenuItem>
        
        {hasImprovedContent && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Improved Content
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
