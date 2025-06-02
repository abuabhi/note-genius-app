
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
  // More aggressive detection of enhanced content
  const hasSummary = !!(note.summary && note.summary.trim() && note.summary.length > 0);
  const hasKeyPoints = !!(note.key_points && note.key_points.trim() && note.key_points.length > 0);
  const hasMarkdown = !!(note.markdown_content && note.markdown_content.trim() && note.markdown_content.length > 0);
  const hasImprovedClarity = !!(note.improved_content && note.improved_content.trim() && note.improved_content.length > 0);
  
  // Check enhancement statuses more thoroughly
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';

  // Enhanced debug logging
  console.log("🔍 EnhancementSelector - Enhanced detection:", {
    noteId: note.id,
    timestamp: new Date().toISOString(),
    rawFields: {
      summary: note.summary,
      keyPoints: note.key_points,
      markdown: note.markdown_content,
      improvedContent: note.improved_content
    },
    detectionResults: {
      hasSummary,
      hasKeyPoints,
      hasMarkdown,
      hasImprovedClarity
    },
    lengths: {
      summary: note.summary?.length || 0,
      keyPoints: note.key_points?.length || 0,
      markdown: note.markdown_content?.length || 0,
      improvedContent: note.improved_content?.length || 0
    },
    activeContentType,
    generatedTimestamps: {
      summary: note.summary_generated_at,
      keyPoints: note.key_points_generated_at,
      markdown: note.markdown_content_generated_at,
      improvedClarity: note.improved_content_generated_at
    }
  });

  // Define the enhancement options with more explicit availability checks
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

  // Enhanced logging for available options
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
    improvedClarityCheck: {
      hasContent: hasImprovedClarity,
      rawContent: note.improved_content,
      trimmedLength: note.improved_content?.trim()?.length || 0
    }
  });

  return (
    <div className={cn("flex flex-col border-r border-border bg-muted/20", className)}>
      <div className="py-2 px-3 bg-muted/30 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground">Content Views</h3>
      </div>
      <div className="flex flex-col py-1">
        {availableOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              console.log(`🎯 EnhancementSelector - Tab clicked: ${option.id}`);
              setActiveContentType(option.id);
            }}
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
