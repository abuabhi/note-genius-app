
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
        className="group relative overflow-hidden transition-all duration-200 cursor-pointer bg-white border border-gray-200 hover:border-mint-300 hover:shadow-md rounded-xl w-full max-w-full"
        onClick={() => onNoteClick(note)}
      >
        <div className="flex items-center gap-4 p-4 w-full min-w-0">
          {/* Content - takes up most space but with constraints */}
          <div className="flex-1 min-w-0 max-w-[calc(100%-200px)]">
            <NoteCardHeader 
              note={note}
              onPin={onPin}
              onDelete={onDelete}
              viewMode={viewMode}
            />
          </div>
          
          {/* Metadata and Actions - fixed width */}
          <div className="flex items-center gap-3 flex-shrink-0 w-auto">
            <NoteCardMetadata note={note} viewMode={viewMode} />
            <div className="relative flex-shrink-0">
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

  // Grid view - completely redesigned for beauty and elegance
  return (
    <Card 
      className={`
        group relative overflow-hidden transition-all duration-300 cursor-pointer
        bg-white border border-gray-200 hover:border-mint-300 hover:shadow-xl
        hover:scale-[1.02] hover:-translate-y-2
        ${note.pinned ? 'ring-2 ring-yellow-400/30 border-yellow-300' : ''}
        ${note.archived ? 'opacity-75' : ''}
        rounded-2xl min-h-[320px] flex flex-col shadow-sm
      `}
      onClick={() => onNoteClick(note)}
    >
      {/* Actions positioned absolutely */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
      
      {/* Beautiful, clean footer */}
      <CardFooter className="px-6 py-4 mt-auto border-t border-gray-50 bg-gray-50/30">
        <NoteCardMetadata note={note} viewMode={viewMode} />
      </CardFooter>
    </Card>
  );
};
