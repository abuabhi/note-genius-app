
import { CardTitle } from "@/components/ui/card";
import { Note } from "@/types/note";
import { NoteCardActions } from "../NoteCardActions";
import { Badge } from "@/components/ui/badge";
import { Book } from "lucide-react";
import { generateColorFromString, getBestTextColor } from "@/utils/colorUtils";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface NoteCardHeaderProps {
  note: Note;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
}

export const NoteCardHeader = ({ note, onPin, onDelete }: NoteCardHeaderProps) => {
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
  // Find the subject name based on subject_id or fall back to subject
  const getSubjectName = () => {
    if (note.subject_id && !subjectsLoading && subjects.length > 0) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      if (foundSubject) {
        return foundSubject.name;
      }
    }
    return note.subject || "Uncategorized";
  };

  const subjectName = getSubjectName();
  const subjectColor = generateColorFromString(subjectName);
  const textColor = getBestTextColor(subjectColor);

  return (
    <>
      {/* Card actions positioned absolutely */}
      <div className="absolute top-4 right-4">
        <NoteCardActions 
          noteId={note.id}
          noteTitle={note.title}
          noteContent={note.content || note.description || ""}
          isPinned={!!note.pinned} 
          onPin={onPin}
          onDelete={onDelete}
          iconSize={4}
        />
      </div>
      
      {/* Subject badge at the top */}
      <div className="mb-3">
        <Badge 
          className="px-3 py-1.5 text-xs font-medium border-0 shadow-sm"
          style={{ 
            backgroundColor: subjectColor, 
            color: textColor 
          }}
        >
          <Book className="h-3 w-3 mr-1.5" />
          {subjectName}
        </Badge>
      </div>
      
      {/* Title below the subject */}
      <CardTitle className="text-xl text-green-700 leading-relaxed pr-12 font-bold">
        {note.title}
      </CardTitle>
    </>
  );
};
