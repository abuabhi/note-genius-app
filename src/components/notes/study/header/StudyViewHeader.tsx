
import { Note } from "@/types/note";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudyViewControls } from "../controls/StudyViewControls";
import { Edit } from "lucide-react";
import { NoteTagList } from "../../details/NoteTagList";
import { TextAlignType } from "../hooks/useStudyViewState";

interface StudyViewHeaderProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isDarkMode: boolean;
  isFullWidth: boolean;
  isFullScreen: boolean;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onToggleDarkMode: () => void;
  onChangeTextAlign: (align: TextAlignType) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
  onEdit?: () => void;
}

export const StudyViewHeader = ({
  note,
  fontSize,
  textAlign,
  isDarkMode,
  isFullWidth,
  isFullScreen,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onToggleDarkMode,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen,
  onEdit
}: StudyViewHeaderProps) => {
  return (
    <CardHeader className={`flex flex-col gap-4 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{note.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{note.date}</span>
            <span>•</span>
            <span className="text-mint-600">{note.category}</span>
          </div>
          {note.tags && note.tags.length > 0 && (
            <div className="mt-2">
              <NoteTagList tags={note.tags} />
            </div>
          )}
        </div>
        {onEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit} 
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Note
          </Button>
        )}
      </div>

      <StudyViewControls 
        fontSize={fontSize}
        isDarkMode={isDarkMode}
        textAlign={textAlign}
        isFullWidth={isFullWidth}
        isFullScreen={isFullScreen}
        onIncreaseFontSize={onIncreaseFontSize}
        onDecreaseFontSize={onDecreaseFontSize}
        onToggleDarkMode={onToggleDarkMode}
        onChangeTextAlign={onChangeTextAlign}
        onToggleWidth={onToggleWidth}
        onToggleFullScreen={onToggleFullScreen}
      />
    </CardHeader>
  );
};
