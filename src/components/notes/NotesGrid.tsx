
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Note } from "@/types/note";
import { Archive, ArchiveRestore, Camera, Pin, PinOff, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator, 
  ContextMenuTrigger 
} from "@/components/ui/context-menu";
import { useNotes } from "@/contexts/NoteContext";
import { NoteDetailsSheet } from "./NoteDetailsSheet";

export const NotesGrid = ({ notes }: { notes: Note[] }) => {
  const { pinNote, archiveNote } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (notes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-purple-600">No notes found. Create a note or adjust your search.</p>
      </div>
    );
  }

  const handlePin = (id: string, isPinned: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    pinNote(id, !isPinned);
  };

  const handleArchive = (id: string, isArchived: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    archiveNote(id, !isArchived);
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsDetailsOpen(true);
  };

  const handleEditNote = () => {
    // This will be handled by the NoteDetailsSheet component
    setIsDetailsOpen(false);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <ContextMenu key={note.id}>
            <ContextMenuTrigger>
              <Card 
                className={`
                  hover:shadow-lg transition-shadow cursor-pointer border-purple-100 
                  bg-white/50 backdrop-blur-sm hover:bg-purple-50/60
                  ${note.pinned ? 'ring-2 ring-purple-400 shadow-md' : ''}
                  ${note.archived ? 'opacity-75' : ''}
                `}
                onClick={() => handleNoteClick(note)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
                        {note.pinned && <Pin className="h-4 w-4 text-purple-500" />}
                        {note.title}
                      </CardTitle>
                      <CardDescription className="text-purple-600">{note.category}</CardDescription>
                    </div>
                    <span className="text-sm text-purple-600">{note.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-700 whitespace-pre-line">{note.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {note.tags && note.tags.length > 0 && note.tags.map(tag => (
                      <Badge 
                        key={tag.id || tag.name} 
                        style={{
                          backgroundColor: tag.color,
                          color: getBestTextColor(tag.color)
                        }}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex items-center justify-between w-full">
                    {note.sourceType === 'scan' && (
                      <div className="flex items-center">
                        <Camera className="h-3 w-3 text-purple-500 mr-1" />
                        <span className="text-xs text-purple-500">Scanned Note</span>
                      </div>
                    )}
                    {note.archived && (
                      <div className="flex items-center ml-auto">
                        <Archive className="h-3 w-3 text-purple-500 mr-1" />
                        <span className="text-xs text-purple-500">Archived</span>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </ContextMenuTrigger>
            
            <ContextMenuContent>
              <ContextMenuItem onClick={(e) => handlePin(note.id, !!note.pinned, e)}>
                {note.pinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin Note
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin Note
                  </>
                )}
              </ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleArchive(note.id, !!note.archived, e)}>
                {note.archived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Restore from Archive
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Note
                  </>
                )}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
      
      {selectedNote && (
        <NoteDetailsSheet 
          note={selectedNote}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onEdit={handleEditNote}
        />
      )}
    </>
  );
};

// Helper function to determine if black or white text will be more readable against a background color
function getBestTextColor(bgColor: string): string {
  // Remove the hash if it exists
  const color = bgColor.startsWith('#') ? bgColor.slice(1) : bgColor;
  
  // Convert to RGB
  let r, g, b;
  if (color.length === 3) {
    r = parseInt(color[0] + color[0], 16);
    g = parseInt(color[1] + color[1], 16);
    b = parseInt(color[2] + color[2], 16);
  } else {
    r = parseInt(color.slice(0, 2), 16);
    g = parseInt(color.slice(2, 4), 16);
    b = parseInt(color.slice(4, 6), 16);
  }
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? 'black' : 'white';
}
