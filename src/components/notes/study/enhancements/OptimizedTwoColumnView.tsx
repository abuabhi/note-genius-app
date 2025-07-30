
import { useEffect } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementSelector, EnhancementContentType } from "./EnhancementSelector";
import { EnhancementDisplayPanel } from "./EnhancementDisplayPanel";
import { EnhancementFlowDebugger } from "../debug/EnhancementFlowDebugger";
import { EnhancementStatusIndicator } from "./EnhancementStatusIndicator";
import { EnhancementProgressIndicator } from "./EnhancementProgressIndicator";
import { EnhancementRecoveryButton } from "./EnhancementRecoveryButton";
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
    <div className="relative">
      {/* Real-time Enhancement Progress Indicator */}
      {isEnhancing && enhancementStartTime && (
        <div className="mb-4">
          <EnhancementProgressIndicator
            isEnhancing={isEnhancing}
            enhancementStartTime={enhancementStartTime}
            processingTime={processingTime}
            enhancementType={headerProcessingEnhancement || undefined}
          />
        </div>
      )}
      
      {/* Recovery Button for stuck or slow enhancements */}
      {onForceReset && (
        <EnhancementRecoveryButton
          onRecovery={onForceReset}
          isVisible={isStuck || (processingTime > 30000)}
          elapsedTime={processingTime}
        />
      )}
      
      {/* Legacy Enhancement Status Indicator for retries */}
      {retryCount > 0 && onForceReset && (
        <div className="mb-4">
          <EnhancementStatusIndicator
            isEnhancing={isEnhancing}
            isStuck={isStuck}
            lastRequestTime={lastRequestTime}
            retryCount={retryCount}
            onForceReset={onForceReset}
          />
        </div>
      )}
      
      <div className="flex h-full bg-white rounded-lg shadow-sm border border-mint-100 overflow-hidden">
        {/* Left Column: Enhancement Selector - Always show all tabs */}
        <div className="w-72 flex-shrink-0">
          <EnhancementSelector
            note={note}
            activeContentType={activeContentType}
            setActiveContentType={setActiveContentType}
            className="h-full"
            headerProcessingEnhancement={headerProcessingEnhancement}
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
            isEnhancing={isEditOperation}
            onGenerateEnhancement={onGenerateEnhancement}
            className="h-full"
            processingStage={processingStage}
          />
        </div>
      </div>
      
      {/* Debug Helper - always available for troubleshooting */}
      <EnhancementFlowDebugger
        note={note}
        isEnhancing={isEditOperation}
        onGenerateEnhancement={onGenerateEnhancement}
      />
    </div>
  );
};
