
import React from "react";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";

import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { useNoteEnhancementGenerate } from "./hooks/useNoteEnhancementGenerate";
import { UserSubject } from "@/types/subject";
import { EnhancementDebugger } from "@/components/debug/EnhancementDebugger";
import { useYouTubeContentMigration } from "@/hooks/useYouTubeContentMigration";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
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

  // Create a simple refresh function
  const forceRefresh = () => {
    window.location.reload();
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

  // Use enhancement hooks for the missing functionality
  const {
    currentUsage,
    monthlyLimit,
    hasReachedLimit,
    enrichNote,
    processingStage
  } = useNoteEnrichment(note);

  const {
    handleGenerateEnhancement,
    isEnhancing
  } = useNoteEnhancementGenerate(note, forceRefresh);

  // Auto-migrate YouTube content if needed
  useYouTubeContentMigration(note);

  // Handle enhancement
  const handleEnhanceContent = async (enhancementType: string) => {
    try {
      await enrichNote(note.id, note.content || '', enhancementType as any, note.title);
    } catch (error) {
      console.error('Enhancement failed:', error);
    }
  };

  const handleEnhance = (enhancedContent: string) => {
    handleEnhanceContent('improve');
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
          statsLoading={false}
          currentUsage={currentUsage}
          monthlyLimit={monthlyLimit}
          handleContentChange={handleContentChange}
          handleSaveContent={handleSaveContent}
          toggleEditing={toggleEditing}
          handleEnhanceContent={handleEnhanceContent}
          setSelectedTags={setSelectedTags}
          handleGenerateEnhancement={handleGenerateEnhancement}
          hasReachedLimit={hasReachedLimit()}
          fetchUsageStats={() => {}}
          onNoteUpdate={onNoteUpdate}
          onSubjectChange={handleSubjectChange}
          activeContentType={activeContentType}
          onActiveContentTypeChange={setActiveContentType}
          isEditOperation={isEnhancing}
          processingStage={processingStage}
        />
      </div>
    </div>
  );
};
