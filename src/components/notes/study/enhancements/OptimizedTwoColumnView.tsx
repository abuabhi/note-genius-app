
import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementSelector, EnhancementContentType } from "./EnhancementSelector";
import { EnhancementDisplayPanel } from "./EnhancementDisplayPanel";
import { useEnrichmentProcessor } from "@/hooks/noteEnrichment/useEnrichmentProcessor";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import { useStuckEnhancementDetection } from "@/hooks/useStuckEnhancementDetection";
import { extractErrorMessage, logErrorWithContext } from "@/utils/errorUtils";

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
  const [enhancedContents, setEnhancedContents] = useState<Record<string, string>>({});
  const { isLoading, processEnhancement } = useEnrichmentProcessor();
  const { refreshNotes } = useOptimizedNotes();
  const { resetStuckEnhancements } = useStuckEnhancementDetection(note.id);

  // Force refresh the note data when component mounts and reset any stuck states
  useEffect(() => {
    console.log("🔄 Refreshing note data and checking for stuck enhancements");
    resetStuckEnhancements();
    refreshNotes();
  }, [refreshNotes, resetStuckEnhancements]);

  const handleRetryEnhancement = async (enhancementType: string) => {
    console.log("🚀 BUTTON CLICKED - Starting enhancement generation:", enhancementType);
    console.log("🔧 Process Enhancement Function Check:", typeof processEnhancement);
    console.log("🔧 Note Content Check:", { noteId: note.id, hasContent: !!note.content, contentLength: note.content?.length });
    
    try {
      console.log("📞 CALLING processEnhancement with:", {
        noteId: note.id,
        content: note.content?.substring(0, 100) + '...',
        enhancementType,
        title: note.title
      });
      
      const result = await processEnhancement(
        note.id,
        note.content || '',
        enhancementType as any,
        note.title
      );
      
      console.log("📩 Enhancement result received:", result);
      
      if (result.success) {
        // Store content in local state for immediate UI updates
        setEnhancedContents(prev => ({
          ...prev,
          [enhancementType]: result.content
        }));
        
        // Refresh the note data from database to ensure UI shows persisted data
        console.log("🔄 Refreshing note from database after enhancement");
        await refreshNotes();
        
        // Force switch to the newly generated content tab for immediate feedback
        if (enhancementType === 'summarize') setActiveContentType('summary');
        else if (enhancementType === 'extract-key-points') setActiveContentType('keyPoints');
        else if (enhancementType === 'generate-questions') setActiveContentType('questions');
        else if (enhancementType === 'convert-to-markdown') setActiveContentType('markdown');
        else if (enhancementType === 'enrich-note') setActiveContentType('enriched');
        
        console.log("✅ Enhancement completed, saved to database, UI refreshed, and tab switched");
      } else {
        console.error("❌ Enhancement failed:", result.error);
        // Keep error in state for user feedback
        setEnhancedContents(prev => ({
          ...prev,
          [enhancementType]: `Error: ${result.error || 'Enhancement failed'}`
        }));
      }
    } catch (error) {
      console.error("💥 CRITICAL ERROR in handleRetryEnhancement:", error);
      logErrorWithContext(error, "Enhancement processing", { enhancementType, noteId: note.id });
      const errorInfo = extractErrorMessage(error);
      setEnhancedContents(prev => ({
        ...prev,
        [enhancementType]: `Error: ${errorInfo.message}`
      }));
    }
  };

  console.log("🎯 OptimizedTwoColumnView - Rendering with:", {
    noteId: note.id,
    activeContentType,
    isEditOperation,
    isLoading,
    enhancedContentsKeys: Object.keys(enhancedContents)
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
          onRetryEnhancement={handleRetryEnhancement}
          enhancedContents={enhancedContents}
          className="h-full"
        />
      </div>
    </div>
  );
};
