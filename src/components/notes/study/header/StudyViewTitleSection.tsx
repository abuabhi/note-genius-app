
import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { Input } from "@/components/ui/input";
import { NoteTagList } from "../../details/NoteTagList";
import { useUserSubjects } from "@/hooks/useUserSubjects";

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
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  useEffect(() => {
    setTitle(editableTitle || note?.title || "");
  }, [editableTitle, note?.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange(newTitle);
  };

  // Find the subject name based on subject_id or fall back to category
  const getSubjectName = () => {
    if (note?.subject_id && !subjectsLoading) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      return foundSubject?.name || note?.category || "Uncategorized";
    }
    return note?.category || "Uncategorized";
  };

  const subjectName = getSubjectName();

  console.log(`StudyViewTitleSection - Note: ${note?.title}, Subject ID: ${note?.subject_id}, Subject Name: ${subjectName}`);

  if (isEditing) {
    return (
      <div className="py-2 px-3 bg-muted/30 border-b border-border h-[49px] flex items-center">
        <Input
          value={title}
          onChange={handleTitleChange}
          className="font-medium text-sm border-mint-200 focus-visible:ring-mint-400 h-8"
          placeholder="Note Title"
        />
      </div>
    );
  }

  return (
    <div className="py-2 px-3 bg-muted/30 border-b border-border h-[49px] flex flex-col justify-center">
      <h2 className="text-sm font-medium text-muted-foreground truncate">{note?.title}</h2>
      <div className="text-xs flex items-center gap-2 text-muted-foreground/80">
        <span className="font-medium">{note?.date}</span>
        {subjectName && (
          <span className="text-mint-600">{subjectName}</span>
        )}
      </div>
    </div>
  );
};
