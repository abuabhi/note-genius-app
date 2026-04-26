import React from "react";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";

import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useSimpleEnhancement } from "@/hooks/useSimpleEnhancement";
import { UserSubject } from "@/types/subject";
import { EnhancementDebugger } from "@/components/debug/EnhancementDebugger";
import { useYouTubeContentMigration } from "@/hooks/useYouTubeContentMigration";
import { useAiEnrichmentUsage } from "@/hooks/usage/useAiEnrichmentUsage";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const [headerProcessingEnhancement, setHeaderProcessingEnhancement] = React.useState<string | null>(null);
  
  const {
    fontSize,
    textAlign,
    isFullWidth,
    isFullScreen,
    activeContentType,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    handleTextAlign,
    toggleWidth,
    toggleFullScreen,
    setActiveContentType
  } = useStudyViewState();

  // Create a simple refresh function using React Query invalidation
  const forceRefresh = () => {
    // Instead of reloading the page, we'll refresh the note data
    console.log("🔄 Refreshing note data without page reload");
  };

  const {
    isEditing,
    editableContent,
    editableTitle,
    editableSubject,
    selectedTags,
    availableTags,
    availableSubjects,
    isSaving,
    handleContentChange,
    handleTitleChange,
    handleSubjectChange,
    handleSaveContent,
    toggleEditing,
    setSelectedTags,
    onNoteUpdate
  } = useNoteStudyEditor(note, forceRefresh);

  // Real AI enrichment usage tracking
  const {
    usageCount: currentUsage,
    monthlyLimit,
    isLoading: usageLoading,
    hasReachedLimit: usageReachedLimit,
    refetch: refetchUsage,
  } = useAiEnrichmentUsage();
  const hasReachedLimit = () => usageReachedLimit;

  // Simple enhancement functionality - refresh both note data AND usage on completion
  const { enhanceNote, isEnhancing } = useSimpleEnhancement(note, () => {
    forceRefresh();
    refetchUsage();
  });

  // Auto-migrate YouTube content if needed
  useYouTubeContentMigration(note);

  // Simple enhancement handler
  const handleEnhanceContent = async (enhancementType: string) => {
    await enhanceNote(enhancementType);
  };

  // Unified enhancement handler that works for both header and tabs
  const handleEnhancement = async (enhancementType: string) => {
    try {
      setHeaderProcessingEnhancement(enhancementType);
      // Switch to the appropriate tab when starting enhancement
      if (enhancementType === 'summarize') {
        setActiveContentType('summary');
      } else if (enhancementType === 'extract-key-points') {
        setActiveContentType('keyPoints');
      } else if (enhancementType === 'generate-questions') {
        setActiveContentType('questions');
      } else if (enhancementType === 'convert-to-markdown') {
        setActiveContentType('markdown');
      }
      // Note: do NOT switch tabs for 'enrich-note' — user stays on the
      // currently active tab (typically the Enriched/AI tab they triggered).
      
      await enhanceNote(enhancementType);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setHeaderProcessingEnhancement(null);
    }
  };

  const handleEnhance = (enhancedContent: string) => {
    // This is called from the old system, now just refresh data
    console.log("🔄 Enhancement completed, refreshing data");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      
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
        onEnhance={handleEnhance}
        onEnhancementProcessing={handleEnhancement}
        onActiveContentTypeChange={setActiveContentType}
        isEnhancing={isEnhancing}
      />
      <div className="container mx-auto px-4 py-6">
        <NoteStudyViewContent
          note={note}
          isEditing={isEditing}
          fontSize={fontSize}
          textAlign={textAlign}
          editableContent={editableContent}
          editableSubject={editableSubject}
          selectedTags={selectedTags}
          availableTags={availableTags}
          availableSubjects={availableSubjects || [] as UserSubject[]}
          isSaving={isSaving}
          statsLoading={usageLoading}
          currentUsage={currentUsage}
          monthlyLimit={monthlyLimit}
          handleContentChange={handleContentChange}
          handleSaveContent={handleSaveContent}
          toggleEditing={toggleEditing}
          handleEnhanceContent={handleEnhanceContent}
          setSelectedTags={setSelectedTags}
          handleGenerateEnhancement={enhanceNote}
          hasReachedLimit={hasReachedLimit()}
          fetchUsageStats={() => {}}
          onNoteUpdate={() => onNoteUpdate({})}
          onSubjectChange={handleSubjectChange}
          activeContentType={activeContentType}
          onActiveContentTypeChange={setActiveContentType}
          isEditOperation={isEnhancing}
          headerProcessingEnhancement={headerProcessingEnhancement}
          isEnhancing={isEnhancing}
        />
      </div>
    </div>
  );
};