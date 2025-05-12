
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteContentDisplay } from "./NoteContentDisplay";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { NoteStudyEditForm } from "./editor/NoteStudyEditForm";
import { useNotes } from "@/contexts/NoteContext";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useEnrichmentUsageStats } from "@/hooks/noteEnrichment/useEnrichmentUsageStats";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import { EnhancementTabs } from "./EnhancementTabs";
import { toast } from "sonner";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  // Use the custom hook for managing the study view state
  const {
    fontSize,
    textAlign,
    isFullWidth,
    isFullScreen,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    handleTextAlign,
    toggleWidth,
    toggleFullScreen,
  } = useStudyViewState();

  // Use the custom hook for managing the edit state
  const {
    isEditing,
    isSaving,
    editableContent,
    editableTitle,
    selectedTags,
    handleContentChange,
    handleTitleChange,
    handleSaveContent,
    toggleEditing,
    handleEnhanceContent,
    setSelectedTags
  } = useNoteStudyEditor(note);

  // Enhancement state for retry functionality
  const [enhancementLoading, setEnhancementLoading] = useState<boolean>(false);
  const { enrichNote } = useNoteEnrichment();

  // Get usage stats for enhancements
  const { 
    currentUsage, 
    monthlyLimit, 
    hasReachedLimit, 
    isLoading: statsLoading,
    fetchUsageStats
  } = useEnrichmentUsageStats();
  
  // Get available tags from the notes context
  const { getAllTags } = useNotes();
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);
  
  // Fetch usage stats when component mounts
  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  // Fetch available tags when component mounts
  useEffect(() => {
    const loadTags = async () => {
      const tags = await getAllTags();
      setAvailableTags(tags);
    };
    loadTags();
  }, [getAllTags]);

  // Handle retry for enhancement failures
  const handleRetryEnhancement = useCallback(async (enhancementType: string) => {
    if (!note.content) {
      toast.error("No content to enhance");
      return;
    }

    if (hasReachedLimit()) {
      toast.error("Monthly limit reached", {
        description: "You've reached your monthly limit for AI enhancements"
      });
      return;
    }

    setEnhancementLoading(true);

    try {
      let typeToApply: EnhancementFunction;
      
      // Map UI enhancement type string to function type
      switch (enhancementType) {
        case "summary": typeToApply = "summarize"; break;
        case "keyPoints": typeToApply = "extract-key-points"; break;
        case "markdown": typeToApply = "convert-to-markdown"; break;
        case "improved": typeToApply = "improve-clarity"; break;
        default: typeToApply = "improve-clarity";
      }
      
      // Call the enrichment function
      const result = await enrichNote(
        note.id,
        note.content,
        typeToApply,
        note.title || "Note"
      );
      
      if (result.success) {
        toast.success(`${enhancementType} generated successfully`);
        await fetchUsageStats(); // Refresh usage stats
      }
    } catch (error) {
      console.error("Error retrying enhancement:", error);
      toast.error("Failed to generate enhancement", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setEnhancementLoading(false);
    }
  }, [note, enrichNote, hasReachedLimit, fetchUsageStats]);
  
  // Render usage meter
  const renderUsageMeter = useCallback(() => {
    if (statsLoading) return null;
    
    if (monthlyLimit === null) {
      return (
        <div className="flex items-center text-xs text-mint-700 mb-2 gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Unlimited enhancements</span>
        </div>
      );
    }
    
    const percentage = Math.min(Math.round((currentUsage / monthlyLimit) * 100), 100);
    const isNearLimit = percentage > 80;
    const isAtLimit = percentage >= 100;
    
    return (
      <div className="mb-2 space-y-1">
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-mint-600" />
            <span className="text-mint-700">AI Usage</span>
          </div>
          <span className={`font-medium ${
            isAtLimit ? 'text-red-600' : 
            isNearLimit ? 'text-amber-600' : 
            'text-mint-700'
          }`}>
            {currentUsage}/{monthlyLimit}
          </span>
        </div>
        <Progress 
          value={percentage} 
          className={`h-1 ${
            isAtLimit ? 'bg-red-100' : 
            isNearLimit ? 'bg-amber-100' : 
            'bg-mint-100'
          }`} 
        />
      </div>
    );
  }, [currentUsage, monthlyLimit, statsLoading]);

  return (
    <Card
      className={`border-mint-100 mb-5 ${
        isFullWidth ? "max-w-none" : "max-w-4xl mx-auto"
      } ${isFullScreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
    >
      <StudyViewHeader
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        isFullWidth={isFullWidth}
        isFullScreen={isFullScreen}
        isEditing={isEditing}
        isSaving={isSaving}
        editableTitle={editableTitle}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        onChangeTextAlign={handleTextAlign}
        onToggleWidth={toggleWidth}
        onToggleFullScreen={toggleFullScreen}
        onToggleEditing={toggleEditing}
        onSave={handleSaveContent}
        onTitleChange={handleTitleChange}
        onEnhance={handleEnhanceContent}
      />

      <CardContent className="p-4 md:p-6">
        {/* Show usage meter */}
        {!isEditing && renderUsageMeter()}
        
        {isEditing ? (
          <NoteStudyEditForm
            note={note}
            editableContent={editableContent}
            selectedTags={selectedTags}
            availableTags={availableTags}
            isSaving={isSaving}
            handleContentChange={handleContentChange}
            handleSaveContent={handleSaveContent}
            toggleEditing={toggleEditing}
            handleEnhanceContent={handleEnhanceContent}
            setSelectedTags={setSelectedTags}
          />
        ) : (
          <EnhancementTabs
            note={note}
            fontSize={fontSize}
            textAlign={textAlign}
            isEditing={isEditing}
            isLoading={enhancementLoading}
            onRetryEnhancement={handleRetryEnhancement}
          />
        )}
      </CardContent>
    </Card>
  );
};
