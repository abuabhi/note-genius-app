import { useState, useEffect, useRef } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { EnhancementSelector, EnhancementContentType } from "./EnhancementSelector";
import { EnhancementDisplayPanel } from "./EnhancementDisplayPanel";

interface TwoColumnEnhancementViewProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isEditing: boolean;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => void;
  onCancelEnhancement?: () => void;
}

export const TwoColumnEnhancementView = ({ 
  note, 
  fontSize, 
  textAlign,
  isEditing,
  isLoading = false,
  onRetryEnhancement,
  onCancelEnhancement
}: TwoColumnEnhancementViewProps) => {
  const [activeContentType, setActiveContentType] = useState<EnhancementContentType>('original');
  const wasManuallySelected = useRef(false);
  const lastAutoSwitchTimestamp = useRef<number>(0);
  const previousNoteId = useRef<string>(note.id);
  
  // Reset state when note changes
  useEffect(() => {
    if (previousNoteId.current !== note.id) {
      console.log("📝 Note changed, resetting enhancement view state");
      setActiveContentType('original');
      wasManuallySelected.current = false;
      lastAutoSwitchTimestamp.current = 0;
      previousNoteId.current = note.id;
    }
  }, [note.id]);
  
  // Enhanced detection logic with better validation and minimum length requirements
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
  
  // Fixed: More robust improved content detection
  const hasImprovedClarity = Boolean(
    note.improved_content && 
    typeof note.improved_content === 'string' && 
    note.improved_content.trim().length > 20 &&
    note.improved_content_generated_at // Must have generation timestamp
  );
  
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';
  
  // Enhanced debug log to trace improved content detection
  console.log("🔍 TwoColumnEnhancementView - Enhanced state analysis (FIXED):", {
    noteId: note.id,
    timestamp: new Date().toISOString(),
    improvedContentValidation: {
      rawContent: note.improved_content?.substring(0, 100) || 'none',
      exists: !!note.improved_content,
      isString: typeof note.improved_content === 'string',
      length: note.improved_content?.length || 0,
      trimmedLength: note.improved_content?.trim()?.length || 0,
      hasTimestamp: !!note.improved_content_generated_at,
      timestamp: note.improved_content_generated_at,
      passesValidation: hasImprovedClarity
    },
    allContentStates: {
      summary: { valid: hasSummary, generating: isGeneratingSummary, error: hasSummaryError },
      keyPoints: { valid: hasKeyPoints },
      markdown: { valid: hasMarkdown },
      improvedClarity: { valid: hasImprovedClarity }
    },
    uiState: {
      activeContentType,
      isEditing,
      isLoading,
      wasManuallySelected: wasManuallySelected.current
    },
    retryFunction: {
      available: !!onRetryEnhancement,
      type: typeof onRetryEnhancement
    }
  });

  // Handle manual tab selection - this prevents auto-switching
  const handleManualTabChange = (type: EnhancementContentType) => {
    console.log(`🎯 Manual tab selection: ${type} (from: ${activeContentType})`);
    wasManuallySelected.current = true;
    setActiveContentType(type);
    
    // Reset manual flag after a delay to allow future auto-switching for new content
    setTimeout(() => {
      console.log("🔄 Resetting manual selection flag");
      wasManuallySelected.current = false;
    }, 5000);
  };
  
  // Enhanced auto-switch logic with better content detection
  useEffect(() => {
    const currentTime = Date.now();
    const timeSinceLastAutoSwitch = currentTime - lastAutoSwitchTimestamp.current;
    
    console.log("🔄 TwoColumnEnhancementView - Auto-switch evaluation (FIXED):", {
      isEditing,
      activeContentType,
      contentAvailability: {
        hasImprovedClarity,
        hasKeyPoints,
        hasSummary,
        hasMarkdown
      },
      switchingConstraints: {
        wasManuallySelected: wasManuallySelected.current,
        timeSinceLastAutoSwitch,
        shouldConsiderAutoSwitch: !isEditing && !wasManuallySelected.current && timeSinceLastAutoSwitch > 2000
      }
    });

    // Don't auto-switch if user is editing, manually selected, or recent auto-switch occurred
    if (isEditing || wasManuallySelected.current || timeSinceLastAutoSwitch < 2000) {
      return;
    }
    
    // Priority order for auto-switching: Improved Clarity > Key Points > Summary > Markdown
    // Only switch if currently on original tab to avoid disrupting user browsing
    if (activeContentType === 'original') {
      if (hasImprovedClarity) {
        console.log("✨ Auto-switching to improved clarity tab - content detected");
        setActiveContentType('improved');
        lastAutoSwitchTimestamp.current = currentTime;
        return;
      }
      
      if (hasKeyPoints) {
        console.log("🔑 Auto-switching to key points tab - content detected");
        setActiveContentType('keyPoints');
        lastAutoSwitchTimestamp.current = currentTime;
        return;
      }
      
      if (hasSummary && !isGeneratingSummary) {
        console.log("📄 Auto-switching to summary tab - content detected");
        setActiveContentType('summary');
        lastAutoSwitchTimestamp.current = currentTime;
        return;
      }
      
      if (hasMarkdown) {
        console.log("📋 Auto-switching to markdown tab - content detected");
        setActiveContentType('markdown');
        lastAutoSwitchTimestamp.current = currentTime;
        return;
      }
    }
  }, [
    hasImprovedClarity,
    hasKeyPoints, 
    hasSummary, 
    hasMarkdown, 
    activeContentType, 
    isGeneratingSummary, 
    isEditing,
    note.improved_content_generated_at,
    note.key_points_generated_at,
    note.summary_generated_at,
    note.markdown_content_generated_at,
    note.improved_content,
    note.key_points,
    note.summary,
    note.markdown_content
  ]);
  
  // Reset to original tab when editing starts
  useEffect(() => {
    if (isEditing) {
      console.log("✏️ Editing mode started - resetting to original tab");
      setActiveContentType("original");
      wasManuallySelected.current = false;
    }
  }, [isEditing]);

  // If editing, just show the original content
  if (isEditing) {
    return (
      <RichTextDisplay 
        content={note.content || note.description || ""} 
        fontSize={fontSize} 
        textAlign={textAlign} 
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full border border-border rounded-lg overflow-hidden min-h-[300px]">
      {/* Left sidebar for content selector */}
      <EnhancementSelector
        note={note}
        activeContentType={activeContentType}
        setActiveContentType={handleManualTabChange}
        className="w-full md:w-48 md:min-w-48"
      />
      
      {/* Right panel for content display */}
      <EnhancementDisplayPanel
        note={note}
        contentType={activeContentType}
        fontSize={fontSize}
        textAlign={textAlign}
        isLoading={isLoading}
        onRetryEnhancement={onRetryEnhancement}
        onCancelEnhancement={onCancelEnhancement}
        className="flex-grow p-4 overflow-y-auto"
      />
    </div>
  );
};
