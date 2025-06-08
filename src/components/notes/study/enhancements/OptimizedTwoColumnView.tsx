
import { useState, useEffect, useRef } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementSelector, EnhancementContentType } from "./EnhancementSelector";
import { EnhancementDisplayPanel } from "./EnhancementDisplayPanel";

interface OptimizedTwoColumnViewProps {
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

export const OptimizedTwoColumnView = ({ 
  note, 
  fontSize, 
  textAlign,
  activeContentType,
  setActiveContentType,
  isLoading = false,
  onRetryEnhancement,
  onCancelEnhancement,
  isEditOperation = false
}: OptimizedTwoColumnViewProps) => {
  const wasManuallySelected = useRef(false);
  const lastAutoSwitchTimestamp = useRef<number>(0);
  const previousNoteId = useRef<string>(note.id);
  
  // Reset state when note changes
  useEffect(() => {
    if (previousNoteId.current !== note.id) {
      console.log("📝 Note changed, resetting view state");
      setActiveContentType('original');
      wasManuallySelected.current = false;
      lastAutoSwitchTimestamp.current = 0;
      previousNoteId.current = note.id;
    }
  }, [note.id, setActiveContentType]);
  
  // Simplified content detection
  const hasEnhancements = {
    summary: Boolean(note.summary && note.summary.trim().length > 10),
    keyPoints: Boolean(note.key_points && note.key_points.trim().length > 10),
    improved: Boolean(note.improved_content && note.improved_content.trim().length > 20),
    markdown: Boolean(note.markdown_content && note.markdown_content.trim().length > 10)
  };

  // Handle manual tab selection
  const handleManualTabChange = (type: EnhancementContentType) => {
    console.log(`🎯 Manual tab selection: ${type}`);
    wasManuallySelected.current = true;
    setActiveContentType(type);
    
    // Reset manual flag after delay
    setTimeout(() => {
      wasManuallySelected.current = false;
    }, 3000);
  };
  
  // Simplified auto-switch logic
  useEffect(() => {
    if (isEditOperation || wasManuallySelected.current) return;

    const currentTime = Date.now();
    if (currentTime - lastAutoSwitchTimestamp.current < 1000) return;
    
    // Auto-switch to first available enhancement
    if (activeContentType === 'original') {
      if (hasEnhancements.keyPoints) {
        setActiveContentType('keyPoints');
        lastAutoSwitchTimestamp.current = currentTime;
      } else if (hasEnhancements.improved) {
        setActiveContentType('improved');
        lastAutoSwitchTimestamp.current = currentTime;
      } else if (hasEnhancements.summary) {
        setActiveContentType('summary');
        lastAutoSwitchTimestamp.current = currentTime;
      }
    }
  }, [
    hasEnhancements.keyPoints,
    hasEnhancements.improved, 
    hasEnhancements.summary,
    activeContentType, 
    setActiveContentType,
    isEditOperation
  ]);

  return (
    <div className="flex flex-col md:flex-row w-full rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white min-h-[500px]">
      {/* Content Selector */}
      <EnhancementSelector
        note={note}
        activeContentType={activeContentType}
        setActiveContentType={handleManualTabChange}
        className="w-full md:w-64 md:min-w-64 shrink-0"
      />
      
      {/* Content Display */}
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
