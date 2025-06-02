
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
  
  // Check if there are any enhancements
  const hasSummary = !!note.summary && !!note.summary_generated_at;
  const hasKeyPoints = !!note.key_points && !!note.key_points_generated_at;
  const hasMarkdown = !!note.markdown_content && !!note.markdown_content_generated_at;
  const hasImprovedClarity = !!note.improved_content && !!note.improved_content_generated_at;
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
    summaryTimestamp: note.summary_generated_at,
    keyPointsTimestamp: note.key_points_generated_at,
    activeContentType,
    isLoading
  });
  
  // Auto-switch to the appropriate tab when new content is generated
  useEffect(() => {
    // Switch to summary tab when new summary is generated
    if (hasSummary && activeContentType === 'original' && note.summary_generated_at) {
      console.log("Auto-switching to summary tab because new summary was generated");
      setActiveContentType('summary');
      return;
    }
    
    // Switch to key points tab when new key points are generated
    if (hasKeyPoints && activeContentType === 'original' && note.key_points_generated_at) {
      console.log("Auto-switching to key points tab because new key points were generated");
      setActiveContentType('keyPoints');
      return;
    }
    
    // Switch to markdown tab when new markdown is generated
    if (hasMarkdown && activeContentType === 'original' && note.markdown_content_generated_at) {
      console.log("Auto-switching to markdown tab because new markdown was generated");
      setActiveContentType('markdown');
      return;
    }
    
    // Switch to improved content tab when new improved content is generated
    if (hasImprovedClarity && activeContentType === 'original' && note.improved_content_generated_at) {
      console.log("Auto-switching to improved content tab because new improved content was generated");
      setActiveContentType('improved');
      return;
    }
  }, [
    hasSummary, 
    hasKeyPoints, 
    hasMarkdown, 
    hasImprovedClarity, 
    note.summary_generated_at, 
    note.key_points_generated_at,
    note.markdown_content_generated_at,
    note.improved_content_generated_at,
    activeContentType
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
