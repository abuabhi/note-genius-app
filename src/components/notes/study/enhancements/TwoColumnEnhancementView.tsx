
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
  
  // Enhanced detection logic with more explicit checks
  const hasSummary = !!(note.summary && note.summary.trim() && note.summary.length > 0);
  const hasKeyPoints = !!(note.key_points && note.key_points.trim() && note.key_points.length > 0);
  const hasMarkdown = !!(note.markdown_content && note.markdown_content.trim() && note.markdown_content.length > 0);
  const hasImprovedClarity = !!(note.improved_content && note.improved_content.trim() && note.improved_content.length > 0);
  
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';
  
  // Comprehensive debug log to trace enhancement detection
  console.log("🔍 TwoColumnEnhancementView - Enhanced state analysis:", {
    noteId: note.id,
    timestamp: new Date().toISOString(),
    rawContent: {
      summary: note.summary?.substring(0, 50) || 'none',
      keyPoints: note.key_points?.substring(0, 50) || 'none',
      markdown: note.markdown_content?.substring(0, 50) || 'none',
      improvedClarity: note.improved_content?.substring(0, 50) || 'none'
    },
    enhancementStates: {
      summary: { exists: hasSummary, generating: isGeneratingSummary, error: hasSummaryError },
      keyPoints: { exists: hasKeyPoints, length: note.key_points?.length || 0 },
      markdown: { exists: hasMarkdown, length: note.markdown_content?.length || 0 },
      improvedClarity: { exists: hasImprovedClarity, length: note.improved_content?.length || 0 }
    },
    activeContentType,
    isEditing,
    isLoading,
    wasManuallySelected: wasManuallySelected.current,
    generatedTimestamps: {
      summary: note.summary_generated_at,
      keyPoints: note.key_points_generated_at,
      markdown: note.markdown_content_generated_at,
      improvedClarity: note.improved_content_generated_at
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
  
  // Auto-switch to the appropriate tab when new content is generated
  useEffect(() => {
    const currentTime = Date.now();
    const timeSinceLastAutoSwitch = currentTime - lastAutoSwitchTimestamp.current;
    
    console.log("🔄 TwoColumnEnhancementView - Auto-switch evaluation:", {
      isEditing,
      activeContentType,
      hasImprovedClarity,
      hasKeyPoints,
      hasSummary,
      hasMarkdown,
      wasManuallySelected: wasManuallySelected.current,
      timeSinceLastAutoSwitch,
      shouldConsiderAutoSwitch: !isEditing && !wasManuallySelected.current && timeSinceLastAutoSwitch > 2000
    });

    // Don't auto-switch if:
    // 1. User is editing
    // 2. User manually selected a tab recently
    // 3. Recent auto-switch occurred (prevent rapid switching)
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
