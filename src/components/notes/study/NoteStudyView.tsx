
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteContentDisplay } from "./NoteContentDisplay";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { NoteStudyEditForm } from "./editor/NoteStudyEditForm";
import { useNotes } from "@/contexts/NoteContext";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";

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
    increaseFontSize,
    decreaseFontSize,
    changeTextAlign,
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

  const { tags } = useNotes();

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
        onIncreaseFontSize={increaseFontSize}
        onDecreaseFontSize={decreaseFontSize}
        onChangeTextAlign={changeTextAlign}
        onToggleWidth={toggleWidth}
        onToggleFullScreen={toggleFullScreen}
        onToggleEditing={toggleEditing}
        onSave={handleSaveContent}
        onTitleChange={handleTitleChange}
        onEnhance={handleEnhanceContent} // Pass the enhance handler
      />

      <CardContent className="p-4 md:p-6">
        {isEditing ? (
          <NoteStudyEditForm
            note={note}
            editableContent={editableContent}
            selectedTags={selectedTags}
            availableTags={tags}
            isSaving={isSaving}
            handleContentChange={handleContentChange}
            handleSaveContent={handleSaveContent}
            toggleEditing={toggleEditing}
            handleEnhanceContent={handleEnhanceContent}
            setSelectedTags={setSelectedTags}
          />
        ) : (
          <NoteContentDisplay
            content={note.content || note.description || ""}
            fontSize={fontSize}
            textAlign={textAlign}
          />
        )}
      </CardContent>
    </Card>
  );
};
