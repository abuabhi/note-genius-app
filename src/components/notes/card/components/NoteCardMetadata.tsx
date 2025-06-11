
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, Tag, Sparkles } from "lucide-react";
import { Note } from "@/types/note";
import { generateColorFromString, getBestTextColor } from "@/utils/colorUtils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface NoteCardMetadataProps {
  note: Note;
}

export const NoteCardMetadata = ({ note }: NoteCardMetadataProps) => {
  const navigate = useNavigate();
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
  const subjectColor = generateColorFromString(subjectName);
  const textColor = getBestTextColor(subjectColor);
  
  const handleGoToStudyMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("🎯 Study button clicked - Navigating to study mode for note:", note.id, note.title);
    navigate(`/notes/study/${note.id}`);
  };

  // Format date as dd-MMM-yyyy (e.g., 15-May-2023)
  const formattedDate = format(new Date(note.date), "dd-MMM-yyyy");

  return (
    <div className="flex justify-between items-center w-full">
      {/* Left side - metadata */}
      <div className="flex items-center gap-3">
        {/* Subject badge with generated color */}
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
        
        {/* Date */}
        <span className="text-sm text-gray-600 font-bold">
          {formattedDate}
        </span>

        {/* Tags count */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-500">
              {note.tags.length}
            </span>
          </div>
        )}
      </div>

      {/* Right side - Study Button */}
      <Button
        onClick={handleGoToStudyMode}
        className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-medium rounded-xl transition-all duration-200 relative z-10 shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40 hover:scale-[1.02] px-4 py-2 h-auto"
        size="sm"
        type="button"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Study Mode
      </Button>
    </div>
  );
};
