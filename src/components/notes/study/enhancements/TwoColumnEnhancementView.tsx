
import { useState, useEffect } from "react";
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
  
  // Check if there are any enhancements - use more immediate detection
  const hasSummary = !!note.summary;
  const hasKeyPoints = !!note.key_points;
  const hasMarkdown = !!note.markdown_content;
  const hasImprovedClarity = !!note.improved_content;
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';
  
  // Debug log to trace enhancement detection
  console.log("TwoColumnEnhancementView - Enhancement detection:", {
    noteId: note.id,
    hasSummary,
    hasKeyPoints,
    hasMarkdown,
    hasImprovedClarity,
    summaryStatus,
    activeContentType,
    isLoading
  });
  
  // Auto-switch to the appropriate tab when new content is generated - immediate switching
  useEffect(() => {
    // Force immediate switch to summary when it becomes available
    if (hasSummary && !isGeneratingSummary && activeContentType === 'original') {
      console.log("Immediately switching to summary tab");
      setActiveContentType('summary');
      return;
    }
    
    // Force immediate switch to key points when they become available
    if (hasKeyPoints && activeContentType === 'original') {
      console.log("Immediately switching to key points tab");
      setActiveContentType('keyPoints');
      return;
    }
    
    // Force immediate switch to markdown when it becomes available
    if (hasMarkdown && activeContentType === 'original') {
      console.log("Immediately switching to markdown tab");
      setActiveContentType('markdown');
      return;
    }
    
    // Force immediate switch to improved content when it becomes available
    if (hasImprovedClarity && activeContentType === 'original') {
      console.log("Immediately switching to improved content tab");
      setActiveContentType('improved');
      return;
    }
  }, [hasSummary, hasKeyPoints, hasMarkdown, hasImprovedClarity, activeContentType, isGeneratingSummary]);
  
  // Reset to original tab when editing starts
  useEffect(() => {
    if (isEditing) {
      setActiveContentType("original");
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
        setActiveContentType={setActiveContentType}
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
