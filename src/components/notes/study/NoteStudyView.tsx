
import { Card } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { EnhancementTabs } from "./EnhancementTabs";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useRealtimeNoteSync } from "./hooks/useRealtimeNoteSync";
import { useNoteUpdateHandler } from "./hooks/useNoteUpdateHandler";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const {
    fontSize,
    textAlign,
    isFullWidth,
    isFullScreen,
    activeTab,
    setActiveTab,
    increaseFontSize,
    decreaseFontSize,
    changeTextAlign,
    toggleWidth,
    toggleFullScreen,
  } = useStudyViewState();

  const {
    isEditing,
    editableTitle,
    editableContent,
    selectedTags,
    availableTags,
    isSaving,
    toggleEditing,
    handleTitleChange,
    handleContentChange,
    handleSaveContent,
    handleEnhanceContent,
    setSelectedTags,
  } = useNoteStudyEditor(note);

  useRealtimeNoteSync(note.id);
  const syncedNote = useNoteUpdateHandler(note);

  const containerClasses = isFullScreen
    ? "fixed inset-0 z-50 bg-background"
    : isFullWidth
    ? "w-full"
    : "max-w-4xl mx-auto";

  return (
    <div className={containerClasses}>
      <Card className="h-full flex flex-col bg-card border border-border shadow-lg">
        <StudyViewHeader
          note={syncedNote}
          fontSize={fontSize}
          textAlign={textAlign}
          isFullWidth={isFullWidth}
          isFullScreen={isFullScreen}
          isEditing={isEditing}
          isSaving={isSaving}
          editableTitle={editableTitle}
          onIncreaseFontSize={increaseFontSize}
          onDecreaseFontSize={decreaseFontSize}
          onChangeTextAlign={changeTextAlign}
          onToggleWidth={toggleWidth}
          onToggleFullScreen={toggleFullScreen}
          onToggleEditing={toggleEditing}
          onSave={handleSaveContent}
          onTitleChange={handleTitleChange}
          onEnhance={handleEnhanceContent}
          onTabSwitch={setActiveTab}
        />

        <div className="flex-1 overflow-hidden">
          <EnhancementTabs
            note={syncedNote}
            fontSize={fontSize}
            textAlign={textAlign}
            isEditing={isEditing}
            editableContent={editableContent}
            editableTitle={editableTitle}
            selectedTags={selectedTags}
            availableTags={availableTags}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onContentChange={handleContentChange}
            onTitleChange={handleTitleChange}
            onTagsChange={setSelectedTags}
            onSave={handleSaveContent}
            onEnhance={handleEnhanceContent}
          />
        </div>
      </Card>
    </div>
  );
};
