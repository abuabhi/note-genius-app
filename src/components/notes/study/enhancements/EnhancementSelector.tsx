
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Note } from "@/types/note";

export type EnhancementContentType = 'original' | 'summary' | 'keyPoints' | 'markdown' | 'improved';

interface EnhancementOption {
  id: EnhancementContentType;
  label: string;
  available: boolean;
  isGenerating?: boolean;
  hasError?: boolean;
}

interface EnhancementSelectorProps {
  note: Note;
  activeContentType: EnhancementContentType;
  setActiveContentType: (type: EnhancementContentType) => void;
  className?: string;
}

export const EnhancementSelector = ({
  note,
  activeContentType,
  setActiveContentType,
  className
}: EnhancementSelectorProps) => {
  // Determine which enhancements are available based on note data - immediate detection
  const hasSummary = !!note.summary;
  const hasKeyPoints = !!note.key_points;
  const hasMarkdown = !!note.markdown_content;
  const hasImprovedClarity = !!note.improved_content;
  
  // Check enhancement statuses
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';

  // Debug log to verify enhancement detection
  console.log("EnhancementSelector - Enhancement detection:", {
    noteId: note.id,
    hasSummary,
    hasKeyPoints,
    hasMarkdown,
    hasImprovedClarity,
    summaryStatus
  });

  // Define the enhancement options - show immediately when content exists
  const enhancementOptions: EnhancementOption[] = [
    {
      id: 'original',
      label: 'Original',
      available: true
    },
    {
      id: 'summary',
      label: 'Summary',
      available: hasSummary || isGeneratingSummary || hasSummaryError,
      isGenerating: isGeneratingSummary,
      hasError: hasSummaryError
    },
    {
      id: 'keyPoints',
      label: 'Key Points',
      available: hasKeyPoints
    },
    {
      id: 'markdown',
      label: 'Markdown',
      available: hasMarkdown
    },
    {
      id: 'improved',
      label: 'Improved Clarity',
      available: hasImprovedClarity
    }
  ];

  // Filter to only show available options
  const availableOptions = enhancementOptions.filter(option => option.available);

  return (
    <div className={cn("flex flex-col border-r border-border bg-muted/20", className)}>
      <div className="py-2 px-3 bg-muted/30 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground">Content Views</h3>
      </div>
      <div className="flex flex-col py-1">
        {availableOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveContentType(option.id)}
            className={cn(
              "flex items-center justify-between px-4 py-2 text-sm transition-colors",
              activeContentType === option.id 
                ? "bg-mint-50 text-mint-800 font-medium border-l-2 border-l-mint-500" 
                : "text-muted-foreground hover:bg-muted/40 border-l-2 border-l-transparent"
            )}
          >
            <span>{option.label}</span>
            {option.isGenerating && (
              <Loader2 className="h-3 w-3 animate-spin text-mint-500 ml-2" />
            )}
            {option.hasError && (
              <AlertCircle className="h-3 w-3 text-red-500 ml-2" />
            )}
            {!option.isGenerating && !option.hasError && activeContentType === option.id && (
              <CheckCircle className="h-3 w-3 text-mint-500 ml-2" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
