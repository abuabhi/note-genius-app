
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { UserSubject } from "@/types/subject";

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

  const {
    isEditing,
    isSaving,
    editableContent,
    editableTitle,
    editableSubject,
    selectedTags,
    availableTags,
    availableSubjects,
    statsLoading,
    currentUsage,
    monthlyLimit,
    hasReachedLimit,
    handleContentChange,
    handleSaveContent,
    toggleEditing,
    handleEnhanceContent,
    setSelectedTags,
    handleRetryEnhancement,
    fetchUsageStats,
    onNoteUpdate,
    onSubjectChange,
    onTitleChange,
    isEditOperation
  } = useNoteStudyEditor(note);

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
        onTitleChange={onTitleChange}
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
          statsLoading={statsLoading}
          currentUsage={currentUsage}
          monthlyLimit={monthlyLimit}
          handleContentChange={handleContentChange}
          handleSaveContent={handleSaveContent}
          toggleEditing={toggleEditing}
          handleEnhanceContent={handleEnhanceContent}
          setSelectedTags={setSelectedTags}
          handleRetryEnhancement={handleRetryEnhancement}
          hasReachedLimit={hasReachedLimit}
          fetchUsageStats={fetchUsageStats}
          onNoteUpdate={onNoteUpdate}
          onSubjectChange={onSubjectChange}
          activeContentType={activeContentType}
          onActiveContentTypeChange={setActiveContentType}
          isEditOperation={isEditOperation}
        />
      </div>
    </div>
  );
};
