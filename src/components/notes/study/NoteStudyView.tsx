
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Note } from "@/types/note";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";
import { NoteStudyEditForm } from "./editor/NoteStudyEditForm";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView: React.FC<NoteStudyViewProps> = ({ note }) => {
  const {
    fontSize,
    textAlign,
    isFullWidth,
    isFullScreen,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    handleTextAlign,
    toggleWidth,
    toggleFullScreen
  } = useStudyViewState();
  
  const {
    isEditing,
    editableContent,
    selectedTags,
    availableTags,
    isSaving,
    toggleEditing,
    handleContentChange,
    handleSaveContent,
    handleEnhanceContent,
    setSelectedTags
  } = useNoteStudyEditor(note);

  return (
    <Card
      className={`bg-white text-gray-800 border-gray-200 ${
        isFullWidth ? "max-w-none" : "max-w-4xl mx-auto"
      } transition-all duration-300`}
    >
      <StudyViewHeader
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        isFullWidth={isFullWidth}
        isFullScreen={isFullScreen}
        isEditing={isEditing}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        onChangeTextAlign={handleTextAlign}
        onToggleWidth={toggleWidth}
        onToggleFullScreen={toggleFullScreen}
        onToggleEditing={toggleEditing}
        onSave={handleSaveContent}
        isSaving={isSaving}
      />

      <CardContent className="p-6 text-gray-800">
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
          <NoteStudyViewContent
            note={note}
            fontSize={fontSize}
            textAlign={textAlign}
            handleEnhanceContent={handleEnhanceContent}
          />
        )}
      </CardContent>
    </Card>
  );
};
