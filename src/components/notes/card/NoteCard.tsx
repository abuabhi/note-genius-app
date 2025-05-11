
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Book, Camera, FileText, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoteCardActions } from "./NoteCardActions";
import { NoteTagList } from "../details/NoteTagList";
import { generateColorFromString } from "@/utils/colorUtils";
import { getBestTextColor } from "@/utils/colorUtils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
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
        {/* Card actions positioned absolutely */}
        <NoteCardActions 
          noteId={note.id} 
          isPinned={!!note.pinned} 
          onPin={onPin} 
          onDelete={onDelete}
          isConfirmingDelete={confirmDelete === note.id}
          iconSize={5} // Increased icon size
        />
        
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-mint-800 pr-8"> {/* Add padding-right to avoid overlap with pin */}
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
              color: generateColorFromString(note.category),
            }}
          >
            {note.category}
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
          className="h-8 text-sm bg-mint-600 hover:bg-mint-700 flex items-center gap-1"
          onClick={handleGoToStudyMode}
        >
          <Book className="h-4 w-4" />
          Study Mode
        </Button>
      </CardFooter>
    </Card>
  );
};
