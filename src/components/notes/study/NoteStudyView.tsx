
import { Card } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { EnhancementTabs } from "./EnhancementTabs";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useRealtimeNoteSync } from "./hooks/useRealtimeNoteSync";
import { useState } from "react";

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
    setActiveContentType,
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

  const { currentNote } = useRealtimeNoteSync(note);
  const [activeTab, setActiveTab] = useState<string>("original");

  // Handler for tab switching when enhancement completes
  const handleTabSwitch = (tabId: string) => {
    setActiveTab(tabId);
  };

  const containerClasses = isFullScreen
    ? "fixed inset-0 z-50 bg-background"
    : isFullWidth
    ? "w-full"
    : "max-w-4xl mx-auto";

  return (
    <div className={containerClasses}>
      <Card className="h-full flex flex-col bg-card border border-border shadow-lg">
        <StudyViewHeader
          note={currentNote}
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
          onTabSwitch={handleTabSwitch}
        />

        <div className="flex-1 overflow-hidden">
          <EnhancementTabs
            note={currentNote}
            fontSize={fontSize}
            textAlign={textAlign}
            isEditing={isEditing}
          />
        </div>
      </Card>
    </div>
  );
};
