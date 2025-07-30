
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react";

import { Note } from "@/types/note";
type EnhancementFunction = string;

interface StudyViewEnhancementDropdownProps {
  note: Note;
  processingEnhancement: EnhancementFunction | null;
  onEnhancementSelect: (enhancement: EnhancementFunction) => Promise<void>;
  // Progress tracking props
  isEnhancing?: boolean;
}

export const StudyViewEnhancementDropdown = ({
  note,
  processingEnhancement,
  onEnhancementSelect,
  isEnhancing = false
}: StudyViewEnhancementDropdownProps) => {
  // Simple limit check (removed complex system)
  const hasReachedLimit = () => false;

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
        <Button variant="outline" size="sm" disabled={isProcessing} className="bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100 hover:text-mint-800">
          <Sparkles className={`mr-2 h-4 w-4 text-mint-600 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? "Processing..." : "Use AI"}</span>
          {!isProcessing && <ChevronDown className="ml-2 h-4 w-4 text-mint-600" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 bg-white border border-gray-200 shadow-lg rounded-md z-50"
      >
        {/* Simple processing indicator */}
        {isProcessing && (
          <div className="p-3 border-b border-gray-100 text-center">
            <span className="text-sm text-gray-600">Processing enhancement...</span>
          </div>
        )}
        <DropdownMenuItem 
          onClick={async () => {
            console.log("🚀 DROPDOWN CLICK: summarize -> forwarding to onEnhancementSelect");
            await onEnhancementSelect('summarize');
          }}
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
          onClick={async () => {
            console.log("🚀 DROPDOWN CLICK: extract-key-points -> forwarding to onEnhancementSelect");
            await onEnhancementSelect('extract-key-points');
          }}
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
          onClick={async () => {
            console.log("🚀 DROPDOWN CLICK: generate-questions -> forwarding to onEnhancementSelect");
            await onEnhancementSelect('generate-questions');
          }}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-mint-50 focus:bg-mint-50"
        >
          <HelpCircle className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">Top 10 Questions</span>
            <span className="text-xs text-gray-500 leading-relaxed">Generate 10 comprehensive study questions and answers based on your note content</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        <DropdownMenuItem 
          onClick={async () => {
            console.log("🚀 DROPDOWN CLICK: convert-to-markdown -> forwarding to onEnhancementSelect");
            await onEnhancementSelect('convert-to-markdown');
          }}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-mint-50 focus:bg-mint-50"
        >
          <Sparkles className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">Format My Note</span>
            <span className="text-xs text-gray-500 leading-relaxed">Transform your original content into properly formatted markdown with headers, lists, and styling</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        <DropdownMenuItem 
          onClick={async () => {
            console.log("🚀 DROPDOWN CLICK: enrich-note -> forwarding to onEnhancementSelect");
            await onEnhancementSelect('enrich-note');
          }}
          className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-mint-50 focus:bg-mint-50"
        >
          <Sparkles className="mr-3 h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 mb-1">🔥 Enrich My Note</span>
            <span className="text-xs text-gray-500 leading-relaxed">Add 50-70% more detailed content, examples, and context while preserving original information</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
