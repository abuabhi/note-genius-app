
import { Note } from "@/types/note";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        className="group relative cursor-pointer bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 rounded-lg overflow-hidden"
        onClick={() => onNoteClick(note)}
      >
        <div className="flex items-center py-2 px-3 w-full min-w-0 gap-3">
          {/* Subject and Title - compact inline */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <NoteCardHeader 
              note={note}
              onPin={onPin}
              onDelete={onDelete}
              viewMode={viewMode}
            />
          </div>
          
          {/* Content preview - flexible width */}
          <div className="flex-1 min-w-0 hidden md:block">
            <NoteCardContent 
              note={note}
              stripMarkdown={stripMarkdown}
              viewMode={viewMode}
            />
          </div>
          
          {/* Metadata and actions - fixed width */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <NoteCardMetadata note={note} viewMode={viewMode} />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <NoteCardActions 
                noteId={note.id}
                noteTitle={note.title}
                noteContent={note.content || note.description || ""}
                isPinned={!!note.pinned} 
                onPin={onPin}
                onDelete={onDelete}
                iconSize={3}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view - clean and simple
  return (
    <Card 
      className={`
        group relative cursor-pointer transition-all duration-200
        bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md
        ${note.pinned ? 'ring-1 ring-yellow-300 border-yellow-300' : ''}
        rounded-lg h-full flex flex-col
      `}
      onClick={() => onNoteClick(note)}
    >
      {/* Actions positioned absolutely */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

      <CardHeader className="p-4 pb-2 flex-1">
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
      
      {/* Simple footer */}
      <div className="p-4 pt-0 mt-auto">
        <NoteCardMetadata note={note} viewMode={viewMode} />
      </div>
    </Card>
  );
};
