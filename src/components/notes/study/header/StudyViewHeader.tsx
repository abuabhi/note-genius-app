
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudyViewControls } from "../controls/StudyViewControls";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Edit, Save } from "lucide-react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { generateColorFromString, getBestTextColor } from "@/utils/colorUtils";

interface StudyViewHeaderProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isFullWidth: boolean;
  isFullScreen: boolean;
  isEditing: boolean;
  isSaving?: boolean;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeTextAlign: (align: TextAlignType) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
  onToggleEditing: () => void;
  onSave: () => void;
}

export const StudyViewHeader: React.FC<StudyViewHeaderProps> = ({
  note,
  fontSize,
  textAlign,
  isFullWidth,
  isFullScreen,
  isEditing,
  isSaving = false,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen,
  onToggleEditing,
  onSave
}) => {
  // Generate category badge with color
  const getCategoryBadge = (category: string) => {
    if (!category) return null;
    
    const color = generateColorFromString(category);
    const textColor = getBestTextColor(color);
    
    return (
      <Badge 
        style={{ 
          backgroundColor: color, 
          color: textColor 
        }}
        className="font-normal"
      >
        {category}
      </Badge>
    );
  };

  return (
    <CardHeader className="pb-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b">
      <div className="space-y-1 flex-grow">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl md:text-2xl text-mint-800">
            {note.title}
          </CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{format(new Date(note.date), 'MMM d, yyyy')}</span>
          <span className="text-xs">•</span>
          {note.category && getCategoryBadge(note.category)}
          {note.tags?.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1 items-center">
              <span className="text-xs">•</span>
              {note.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.name}
                  variant="secondary"
                  className="font-normal text-xs"
                  style={{ backgroundColor: tag.color + '30', color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="font-normal text-xs">
                  +{note.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <StudyViewControls
        fontSize={fontSize}
        textAlign={textAlign}
        isFullWidth={isFullWidth}
        isFullScreen={isFullScreen}
        onIncreaseFontSize={onIncreaseFontSize}
        onDecreaseFontSize={onDecreaseFontSize}
        onChangeTextAlign={onChangeTextAlign}
        onToggleWidth={onToggleWidth}
        onToggleFullScreen={onToggleFullScreen}
        isEditing={isEditing}
        onToggleEditing={onToggleEditing}
        onSave={onSave}
        isSaving={isSaving}
      />
    </CardHeader>
  );
};
