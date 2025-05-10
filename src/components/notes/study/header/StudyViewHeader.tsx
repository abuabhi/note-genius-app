
import { Note } from "@/types/note";
import { Badge } from "@/components/ui/badge";
import { StudyViewControls } from "../controls/StudyViewControls";
import { getBestTextColor } from "../utils/colorUtils";

interface StudyViewHeaderProps {
  note: Note;
  fontSize: number;
  textAlign: string;
  isDarkMode: boolean;
  isFullWidth: boolean;
  isFullScreen: boolean;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onToggleDarkMode: () => void;
  onChangeTextAlign: (align: string) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
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
  onToggleFullScreen
}: StudyViewHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 p-4 backdrop-blur-md border-b border-mint-100 bg-opacity-90 bg-inherit">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{note.title}</h1>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <span className="mr-2">{note.date}</span>
            <span className="mr-2">·</span>
            <span className="text-mint-600">{note.category}</span>
          </div>
        </div>

        <StudyViewControls 
          fontSize={fontSize}
          textAlign={textAlign}
          isDarkMode={isDarkMode}
          isFullWidth={isFullWidth}
          isFullScreen={isFullScreen}
          onIncreaseFontSize={onIncreaseFontSize}
          onDecreaseFontSize={onDecreaseFontSize}
          onToggleDarkMode={onToggleDarkMode}
          onChangeTextAlign={onChangeTextAlign}
          onToggleWidth={onToggleWidth}
          onToggleFullScreen={onToggleFullScreen}
        />
      </div>
      
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {note.tags.map((tag) => (
            <Badge
              key={tag.id || tag.name}
              style={{
                backgroundColor: isDarkMode ? `${tag.color}80` : tag.color,
                color: getBestTextColor(tag.color)
              }}
              className="text-xs"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
