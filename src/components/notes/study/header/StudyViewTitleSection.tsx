
import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NoteTagList } from "../../details/NoteTagList";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { Calendar, Tag } from "lucide-react";

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

  // Find the subject name based on subject_id or fall back to subject
  const getSubjectName = () => {
    // First, try to find subject by subject_id if it exists and subjects are loaded
    if (note?.subject_id && !subjectsLoading && subjects.length > 0) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      if (foundSubject) {
        return foundSubject.name;
      }
    }
    
    // If subject_id lookup fails or doesn't exist, use the legacy subject field
    return note?.subject || "No Subject";
  };

  const subjectName = getSubjectName();

  // Get browser's default timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Format the date using browser timezone
  const formattedDate = note?.date ? new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: userTimezone
  }).format(new Date(note.date)) : '';

  console.log(`StudyViewTitleSection - Note: ${note?.title}, Subject ID: ${note?.subject_id}, Subject Name: ${subjectName}`);

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
    <div className="space-y-3">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground leading-tight">{note?.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {subjectName && subjectName !== "No Subject" && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {subjectName}
              </Badge>
            </div>
          )}
          
          {formattedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      </div>

      {note?.tags && note?.tags.length > 0 && (
        <div className="pt-1">
          <NoteTagList tags={note?.tags} />
        </div>
      )}
    </div>
  );
};
