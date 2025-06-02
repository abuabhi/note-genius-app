
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
  // Enhanced detection with better null/undefined handling
  const hasSummary = Boolean(note.summary?.trim()?.length);
  const hasKeyPoints = Boolean(note.key_points?.trim()?.length);
  const hasMarkdown = Boolean(note.markdown_content?.trim()?.length);
  const hasImprovedClarity = Boolean(note.improved_content?.trim()?.length);
  
  // Check enhancement statuses
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';

  // Debug logging with more detailed information
  console.log("🔍 EnhancementSelector - Content detection:", {
    noteId: note.id,
    timestamp: new Date().toISOString(),
    rawValues: {
      improved_content: note.improved_content,
      summary: note.summary,
      key_points: note.key_points,
      markdown_content: note.markdown_content
    },
    detection: {
      hasImprovedClarity,
      hasSummary,
      hasKeyPoints,
      hasMarkdown
    },
    lengths: {
      improved_content: note.improved_content?.length || 0,
      summary: note.summary?.length || 0,
      key_points: note.key_points?.length || 0,
      markdown_content: note.markdown_content?.length || 0
    },
    activeContentType,
    noteObject: {
      hasAllFields: note.hasOwnProperty('improved_content'),
      keys: Object.keys(note).filter(key => key.includes('improved') || key.includes('content'))
    }
  });

  // Define enhancement options
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
      id: 'improved',
      label: 'Improved Clarity',
      available: hasImprovedClarity
    },
    {
      id: 'markdown',
      label: 'Markdown',
      available: hasMarkdown
    }
  ];

  // Filter to only show available options
  const availableOptions = enhancementOptions.filter(option => option.available);

  console.log("📋 EnhancementSelector - Available options:", {
    totalOptions: enhancementOptions.length,
    availableCount: availableOptions.length,
    availableOptions: availableOptions.map(opt => ({
      id: opt.id,
      label: opt.label,
      isGenerating: opt.isGenerating,
      hasError: opt.hasError
    })),
    activeTab: activeContentType,
    improvedClarityDetails: {
      hasContent: hasImprovedClarity,
      rawContent: note.improved_content,
      trimmedLength: note.improved_content?.trim()?.length || 0,
      generatedAt: note.improved_content_generated_at
    }
  });

  const handleTabClick = (contentType: EnhancementContentType) => {
    console.log(`🎯 Tab clicked: ${contentType} (current: ${activeContentType})`);
    setActiveContentType(contentType);
  };

  return (
    <div className={cn("flex flex-col border-r border-border bg-muted/20", className)}>
      <div className="py-2 px-3 bg-muted/30 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground">Content Views</h3>
      </div>
      <div className="flex flex-col py-1">
        {availableOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleTabClick(option.id)}
            className={cn(
              "flex items-center justify-between px-4 py-2 text-sm transition-colors cursor-pointer",
              activeContentType === option.id 
                ? "bg-mint-50 text-mint-800 font-medium border-l-2 border-l-mint-500" 
                : "text-muted-foreground hover:bg-muted/40 border-l-2 border-l-transparent hover:text-foreground"
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
