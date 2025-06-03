
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Sparkles, Loader2 } from "lucide-react";
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

  const isProcessing = processingEnhancement !== null;

  if (hasReachedLimit()) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Sparkles className="mr-2 h-4 w-4 text-mint-500" />
        Limit Reached
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isProcessing} 
          className={`bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100 hover:text-mint-800 ${
            isProcessing ? 'animate-pulse' : ''
          }`}
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 text-mint-600 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4 text-mint-600" />
          )}
          {isProcessing ? "Enhancing..." : "Use AI"}
          {!isProcessing && <ChevronDown className="ml-2 h-4 w-4 text-mint-600" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 bg-white border border-gray-200 shadow-lg rounded-md z-50"
      >
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('summarize')}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-mint-50 focus:bg-mint-50"
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
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-mint-50 focus:bg-mint-50"
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
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-mint-50 focus:bg-mint-50"
        >
          <Sparkles className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">Improve Clarity</span>
            <span className="text-xs text-gray-500 leading-relaxed">Enhance readability by improving structure, flow, and making complex concepts easier to understand</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        <DropdownMenuItem 
          onClick={() => onEnhancementSelect('convert-to-markdown')}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-mint-50 focus:bg-mint-50"
        >
          <Sparkles className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">Convert to Markdown</span>
            <span className="text-xs text-gray-500 leading-relaxed">Transform your original content into properly formatted markdown with headers, lists, and styling</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
