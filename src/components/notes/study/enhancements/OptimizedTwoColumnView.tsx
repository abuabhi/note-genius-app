
import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementSelector, EnhancementContentType } from "./EnhancementSelector";
import { EnhancementDisplayPanel } from "./EnhancementDisplayPanel";
import { useEnrichmentProcessor } from "@/hooks/noteEnrichment/useEnrichmentProcessor";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
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

  // Force refresh the note data when component mounts to get latest content
  useEffect(() => {
    console.log("🔄 Refreshing note data to get latest enhancements");
    refreshNotes();
  }, [refreshNotes]);

  const handleRetryEnhancement = async (enhancementType: string) => {
    console.log("🚀 Starting enhancement generation:", enhancementType);
    
    try {
      const result = await processEnhancement(
        note.id,
        note.content || '',
        enhancementType as any,
        note.title
      );
      
      if (result.success) {
        // Store content in local state for immediate UI updates
        setEnhancedContents(prev => ({
          ...prev,
          [enhancementType]: result.content
        }));
        
        // Refresh the note data from database to ensure UI shows persisted data
        console.log("🔄 Refreshing note from database after enhancement");
        await refreshNotes();
        
        console.log("✅ Enhancement completed, saved to database, and UI refreshed");
      } else {
        console.error("❌ Enhancement failed:", result.error);
        // Keep error in state for user feedback
        setEnhancedContents(prev => ({
          ...prev,
          [enhancementType]: `Error: ${result.error || 'Enhancement failed'}`
        }));
      }
    } catch (error) {
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
          isLoading={isLoading}
          onRetryEnhancement={handleRetryEnhancement}
          enhancedContents={enhancedContents}
          className="h-full"
        />
      </div>
    </div>
  );
};
