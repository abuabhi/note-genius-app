
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Camera, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoteCardActions } from "./NoteCardActions";
import { NoteTagList } from "../details/NoteTagList";
import { generateColorFromString } from "@/utils/colorUtils";
import { getBestTextColor } from "@/utils/colorUtils";

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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-mint-800 flex items-center gap-2">
              {note.title}
            </CardTitle>
          </div>
          <span className="text-sm text-mint-600">{note.date}</span>
        </div>
        
        <NoteCardActions 
          noteId={note.id} 
          isPinned={!!note.pinned} 
          onPin={onPin} 
          onDelete={onDelete}
          isConfirmingDelete={confirmDelete === note.id}
        />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Display Category Badge */}
        <div className="flex flex-wrap gap-1 mb-2 mt-3">
          {note.category && (
            <Badge 
              className="text-xs"
              style={{
                backgroundColor: generateColorFromString(note.category),
                color: getBestTextColor(generateColorFromString(note.category))
              }}
            >
              {note.category}
            </Badge>
          )}
        </div>

        {/* Display Tags */}
        {note.tags && note.tags.length > 0 && (
          <NoteTagList 
            tags={note.tags
              .filter(tag => tag.name !== note.category) // Don't show category tag twice
              .slice(0, 3)
            }
          />
        )}
        {note.tags && note.tags.length > 4 && (
          <Badge variant="outline" className="text-xs mt-2">
            +{note.tags.length - 4} more
          </Badge>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center">
          {note.sourceType === 'scan' && (
            <div className="flex items-center">
              <Camera className="h-3 w-3 text-mint-500 mr-1" />
              <span className="text-xs text-mint-500">Scanned Note</span>
            </div>
          )}
          {note.archived && (
            <div className="flex items-center">
              <Archive className="h-3 w-3 text-mint-500 mr-1" />
              <span className="text-xs text-mint-500">Archived</span>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs text-mint-600 hover:text-mint-800"
          onClick={(e) => onShowDetails(note, e)}
        >
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};
