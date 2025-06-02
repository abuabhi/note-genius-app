
import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { Input } from "@/components/ui/input";
import { NoteTagList } from "../../details/NoteTagList";

interface StudyViewTitleSectionProps {
  note: Note;
  isEditing: boolean;
  editableTitle: string;
  onTitleChange: (title: string) => void;
}

export const StudyViewTitleSection = ({
  note,
  isEditing,
  editableTitle,
  onTitleChange,
}: StudyViewTitleSectionProps) => {
  const [title, setTitle] = useState(note?.title || "");

  useEffect(() => {
    setTitle(editableTitle || note?.title || "");
  }, [editableTitle, note?.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange(newTitle);
  };

  if (isEditing) {
    return (
      <Input
        value={title}
        onChange={handleTitleChange}
        className="font-medium text-lg border-mint-200 focus-visible:ring-mint-400"
        placeholder="Note Title"
      />
    );
  }

  return (
    <div className="space-y-1">
      <h2 className="text-xl font-bold text-green-700">{note?.title}</h2>
      <div className="text-sm flex flex-wrap gap-2 items-center">
        <span className="font-bold text-gray-600">{note?.date}</span>
        {note?.category && (
          <span className="text-green-600 font-medium">{note?.category}</span>
        )}
      </div>
      {note?.tags && note?.tags.length > 0 && (
        <div className="mt-2">
          <NoteTagList tags={note?.tags} />
        </div>
      )}
    </div>
  );
};
