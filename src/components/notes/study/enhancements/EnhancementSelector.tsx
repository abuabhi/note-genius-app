
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
  const hasSummary = !!(note.summary && note.summary.trim());
  const hasKeyPoints = !!(note.key_points && note.key_points.trim());
  const hasMarkdown = !!(note.markdown_content && note.markdown_content.trim());
  const hasImprovedClarity = !!(note.improved_content && note.improved_content.trim());
  
  // Check enhancement statuses
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';

  // Comprehensive debug log to verify enhancement detection
  console.log("🔍 EnhancementSelector - Detailed analysis:", {
    noteId: note.id,
    timestamp: new Date().toISOString(),
    summary: {
      exists: hasSummary,
      length: note.summary?.length || 0,
      preview: note.summary?.substring(0, 50) || 'none',
      generatedAt: note.summary_generated_at,
      status: summaryStatus
    },
    keyPoints: {
      exists: hasKeyPoints,
      length: note.key_points?.length || 0,
      preview: note.key_points?.substring(0, 50) || 'none',
      generatedAt: note.key_points_generated_at
    },
    markdown: {
      exists: hasMarkdown,
      length: note.markdown_content?.length || 0,
      preview: note.markdown_content?.substring(0, 50) || 'none',
      generatedAt: note.markdown_content_generated_at
    },
    improvedClarity: {
      exists: hasImprovedClarity,
      length: note.improved_content?.length || 0,
      preview: note.improved_content?.substring(0, 50) || 'none',
      generatedAt: note.improved_content_generated_at
    },
    activeContentType,
    availableCount: [hasSummary, hasKeyPoints, hasMarkdown, hasImprovedClarity].filter(Boolean).length
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

  // Log available options for debugging
  console.log("📋 EnhancementSelector - Available tabs:", {
    totalOptions: enhancementOptions.length,
    availableOptions: availableOptions.map(opt => ({
      id: opt.id,
      label: opt.label,
      isGenerating: opt.isGenerating,
      hasError: opt.hasError
    })),
    activeTab: activeContentType
  });

  return (
    <div className={cn("flex flex-col border-r border-border bg-muted/20", className)}>
      <div className="py-2 px-3 bg-muted/30 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground">Content Views</h3>
        <div className="text-xs text-muted-foreground mt-1">
          {availableOptions.length} option{availableOptions.length !== 1 ? 's' : ''} available
        </div>
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
