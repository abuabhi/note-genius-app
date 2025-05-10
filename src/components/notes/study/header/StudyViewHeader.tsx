
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudyViewControls } from "../controls/StudyViewControls";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Edit, Save } from "lucide-react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";

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
  return (
    <CardHeader className="pb-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b">
      <div className="space-y-1 flex-grow">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl md:text-2xl text-mint-800">
            {note.title}
          </CardTitle>
          
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Button
                variant="default"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center gap-1 bg-mint-600 hover:bg-mint-700"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleEditing}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Note</span>
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{format(new Date(note.date), 'MMM d, yyyy')}</span>
          <span className="text-xs">•</span>
          {note.category && (
            <Badge variant="outline" className="font-normal">
              {note.category}
            </Badge>
          )}
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
      />
    </CardHeader>
  );
};
