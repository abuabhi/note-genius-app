
import { useEffect } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementSelector, EnhancementContentType } from "./EnhancementSelector";
import { EnhancementDisplayPanel } from "./EnhancementDisplayPanel";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import { useStuckEnhancementDetection } from "@/hooks/useStuckEnhancementDetection";

interface OptimizedTwoColumnViewProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  activeContentType: EnhancementContentType;
  setActiveContentType: (type: EnhancementContentType) => void;
  onGenerateEnhancement?: (enhancementType: string) => Promise<void>;
  isEditOperation?: boolean;
  processingStage?: string;
}

export const OptimizedTwoColumnView = ({
  note,
  fontSize,
  textAlign,
  activeContentType,
  setActiveContentType,
  onGenerateEnhancement,
  isEditOperation = false,
  processingStage
}: OptimizedTwoColumnViewProps) => {
  const { refreshNotes } = useOptimizedNotes();
  const { resetStuckEnhancements } = useStuckEnhancementDetection(note.id);

  // Force refresh the note data when component mounts and reset any stuck states
  useEffect(() => {
    console.log("🔄 Refreshing note data and checking for stuck enhancements");
    resetStuckEnhancements();
    refreshNotes();
  }, [refreshNotes, resetStuckEnhancements]);

  console.log("🎯 OptimizedTwoColumnView - Rendering with:", {
    noteId: note.id,
    activeContentType,
    isEditOperation,
    onGenerateEnhancement: typeof onGenerateEnhancement
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
          isLoading={false}
          onRetryEnhancement={onGenerateEnhancement}
          className="h-full"
          processingStage={processingStage}
        />
      </div>
    </div>
  );
};
