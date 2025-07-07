
import { useState } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementSelector, EnhancementContentType } from "./EnhancementSelector";
import { EnhancementDisplayPanel } from "./EnhancementDisplayPanel";
import { useEnrichmentProcessor } from "@/hooks/noteEnrichment/useEnrichmentProcessor";

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
        setEnhancedContents(prev => ({
          ...prev,
          [enhancementType]: result.content
        }));
        console.log("✅ Enhancement completed and stored:", enhancementType);
      } else {
        console.error("❌ Enhancement failed:", result.error);
        // Keep error in state for user feedback
        setEnhancedContents(prev => ({
          ...prev,
          [enhancementType]: `Error: ${result.error}`
        }));
      }
    } catch (error) {
      console.error("❌ Enhancement processing error:", error);
      setEnhancedContents(prev => ({
        ...prev,
        [enhancementType]: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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
