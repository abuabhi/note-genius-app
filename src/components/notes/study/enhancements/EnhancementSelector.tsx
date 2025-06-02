
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
  // Enhanced detection with comprehensive null/undefined/empty string checking
  const hasSummary = Boolean(
    note.summary && 
    typeof note.summary === 'string' && 
    note.summary.trim().length > 0
  );
  
  const hasKeyPoints = Boolean(
    note.key_points && 
    typeof note.key_points === 'string' && 
    note.key_points.trim().length > 0
  );
  
  const hasMarkdown = Boolean(
    note.markdown_content && 
    typeof note.markdown_content === 'string' && 
    note.markdown_content.trim().length > 0
  );
  
  const hasImprovedClarity = Boolean(
    note.improved_content && 
    typeof note.improved_content === 'string' && 
    note.improved_content.trim().length > 0
  );
  
  // Check enhancement statuses
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';

  // Comprehensive debug logging with strict content validation
  console.log("🔍 EnhancementSelector - Enhanced content detection:", {
    noteId: note.id,
    timestamp: new Date().toISOString(),
    rawContentAnalysis: {
      improved_content: {
        exists: !!note.improved_content,
        type: typeof note.improved_content,
        length: note.improved_content?.length || 0,
        trimmedLength: note.improved_content?.trim()?.length || 0,
        firstChars: note.improved_content?.substring(0, 100) || 'none',
        isValidString: typeof note.improved_content === 'string' && note.improved_content.trim().length > 0
      },
      summary: {
        exists: !!note.summary,
        type: typeof note.summary,
        length: note.summary?.length || 0,
        trimmedLength: note.summary?.trim()?.length || 0,
        isValidString: typeof note.summary === 'string' && note.summary.trim().length > 0
      },
      key_points: {
        exists: !!note.key_points,
        type: typeof note.key_points,
        length: note.key_points?.length || 0,
        trimmedLength: note.key_points?.trim()?.length || 0,
        isValidString: typeof note.key_points === 'string' && note.key_points.trim().length > 0
      },
      markdown_content: {
        exists: !!note.markdown_content,
        type: typeof note.markdown_content,
        length: note.markdown_content?.length || 0,
        trimmedLength: note.markdown_content?.trim()?.length || 0,
        isValidString: typeof note.markdown_content === 'string' && note.markdown_content.trim().length > 0
      }
    },
    finalDetection: {
      hasImprovedClarity,
      hasSummary,
      hasKeyPoints,
      hasMarkdown
    },
    timestamps: {
      improved_content_generated_at: note.improved_content_generated_at,
      summary_generated_at: note.summary_generated_at,
      key_points_generated_at: note.key_points_generated_at,
      markdown_content_generated_at: note.markdown_content_generated_at
    },
    activeContentType,
    summaryStatus
  });

  // Define enhancement options with improved availability logic
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

  console.log("📋 EnhancementSelector - Final tab availability:", {
    totalOptions: enhancementOptions.length,
    availableCount: availableOptions.length,
    availableOptions: availableOptions.map(opt => ({
      id: opt.id,
      label: opt.label,
      isGenerating: opt.isGenerating,
      hasError: opt.hasError
    })),
    activeTab: activeContentType,
    shouldShowImprovedClarity: hasImprovedClarity,
    improvedClarityValidation: {
      contentExists: !!note.improved_content,
      contentType: typeof note.improved_content,
      contentTrimmed: note.improved_content?.trim()?.length || 0,
      passesAllChecks: hasImprovedClarity
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
        <p className="text-xs text-muted-foreground mt-1">
          {availableOptions.length} of {enhancementOptions.length} available
        </p>
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
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="px-4 py-2 text-xs text-gray-500 border-t border-border mt-2">
            <div>Debug: Improved={hasImprovedClarity ? '✓' : '✗'}</div>
            <div>Content Length: {note.improved_content?.length || 0}</div>
          </div>
        )}
      </div>
    </div>
  );
};
