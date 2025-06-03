
import { CheckCircle, AlertCircle, Loader2, FileText, List, Sparkles, Code, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Note } from "@/types/note";

export type EnhancementContentType = 'original' | 'summary' | 'keyPoints' | 'markdown' | 'improved';

interface EnhancementOption {
  id: EnhancementContentType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
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

  // Define enhancement options with improved styling and icons - reordered to put markdown below original
  const enhancementOptions: EnhancementOption[] = [
    {
      id: 'original',
      label: 'Original',
      icon: FileText,
      description: 'Your original note content',
      available: true
    },
    {
      id: 'markdown',
      label: 'Original++',
      icon: Code,
      description: 'Original note formatted',
      available: hasMarkdown
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: Target,
      description: 'AI-generated concise summary',
      available: hasSummary || isGeneratingSummary || hasSummaryError,
      isGenerating: isGeneratingSummary,
      hasError: hasSummaryError
    },
    {
      id: 'keyPoints',
      label: 'Key Points',
      icon: List,
      description: 'Essential highlights extracted',
      available: hasKeyPoints
    },
    {
      id: 'improved',
      label: 'Improved Clarity',
      icon: Sparkles,
      description: 'Enhanced notes version',
      available: hasImprovedClarity
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
    <div className={cn("flex flex-col border-r border-border bg-gradient-to-b from-mint-50/30 to-white", className)}>
      <div className="py-3 px-4 bg-gradient-to-r from-mint-100/50 to-mint-50/30 border-b border-mint-200/50 h-[73px] flex items-center">
        <h3 className="text-sm font-semibold text-mint-800">Content Views</h3>
      </div>
      <div className="flex flex-col py-2 space-y-1">
        {availableOptions.map((option) => {
          const Icon = option.icon;
          const isActive = activeContentType === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleTabClick(option.id)}
              className={cn(
                "group flex items-center justify-between px-4 py-3 text-sm transition-all duration-200 cursor-pointer relative",
                "hover:bg-mint-50/60 hover:shadow-sm",
                isActive 
                  ? "bg-mint-100/70 text-mint-900 font-semibold border-l-3 border-l-mint-500 shadow-sm" 
                  : "text-gray-700 border-l-3 border-l-transparent hover:text-mint-800 hover:border-l-mint-300"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-mint-600" : "text-mint-500 group-hover:text-mint-600"
                )} />
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className={cn(
                    "text-xs mt-0.5 transition-colors",
                    isActive ? "text-mint-700" : "text-gray-500 group-hover:text-mint-600"
                  )}>
                    {option.description}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {option.isGenerating && (
                  <Loader2 className="h-4 w-4 animate-spin text-mint-500" />
                )}
                {option.hasError && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                {!option.isGenerating && !option.hasError && isActive && (
                  <CheckCircle className="h-4 w-4 text-mint-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
