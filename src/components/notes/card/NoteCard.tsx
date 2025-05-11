
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
import { useState } from "react";

interface NoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const handleGoToStudyMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/notes/study/${note.id}`);
  };
  
  const handleDeleteWrapper = (id: string) => {
    // This wrapper function now handles the delete confirmation logic
    // without needing the event parameter from the actions component
    if (isConfirmingDelete) {
      // Actually delete the note
      onDelete(id);
      setIsConfirmingDelete(false);
    } else {
      // Set confirming state
      setIsConfirmingDelete(true);
      // Reset after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
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
          onDelete={handleDeleteWrapper}
          iconSize={5}
        />
        
        <div className="flex flex-row items-center justify-between">
          <CardTitle className={`text-xl text-mint-800 ${note.pinned ? 'pl-6' : ''} pr-8`}> {/* Add padding-right to avoid overlap with actions */}
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
