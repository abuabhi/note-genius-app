
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
        <Button variant="outline" size="sm" disabled={isProcessing} className="bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100 hover:text-mint-800">
          <Sparkles className="mr-2 h-4 w-4" />
          {isProcessing ? "Enhancing..." : "Use AI"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 bg-white border border-gray-200 shadow-lg rounded-md z-50"
      >
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('summarize')}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Sparkles className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">Generate Summary</span>
            <span className="text-xs text-gray-500 leading-relaxed">Create a concise summary that captures the main ideas and key takeaways from your note content</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('extract-key-points')}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Sparkles className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">Extract Key Points</span>
            <span className="text-xs text-gray-500 leading-relaxed">Identify and organize the most important points, facts, and concepts from your notes</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('improve-clarity')}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Sparkles className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">Improve Clarity</span>
            <span className="text-xs text-gray-500 leading-relaxed">Enhance readability by improving structure, flow, and making complex concepts easier to understand</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('fix-spelling-grammar')}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Sparkles className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">Fix Spelling & Grammar</span>
            <span className="text-xs text-gray-500 leading-relaxed">Correct spelling mistakes, grammar errors, and improve sentence structure in your original content</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('convert-to-markdown')}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Sparkles className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">Convert to Markdown</span>
            <span className="text-xs text-gray-500 leading-relaxed">Transform your original content into properly formatted markdown with headers, lists, and styling</span>
          </div>
        </DropdownMenuItem>
        
        {hasImprovedContent && (
          <>
            <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
            <DropdownMenuItem 
              onClick={handleRegenerate}
              className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
            >
              <RefreshCw className="mr-3 h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 mb-1">Regenerate Improved Content</span>
                <span className="text-xs text-gray-500 leading-relaxed">Generate a new version of the improved content with different phrasing and structure</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
