
import { useState } from "react";
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
  onRetryEnhancement?: (enhancementType: string) => void;
  isEditOperation?: boolean;
}

export const OptimizedTwoColumnView = ({
  note,
  fontSize,
  textAlign,
  activeContentType,
  setActiveContentType,
  onRetryEnhancement,
  isEditOperation = false
}: OptimizedTwoColumnViewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRetryEnhancement = async (enhancementType: string) => {
    if (!onRetryEnhancement) return;
    
    console.log("🔄 OptimizedTwoColumnView - Starting enhancement:", enhancementType);
    setIsGenerating(true);
    
    try {
      await onRetryEnhancement(enhancementType);
      console.log("✅ OptimizedTwoColumnView - Enhancement completed:", enhancementType);
    } catch (error) {
      console.error("❌ OptimizedTwoColumnView - Enhancement failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  console.log("🎯 OptimizedTwoColumnView - Rendering with:", {
    noteId: note.id,
    activeContentType,
    isEditOperation,
    isGenerating,
    hasContent: {
      summary: Boolean(note.summary?.trim()),
      keyPoints: Boolean(note.key_points?.trim()),
      markdown: Boolean(note.markdown_content?.trim()),
      improved: Boolean(note.improved_content?.trim())
    }
  });

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border border-mint-100 overflow-hidden">
      {/* Left Column: Enhancement Selector - Always show all tabs */}
      <div className="w-72 flex-shrink-0">
        <EnhancementSelector
          note={note}
          activeContentType={activeContentType}
          setActiveContentType={setActiveContentType}
          className="h-full"
        />
      </div>

      {/* Right Column: Content Display */}
      <div className="flex-1 min-w-0">
        <EnhancementDisplayPanel
          note={note}
          contentType={activeContentType}
          fontSize={fontSize}
          textAlign={textAlign}
          isLoading={isGenerating}
          onRetryEnhancement={handleRetryEnhancement}
          className="h-full"
        />
      </div>
    </div>
  );
};
