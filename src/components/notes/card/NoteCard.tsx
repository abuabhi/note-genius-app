
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Camera, FileText, Tag } from "lucide-react";
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
      <CardHeader className="relative p-4 pb-2">
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
        
        {/* Date and Subject in same row */}
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Description removed as requested */}
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center">
        {/* Tags at bottom left */}
        <div className="flex-1">
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <Tag className="h-4 w-4 text-mint-700" />
              <NoteTagList 
                tags={note.tags
                  .filter(tag => tag.name !== note.category) // Don't show category tag twice
                  .slice(0, 3)
                }
              />
              {note.tags.length > 4 && (
                <Badge variant="outline" className="text-xs mt-1">
                  +{note.tags.length - 4} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap mt-1 gap-2">
            {note.sourceType === 'scan' && (
              <div className="flex items-center">
                <Camera className="h-4 w-4 text-mint-500 mr-1" />
                <span className="text-xs text-mint-500">Scanned</span>
              </div>
            )}
            {note.archived && (
              <div className="flex items-center">
                <Archive className="h-4 w-4 text-mint-500 mr-1" />
                <span className="text-xs text-mint-500">Archived</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Study Mode button at bottom right */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 text-sm text-mint-600 hover:text-mint-800"
          onClick={handleGoToStudyMode}
        >
          Study Mode
        </Button>
      </CardFooter>
    </Card>
  );
};
