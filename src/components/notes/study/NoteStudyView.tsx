
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Note } from "@/types/note";
import { useStudyViewState, TextAlignType } from "./hooks/useStudyViewState";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteContentDisplay } from "./NoteContentDisplay";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView: React.FC<NoteStudyViewProps> = ({ note }) => {
  const {
    fontSize,
    isDarkMode,
    textAlign,
    isFullWidth,
    isFullScreen,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    toggleDarkMode,
    handleTextAlign,
    toggleWidth,
    toggleFullScreen
  } = useStudyViewState();
  
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/notes/edit/${note.id}`);
  };

  return (
    <Card
      className={`${isDarkMode ? 'bg-gray-900 text-gray-200 border-gray-700' : 'bg-white text-gray-800 border-gray-200'} ${
        isFullWidth ? "max-w-none" : "max-w-4xl mx-auto"
      } transition-all duration-300`}
    >
      <StudyViewHeader
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        isDarkMode={isDarkMode}
        isFullWidth={isFullWidth}
        isFullScreen={isFullScreen}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        onToggleDarkMode={toggleDarkMode}
        onChangeTextAlign={handleTextAlign}
        onToggleWidth={toggleWidth}
        onToggleFullScreen={toggleFullScreen}
        onEdit={handleEdit}
      />

      <CardContent className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        <NoteContentDisplay
          content={note.content || ''}
          fontSize={fontSize}
          textAlign={textAlign as TextAlignType}
          isDarkMode={isDarkMode}
          showScannedImage={note.sourceType === 'scan' && !!note.scanData?.originalImageUrl}
          scannedImageUrl={note.scanData?.originalImageUrl}
        />
      </CardContent>
    </Card>
  );
};
