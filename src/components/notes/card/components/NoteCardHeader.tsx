
import { CardTitle } from "@/components/ui/card";
import { Note } from "@/types/note";
import { Badge } from "@/components/ui/badge";
import { Book } from "lucide-react";
import { ViewMode } from "@/hooks/useViewPreferences";
import { generateColorFromString, getBestTextColor } from "@/utils/colorUtils";
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
  const subjectColor = generateColorFromString(subjectName);
  const textColor = getBestTextColor(subjectColor);

  const isListView = viewMode === 'list';

  if (isListView) {
    const plainTextContent = stripMarkdown(note.content || note.description || '');
    
    return (
      <div className="flex items-center gap-3 min-w-0 w-full">
        {/* Subject badge - fixed width */}
        <Badge 
          className="px-2 py-1 text-xs font-medium border-0 flex-shrink-0"
          style={{ 
            backgroundColor: subjectColor, 
            color: textColor 
          }}
        >
          <Book className="h-3 w-3 mr-1" />
          {subjectName}
        </Badge>
        
        {/* Title - fixed width with green color */}
        <h3 className="font-semibold text-green-600 truncate flex-shrink-0 w-48">
          {note.title}
        </h3>
        
        {/* Content preview - takes remaining space */}
        {plainTextContent && (
          <p className="text-sm text-gray-600 truncate flex-1 min-w-0">
            {plainTextContent}
          </p>
        )}
      </div>
    );
  }

  // Grid view with green title
  return (
    <>
      {/* Subject badge at the top */}
      <div className="mb-3">
        <Badge 
          className="px-3 py-1.5 text-xs font-medium border-0"
          style={{ 
            backgroundColor: subjectColor, 
            color: textColor 
          }}
        >
          <Book className="h-3 w-3 mr-1.5" />
          {subjectName}
        </Badge>
      </div>
      
      {/* Title below the subject - now green */}
      <CardTitle className="text-lg font-semibold text-green-600 leading-tight pr-12">
        {note.title}
      </CardTitle>
    </>
  );
};
