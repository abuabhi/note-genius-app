
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Book, Camera, FileText, Pin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoteCardActions } from "./NoteCardActions";
import { NoteTagList } from "../details/NoteTagList";
import { generateColorFromString } from "@/utils/colorUtils";
import { getBestTextColor } from "@/utils/colorUtils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface NoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  confirmDelete: string | null;
}

export const NoteCard = ({
  note,
  onNoteClick,
  onShowDetails,
  onPin,
  onDelete,
  confirmDelete
}: NoteCardProps) => {
  const navigate = useNavigate();
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
  // Find the subject name based on subject_id or fall back to category
  const getSubjectName = () => {
    if (note.subject_id && !subjectsLoading) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      return foundSubject?.name || note.category || "Uncategorized";
    }
    return note.category || "Uncategorized";
  };

  const subjectName = getSubjectName();
  
  console.log(`NoteCard - Note: ${note.title}, Subject ID: ${note.subject_id}, Subject Name: ${subjectName}`);
  
  const handleGoToStudyMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/notes/study/${note.id}`);
  };

  // Format date as dd-MMM-yyyy (e.g., 15-May-2023)
  const formattedDate = format(new Date(note.date), "dd-MMM-yyyy");

  return (
    <Card 
      key={note.id}
      className={`
        hover:shadow-lg transition-shadow cursor-pointer border-mint-200 
        bg-white/50 backdrop-blur-sm hover:bg-mint-50/60
        ${note.pinned ? 'ring-2 ring-mint-400 shadow-md' : ''}
        ${note.archived ? 'opacity-75' : ''}
      `}
      onClick={() => onNoteClick(note)}
    >
      <CardHeader className="relative p-3 pb-1">
        {/* Pin indicator for pinned notes */}
        {note.pinned && (
          <div className="absolute top-2 left-2 text-mint-600">
            <Pin size={16} className="fill-mint-500" />
          </div>
        )}
        
        {/* Card actions positioned absolutely */}
        <NoteCardActions 
          noteId={note.id}
          noteTitle={note.title}
          noteContent={note.content || note.description || ""}
          isPinned={!!note.pinned} 
          onPin={onPin}
          onDelete={onDelete}
          iconSize={5}
        />
        
        <div className="flex flex-row items-center justify-between">
          <CardTitle className={`text-xl text-mint-800 ${note.pinned ? 'pl-6' : ''} pr-8`}>
            {note.title}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardFooter className="flex justify-between items-center px-3 py-2 pt-0">
        {/* Date and subject on left */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-mint-600">{formattedDate}</span>
          <span className="text-mint-400">•</span>
          <span 
            className="font-medium"
            style={{
              color: generateColorFromString(subjectName),
            }}
          >
            {subjectName}
          </span>
          
          {/* Tags and status indicators */}
          <div className="flex flex-wrap gap-1 ml-2">
            {note.sourceType === 'scan' && (
              <div className="flex items-center">
                <Camera className="h-4 w-4 text-mint-500" />
              </div>
            )}
            {note.archived && (
              <div className="flex items-center">
                <Archive className="h-4 w-4 text-mint-500" />
              </div>
            )}
          </div>
        </div>
        
        {/* Study Mode button at right */}
        <Button 
          variant="default" 
          size="sm" 
          className="h-8 text-lg bg-mint-600 hover:bg-mint-700 flex items-center gap-1 px-4"
          onClick={handleGoToStudyMode}
        >
          <Book className="h-4 w-4 mr-1" />
          Study Mode
        </Button>
      </CardFooter>
    </Card>
  );
};
