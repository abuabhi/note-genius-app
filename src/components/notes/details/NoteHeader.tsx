
import { Note } from "@/types/note";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface NoteHeaderProps {
  note: Note;
}

export const NoteHeader = ({ note }: NoteHeaderProps) => {
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
  // Find the subject name based on subject_id or fall back to subject
  const getSubjectName = () => {
    if (note.subject_id && !subjectsLoading) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      return foundSubject?.name || note.subject || "Uncategorized";
    }
    return note.subject || "Uncategorized";
  };

  const subjectName = getSubjectName();
    
  console.log(`NoteHeader - Note: ${note.title}, Subject ID: ${note.subject_id}, Subject Name: ${subjectName}`);
  
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-bold text-mint-800">{note.title}</h2>
      <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
        <span>{note.date}</span>
        <span className="text-mint-600">{subjectName}</span>
      </div>
    </div>
  );
};
