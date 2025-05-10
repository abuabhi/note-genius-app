
import { Note } from "@/types/note";
import { Card, CardContent } from "@/components/ui/card";
import { NoteContentDisplay } from "./NoteContentDisplay";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNavigate } from "react-router-dom";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const navigate = useNavigate();
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

  const handleEditNote = () => {
    navigate(`/notes/edit/${note.id}`);
  };

  return (
    <div className={`min-h-[calc(100vh-200px)] transition-colors ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <Card className={`border-0 shadow-none ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
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
          onEdit={handleEditNote}
        />

        <CardContent className="p-0">
          <div className={`py-6 ${isFullWidth ? 'px-4' : 'container max-w-3xl mx-auto px-4 md:px-0'}`}>
            <div className="mb-6">
              {note.description && (
                <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {note.description}
                </p>
              )}
            </div>

            <NoteContentDisplay 
              content={note.content || ""} 
              fontSize={fontSize}
              textAlign={textAlign}
              isDarkMode={isDarkMode}
              showScannedImage={note.sourceType === 'scan' && !!note.scanData?.originalImageUrl}
              scannedImageUrl={note.scanData?.originalImageUrl}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
