
import { CardTitle } from "@/components/ui/card";
import { Note } from "@/types/note";
import { Badge } from "@/components/ui/badge";
import { Book } from "lucide-react";
import { ViewMode } from "@/hooks/useViewPreferences";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { stripMarkdown } from "../utils/markdownUtils";

interface NoteCardHeaderProps {
  note: Note;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  viewMode?: ViewMode;
}

export const NoteCardHeader = ({ note, onPin, onDelete, viewMode = 'grid' }: NoteCardHeaderProps) => {
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
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
  const isListView = viewMode === 'list';

  if (isListView) {
    return (
      <div className="flex items-center gap-3">
        {/* Subject badge - no truncation */}
        <Badge className="bg-gray-100 text-gray-700 border-0 text-xs font-medium flex-shrink-0">
          <Book className="h-3 w-3 mr-1" />
          <span>{subjectName}</span>
        </Badge>
        
        {/* Title - Green color and truncated */}
        <h3 className="font-semibold text-green-700 text-sm truncate max-w-[200px]">
          {note.title}
        </h3>
      </div>
    );
  }

  // Grid view
  return (
    <div className="space-y-3">
      {/* Subject badge at top-left */}
      <Badge className="bg-gray-100 text-gray-700 border-0 text-xs font-medium">
        <Book className="h-3 w-3 mr-1" />
        {subjectName}
      </Badge>
      
      {/* Title - Green color and clean */}
      <CardTitle className="text-lg font-semibold text-green-700 leading-tight line-clamp-2 pr-8">
        {note.title}
      </CardTitle>
    </div>
  );
};
