
import { CheckCircle, AlertCircle, Loader2, FileText, List, Sparkles, Code, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Note } from "@/types/note";

export type EnhancementContentType = 'original' | 'summary' | 'keyPoints' | 'markdown' | 'improved';

interface EnhancementOption {
  id: EnhancementContentType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  hasContent: boolean;
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
  // Check if content exists and is meaningful
  const hasSummary = Boolean(
    note.summary && 
    typeof note.summary === 'string' && 
    note.summary.trim().length > 10
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
  
  const hasImprovedClarity = Boolean(
    note.improved_content && 
    typeof note.improved_content === 'string' && 
    note.improved_content.trim().length > 20
  );
  
  // Check enhancement statuses
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';

  console.log("🔍 EnhancementSelector - Content availability check:", {
    noteId: note.id,
    hasContent: {
      summary: hasSummary,
      keyPoints: hasKeyPoints,
      markdown: hasMarkdown,
      improvedClarity: hasImprovedClarity
    },
    summaryStatus,
    isGenerating: isGeneratingSummary,
    activeTab: activeContentType
  });

  // Define all enhancement options - ALWAYS show all tabs
  const enhancementOptions: EnhancementOption[] = [
    {
      id: 'original',
      label: 'Original',
      icon: FileText,
      description: 'Your original note content',
      hasContent: true // Original always has content
    },
    {
      id: 'markdown',
      label: 'Original++',
      icon: Code,
      description: 'Original note formatted',
      hasContent: hasMarkdown
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: Target,
      description: 'AI-generated concise summary',
      hasContent: hasSummary,
      isGenerating: isGeneratingSummary,
      hasError: hasSummaryError
    },
    {
      id: 'keyPoints',
      label: 'Key Points',
      icon: List,
      description: 'Essential highlights extracted',
      hasContent: hasKeyPoints
    },
    {
      id: 'improved',
      label: 'Improved Clarity',
      icon: Sparkles,
      description: 'Enhanced notes version',
      hasContent: hasImprovedClarity
    }
  ];

  console.log("📋 EnhancementSelector - All tabs always visible:", {
    totalTabs: enhancementOptions.length,
    tabStates: enhancementOptions.map(opt => ({
      id: opt.id,
      label: opt.label,
      hasContent: opt.hasContent,
      isGenerating: opt.isGenerating,
      hasError: opt.hasError
    })),
    activeTab: activeContentType
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
        {enhancementOptions.map((option) => {
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
                {!option.isGenerating && !option.hasError && option.hasContent && isActive && (
                  <CheckCircle className="h-4 w-4 text-mint-600" />
                )}
                {!option.hasContent && !option.isGenerating && !option.hasError && (
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
