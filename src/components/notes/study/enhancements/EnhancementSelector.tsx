
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
  // More robust detection with better null checking and string validation
  const hasSummary = Boolean(
    note.summary && 
    typeof note.summary === 'string' && 
    note.summary.trim().length > 10 // Minimum meaningful length
  );
  
  const hasKeyPoints = Boolean(
    note.key_points && 
    typeof note.key_points === 'string' && 
    note.key_points.trim().length > 10
  );
  
  const hasMarkdown = Boolean(
    note.markdown_content && 
    typeof note.markdown_content === 'string' && 
    note.markdown_content.trim().length > 10
  );
  
  // Fixed: More robust improved content detection
  const hasImprovedClarity = Boolean(
    note.improved_content && 
    typeof note.improved_content === 'string' && 
    note.improved_content.trim().length > 20 // Higher threshold for improved content
  );
  
  // Check enhancement statuses
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';

  // Enhanced debug logging with improved validation
  console.log("🔍 EnhancementSelector - Enhanced content detection (FIXED):", {
    noteId: note.id,
    timestamp: new Date().toISOString(),
    improvedContentAnalysis: {
      rawValue: note.improved_content,
      exists: !!note.improved_content,
      type: typeof note.improved_content,
      length: note.improved_content?.length || 0,
      trimmedLength: note.improved_content?.trim()?.length || 0,
      firstChars: note.improved_content?.substring(0, 100) || 'none',
      passesValidation: hasImprovedClarity,
      generatedAt: note.improved_content_generated_at
    },
    allEnhancementStates: {
      hasImprovedClarity,
      hasSummary,
      hasKeyPoints,
      hasMarkdown
    },
    activeContentType,
    summaryStatus
  });

  // Define enhancement options with corrected availability logic
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

  console.log("📋 EnhancementSelector - Final tab availability (FIXED):", {
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
      available: hasImprovedClarity,
      contentLength: note.improved_content?.length || 0,
      contentPreview: note.improved_content?.substring(0, 50) || 'none'
    }
  });

  const handleTabClick = (contentType: EnhancementContentType) => {
    console.log(`🎯 Tab clicked: ${contentType} (current: ${activeContentType})`);
    setActiveContentType(contentType);
  };

  return (
    <div className={cn("flex flex-col border-r border-border bg-muted/20", className)}>
      <div className="py-2 px-3 bg-muted/30 border-b border-border h-[73px] flex items-center">
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
