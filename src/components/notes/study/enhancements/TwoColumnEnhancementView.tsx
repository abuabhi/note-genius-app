
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
  activeContentType: EnhancementContentType;
  setActiveContentType: (type: EnhancementContentType) => void;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => Promise<void>;
  onCancelEnhancement?: () => void;
  isEditOperation?: boolean;
}

export const TwoColumnEnhancementView = ({ 
  note, 
  fontSize, 
  textAlign,
  activeContentType,
  setActiveContentType,
  isLoading = false,
  onRetryEnhancement,
  onCancelEnhancement,
  isEditOperation = false
}: TwoColumnEnhancementViewProps) => {
  const wasManuallySelected = useRef(false);
  const lastAutoSwitchTimestamp = useRef<number>(0);
  const previousNoteId = useRef<string>(note.id);
  const previousKeyPointsLength = useRef<number>(note.key_points?.length || 0);
  const previousSummaryLength = useRef<number>(note.summary?.length || 0);
  const previousImprovedLength = useRef<number>(note.improved_content?.length || 0);
  const previousMarkdownLength = useRef<number>(note.markdown_content?.length || 0);
  
  // Reset state when note changes
  useEffect(() => {
    if (previousNoteId.current !== note.id) {
      console.log("📝 Note changed, resetting enhancement view state");
      setActiveContentType('original');
      wasManuallySelected.current = false;
      lastAutoSwitchTimestamp.current = 0;
      previousNoteId.current = note.id;
      previousKeyPointsLength.current = note.key_points?.length || 0;
      previousSummaryLength.current = note.summary?.length || 0;
      previousImprovedLength.current = note.improved_content?.length || 0;
      previousMarkdownLength.current = note.markdown_content?.length || 0;
    }
  }, [note.id, setActiveContentType]);
  
  // FIXED: More strict validation that prevents treating generating/pending states as having content
  const hasSummary = Boolean(
    note.summary && 
    typeof note.summary === 'string' && 
    note.summary.trim().length > 10 &&
    note.summary_status === 'completed' &&
    !note.summary.includes('Generating') &&
    !note.summary.includes('Processing')
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
    note.improved_content.trim().length > 20 &&
    note.improved_content_generated_at &&
    note.enhancement_type === 'clarity'
  );
  
  // CRITICAL FIX: Never consider generating/pending states as valid content
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';
  
  console.log("🔍 TwoColumnEnhancementView - FIXED state analysis:", {
    noteId: note.id,
    timestamp: new Date().toISOString(),
    isEditOperation,
    activeContentType,
    summaryValidation: {
      rawSummary: note.summary?.substring(0, 50) || 'none',
      hasSummaryContent: !!note.summary,
      hasValidLength: note.summary && note.summary.trim().length > 10,
      statusIsCompleted: summaryStatus === 'completed',
      doesNotContainGenerating: !note.summary?.includes('Generating'),
      doesNotContainProcessing: !note.summary?.includes('Processing'),
      finalValidation: hasSummary
    },
    contentStates: {
      summary: { valid: hasSummary, generating: isGeneratingSummary, error: hasSummaryError },
      keyPoints: { valid: hasKeyPoints },
      markdown: { valid: hasMarkdown },
      improvedClarity: { valid: hasImprovedClarity }
    }
  });

  // Handle manual tab selection
  const handleManualTabChange = (type: EnhancementContentType) => {
    console.log(`🎯 Manual tab selection: ${type} (from: ${activeContentType})`);
    wasManuallySelected.current = true;
    setActiveContentType(type);
    
    // Reset manual flag after a delay
    setTimeout(() => {
      console.log("🔄 Resetting manual selection flag");
      wasManuallySelected.current = false;
    }, 5000);
  };
  
  // COMPLETELY DISABLED auto-switching logic during edit operations or summary generation
  useEffect(() => {
    // CRITICAL FIX: Completely prevent auto-switching during edit operations OR when summary is generating
    if (isEditOperation || isGeneratingSummary) {
      console.log("🚫 Auto-switching disabled:", { isEditOperation, isGeneratingSummary });
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastAutoSwitch = currentTime - lastAutoSwitchTimestamp.current;
    
    // Check if new content was generated by comparing lengths
    const currentKeyPointsLength = note.key_points?.length || 0;
    const currentSummaryLength = note.summary?.length || 0;
    const currentImprovedLength = note.improved_content?.length || 0;
    const currentMarkdownLength = note.markdown_content?.length || 0;
    
    const newKeyPointsGenerated = currentKeyPointsLength > previousKeyPointsLength.current && hasKeyPoints;
    const newSummaryGenerated = currentSummaryLength > previousSummaryLength.current && hasSummary;
    const newImprovedGenerated = currentImprovedLength > previousImprovedLength.current && hasImprovedClarity;
    const newMarkdownGenerated = currentMarkdownLength > previousMarkdownLength.current && hasMarkdown;
    
    // Update previous lengths
    previousKeyPointsLength.current = currentKeyPointsLength;
    previousSummaryLength.current = currentSummaryLength;
    previousImprovedLength.current = currentImprovedLength;
    previousMarkdownLength.current = currentMarkdownLength;

    // Don't auto-switch if user manually selected or recent auto-switch occurred
    if (wasManuallySelected.current || timeSinceLastAutoSwitch < 2000) {
      return;
    }
    
    // FIXED: Only auto-switch when truly NEW content is generated and completed
    if (newKeyPointsGenerated) {
      console.log("🔑 Auto-switching to key points tab - NEW content detected");
      setActiveContentType('keyPoints');
      lastAutoSwitchTimestamp.current = currentTime;
      return;
    }
    
    if (newImprovedGenerated) {
      console.log("✨ Auto-switching to improved clarity tab - NEW content detected");
      setActiveContentType('improved');
      lastAutoSwitchTimestamp.current = currentTime;
      return;
    }
    
    if (newSummaryGenerated && !isGeneratingSummary) {
      console.log("📄 Auto-switching to summary tab - NEW content detected");
      setActiveContentType('summary');
      lastAutoSwitchTimestamp.current = currentTime;
      return;
    }
    
    if (newMarkdownGenerated) {
      console.log("📋 Auto-switching to markdown tab - NEW content detected");
      setActiveContentType('markdown');
      lastAutoSwitchTimestamp.current = currentTime;
      return;
    }
  }, [
    hasImprovedClarity,
    hasKeyPoints, 
    hasSummary, 
    hasMarkdown, 
    activeContentType, 
    isGeneratingSummary,
    setActiveContentType,
    isEditOperation,
    note.enhancement_type,
    note.improved_content_generated_at,
    note.key_points_generated_at,
    note.summary_generated_at,
    note.markdown_content_generated_at,
    note.improved_content,
    note.key_points,
    note.summary,
    note.markdown_content
  ]);

  return (
    <div className="flex flex-col md:flex-row w-full rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white min-h-[500px]">
      {/* Left sidebar for content selector */}
      <EnhancementSelector
        note={note}
        activeContentType={activeContentType}
        setActiveContentType={handleManualTabChange}
        className="w-full md:w-64 md:min-w-64 shrink-0"
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
        className="flex-1 min-h-0"
      />
    </div>
  );
};
