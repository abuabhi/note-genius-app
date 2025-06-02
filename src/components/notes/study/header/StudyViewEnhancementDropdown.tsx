
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
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-white border border-gray-200 shadow-lg rounded-md z-50"
      >
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('summarize')}
          className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Sparkles className="mr-2 h-4 w-4 text-mint-600" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">Generate Summary</span>
            <span className="text-xs text-gray-500">Create a concise summary</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('extract-key-points')}
          className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Sparkles className="mr-2 h-4 w-4 text-mint-600" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">Extract Key Points</span>
            <span className="text-xs text-gray-500">Identify main points</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('improve-clarity')}
          className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Sparkles className="mr-2 h-4 w-4 text-mint-600" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">Improve Clarity</span>
            <span className="text-xs text-gray-500">Enhance readability</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('convert-to-markdown')}
          className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Sparkles className="mr-2 h-4 w-4 text-mint-600" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">Convert to Markdown</span>
            <span className="text-xs text-gray-500">Format as markdown</span>
          </div>
        </DropdownMenuItem>
        
        {hasImprovedContent && (
          <>
            <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
            <DropdownMenuItem 
              onClick={handleRegenerate}
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
            >
              <RefreshCw className="mr-2 h-4 w-4 text-amber-600" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Regenerate Improved Content</span>
                <span className="text-xs text-gray-500">Replace existing improvement</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
