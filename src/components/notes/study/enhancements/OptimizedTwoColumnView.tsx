
import { useEffect } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementSelector, EnhancementContentType } from "./EnhancementSelector";
import { EnhancementDisplayPanel } from "./EnhancementDisplayPanel";
import { EnhancementFlowDebugger } from "../debug/EnhancementFlowDebugger";
import { EnhancementStatusIndicator } from "./EnhancementStatusIndicator";
import { EnhancementRecoveryButton } from "./EnhancementRecoveryButton";
import { UnifiedProgressIndicator } from "./UnifiedProgressIndicator";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import { useStuckEnhancementDetection } from "@/hooks/useStuckEnhancementDetection";
import { debugLogger } from "@/utils/debug/EnhancementDebugLogger";

interface OptimizedTwoColumnViewProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  activeContentType: EnhancementContentType;
  setActiveContentType: (type: EnhancementContentType) => void;
  onGenerateEnhancement?: (enhancementType: string) => Promise<void>;
  isEditOperation?: boolean;
  processingStage?: string;
  headerProcessingEnhancement?: string | null;
  // Enhancement status props
  isEnhancing?: boolean;
  isStuck?: boolean;
  lastRequestTime?: number | null;
  retryCount?: number;
  onForceReset?: () => void;
  processingTime?: number;
  enhancementStartTime?: number | null;
}

export const OptimizedTwoColumnView = ({
  note,
  fontSize,
  textAlign,
  activeContentType,
  setActiveContentType,
  onGenerateEnhancement,
  isEditOperation = false,
  processingStage,
  headerProcessingEnhancement,
  isEnhancing = false,
  isStuck = false,
  lastRequestTime = null,
  retryCount = 0,
  onForceReset,
  processingTime = 0,
  enhancementStartTime = null
}: OptimizedTwoColumnViewProps) => {
  const { refreshNotes } = useOptimizedNotes();
  const { resetStuckEnhancements } = useStuckEnhancementDetection(note.id);

  // Force refresh the note data when component mounts and reset any stuck states
  useEffect(() => {
    resetStuckEnhancements();
    refreshNotes();
  }, [refreshNotes, resetStuckEnhancements]);

  // State logging disabled for cleaner console

  return (
    <div className="flex h-full relative">
      {/* Simple processing indicator */}
      {isEnhancing && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Processing...</span>
        </div>
      )}
      
      {/* Left Panel - Enhancement Selector */}
      <div className="w-80 border-r bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <EnhancementSelector
          note={note}
          activeContentType={activeContentType}
          setActiveContentType={setActiveContentType}
        />
      </div>
      
      {/* Right Panel - Content Display */}
      <div className="flex-1 overflow-hidden">
        <EnhancementDisplayPanel
          note={note}
          contentType={activeContentType}
          fontSize={fontSize}
          textAlign={textAlign}
          onGenerateEnhancement={onGenerateEnhancement}
        />
      </div>
    </div>
  );
};
