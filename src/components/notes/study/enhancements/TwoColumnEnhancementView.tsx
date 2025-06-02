
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
  
  // Check if there are any enhancements - use immediate detection based on note data
  const hasSummary = !!note.summary;
  const hasKeyPoints = !!note.key_points;
  const hasMarkdown = !!note.markdown_content;
  const hasImprovedClarity = !!note.improved_content;
  const summaryStatus = note.summary_status || "completed";
  const isGeneratingSummary = summaryStatus === 'generating' || summaryStatus === 'pending';
  const hasSummaryError = summaryStatus === 'failed';
  
  // Debug log to trace enhancement detection with note ID for tracking
  console.log("TwoColumnEnhancementView - Enhancement detection:", {
    noteId: note.id,
    hasSummary,
    hasKeyPoints,
    hasMarkdown,
    hasImprovedClarity,
    summaryStatus,
    activeContentType,
    isLoading,
    noteUpdatedAt: note.updated_at
  });
  
  // Auto-switch to the appropriate tab when new content is generated
  useEffect(() => {
    // Don't auto-switch if user is currently viewing original content or if editing
    if (isEditing) return;
    
    // Priority order for auto-switching: Key Points > Summary > Markdown > Improved
    if (hasKeyPoints && activeContentType === 'original') {
      console.log("Auto-switching to key points tab - content detected");
      setActiveContentType('keyPoints');
      return;
    }
    
    if (hasSummary && !isGeneratingSummary && activeContentType === 'original') {
      console.log("Auto-switching to summary tab - content detected");
      setActiveContentType('summary');
      return;
    }
    
    if (hasMarkdown && activeContentType === 'original') {
      console.log("Auto-switching to markdown tab - content detected");
      setActiveContentType('markdown');
      return;
    }
    
    if (hasImprovedClarity && activeContentType === 'original') {
      console.log("Auto-switching to improved content tab - content detected");
      setActiveContentType('improved');
      return;
    }
  }, [
    hasKeyPoints, 
    hasSummary, 
    hasMarkdown, 
    hasImprovedClarity, 
    activeContentType, 
    isGeneratingSummary, 
    isEditing,
    note.updated_at // Add this dependency to react to note updates
  ]);
  
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
