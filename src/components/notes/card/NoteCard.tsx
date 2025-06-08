
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { NoteCardFloatingElements } from "./components/NoteCardFloatingElements";
import { NoteCardHeader } from "./components/NoteCardHeader";
import { NoteCardContent } from "./components/NoteCardContent";
import { NoteCardMetadata } from "./components/NoteCardMetadata";
import { stripMarkdown } from "./utils/markdownUtils";

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
  return (
    <Card 
      key={note.id}
      className={`
        group relative overflow-hidden transition-all duration-500 cursor-pointer
        bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl
        hover:scale-[1.02] hover:-translate-y-1
        ${note.pinned ? 'ring-2 ring-mint-400/50 shadow-mint-500/20' : ''}
        ${note.archived ? 'opacity-75' : ''}
        rounded-2xl
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-mint-500/5 before:via-transparent before:to-blue-500/5 before:opacity-0 before:transition-opacity before:duration-500
        hover:before:opacity-100
      `}
      onClick={() => onNoteClick(note)}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-mint-50/20 pointer-events-none" />
      
      {/* Floating elements for modern design */}
      <NoteCardFloatingElements note={note} />

      <CardHeader className="relative p-6 pb-4">
        <NoteCardHeader 
          note={note}
          onPin={onPin}
          onDelete={onDelete}
        />
        
        {/* Content preview with plain text only */}
        <NoteCardContent 
          note={note}
          stripMarkdown={stripMarkdown}
        />
      </CardHeader>
      
      <CardFooter className="flex justify-between items-center px-6 py-4 pt-0">
        <NoteCardMetadata note={note} />
      </CardFooter>
    </Card>
  );
};
