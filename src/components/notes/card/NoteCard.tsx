
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ViewMode } from "@/hooks/useViewPreferences";
import { NoteCardHeader } from "./components/NoteCardHeader";
import { NoteCardContent } from "./components/NoteCardContent";
import { NoteCardMetadata } from "./components/NoteCardMetadata";
import { NoteCardActions } from "./NoteCardActions";
import { stripMarkdown } from "./utils/markdownUtils";

interface NoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  confirmDelete: string | null;
  viewMode?: ViewMode;
}

export const NoteCard = ({
  note,
  onNoteClick,
  onShowDetails,
  onPin,
  onDelete,
  confirmDelete,
  viewMode = 'grid'
}: NoteCardProps) => {
  const isListView = viewMode === 'list';
  
  if (isListView) {
    return (
      <Card 
        className="group relative overflow-hidden transition-all duration-200 cursor-pointer bg-white border border-gray-200 hover:border-mint-300 hover:shadow-md rounded-xl p-4"
        onClick={() => onNoteClick(note)}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Subject, Title, Content */}
          <div className="flex-1 min-w-0">
            <NoteCardHeader 
              note={note}
              onPin={onPin}
              onDelete={onDelete}
              viewMode={viewMode}
            />
          </div>
          
          {/* Right side - Metadata and Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <NoteCardMetadata note={note} viewMode={viewMode} />
            <div className="relative">
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
          </div>
        </div>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card 
      className={`
        group relative overflow-hidden transition-all duration-300 cursor-pointer
        bg-white border border-gray-200 hover:border-mint-300 hover:shadow-lg
        hover:scale-[1.02] hover:-translate-y-1
        ${note.pinned ? 'ring-2 ring-mint-400/50 border-mint-300' : ''}
        ${note.archived ? 'opacity-75' : ''}
        rounded-xl min-h-[280px] flex flex-col
      `}
      onClick={() => onNoteClick(note)}
    >
      {/* Actions positioned absolutely */}
      <div className="absolute top-4 right-4 z-10">
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

      <CardHeader className="relative p-6 pb-4 flex-1">
        <NoteCardHeader 
          note={note}
          onPin={onPin}
          onDelete={onDelete}
          viewMode={viewMode}
        />
        
        <NoteCardContent 
          note={note}
          stripMarkdown={stripMarkdown}
          viewMode={viewMode}
        />
      </CardHeader>
      
      <CardFooter className="flex justify-between items-center px-6 py-4 pt-0 mt-auto border-t border-gray-100">
        <NoteCardMetadata note={note} viewMode={viewMode} />
      </CardFooter>
    </Card>
  );
};
