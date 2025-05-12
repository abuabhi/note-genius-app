
import { useState, useEffect } from "react";
import { CardHeader } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewControls } from "../controls/StudyViewControls";
import { TextAlignType } from "../hooks/useStudyViewState";
import { Input } from "@/components/ui/input";
import { Wand2 } from "lucide-react"; // Changed to use lucide-react directly

interface StudyViewHeaderProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isFullWidth: boolean;
  isFullScreen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  editableTitle: string;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeTextAlign: (align: TextAlignType) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
  onToggleEditing: () => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onEnhance: (enhancedContent: string) => void;
}

export const StudyViewHeader = ({
  note,
  fontSize,
  textAlign,
  isFullWidth,
  isFullScreen,
  isEditing,
  isSaving,
  editableTitle,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen,
  onToggleEditing,
  onSave,
  onTitleChange,
}: StudyViewHeaderProps) => {
  const [title, setTitle] = useState(note?.title || "");

  useEffect(() => {
    setTitle(editableTitle || note?.title || "");
  }, [editableTitle, note?.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange(newTitle);
  };

  return (
    <CardHeader className="border-b p-4 bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 w-full sm:w-auto">
          {isEditing ? (
            <Input
              value={title}
              onChange={handleTitleChange}
              className="font-medium text-lg border-mint-200 focus-visible:ring-mint-400"
              placeholder="Note Title"
            />
          ) : (
            <h2 className="font-medium text-xl">{note?.title}</h2>
          )}
        </div>

        <StudyViewControls
          fontSize={fontSize}
          textAlign={textAlign}
          isFullWidth={isFullWidth}
          isFullScreen={isFullScreen}
          isEditing={isEditing}
          isSaving={isSaving}
          onIncreaseFontSize={onIncreaseFontSize}
          onDecreaseFontSize={onDecreaseFontSize}
          onChangeTextAlign={onChangeTextAlign}
          onToggleWidth={onToggleWidth}
          onToggleFullScreen={onToggleFullScreen}
          onToggleEditing={onToggleEditing}
          onSave={onSave}
        />
      </div>
    </CardHeader>
  );
};
