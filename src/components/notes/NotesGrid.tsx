
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Note } from "@/types/note";
import { Archive, Camera, Pin, PinOff, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/contexts/NoteContext";
import { NoteDetailsSheet } from "./NoteDetailsSheet";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { NoteTagList } from "./details/NoteTagList";

export const NotesGrid = ({ notes }: { notes: Note[] }) => {
  const { pinNote, archiveNote, deleteNote } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  if (notes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-mint-600">No notes found. Create a note or adjust your search.</p>
      </div>
    );
  }

  const handlePin = (id: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    pinNote(id, !isPinned);
    toast(isPinned ? "Note unpinned" : "Note pinned");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If we're already confirming deletion for this note
    if (confirmDelete === id) {
      deleteNote(id);
      setConfirmDelete(null);
      toast("Note deleted");
    } else {
      // First click - set confirm state
      setConfirmDelete(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleNoteClick = (note: Note) => {
    // Navigate directly to study mode
    navigate(`/notes/study/${note.id}`);
  };

  const handleShowDetails = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNote(note);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card 
            key={note.id}
            className={`
              hover:shadow-lg transition-shadow cursor-pointer border-mint-200 
              bg-white/50 backdrop-blur-sm hover:bg-mint-50/60
              ${note.pinned ? 'ring-2 ring-mint-400 shadow-md' : ''}
              ${note.archived ? 'opacity-75' : ''}
            `}
            onClick={() => handleNoteClick(note)}
          >
            <CardHeader className="relative p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-mint-800 flex items-center gap-2">
                    {note.pinned && <Pin className="h-4 w-4 text-mint-500" />}
                    {note.title}
                  </CardTitle>
                </div>
                <span className="text-sm text-mint-600">{note.date}</span>
              </div>
              
              <div className="absolute top-2 right-2 flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6 rounded-full bg-white/80 hover:bg-white shadow-sm"
                  onClick={(e) => handlePin(note.id, !!note.pinned, e)}
                  title={note.pinned ? "Unpin note" : "Pin note"}
                >
                  {note.pinned ? 
                    <PinOff className="h-3 w-3 text-mint-700" /> : 
                    <Pin className="h-3 w-3 text-mint-700" />
                  }
                </Button>
                <Button 
                  variant={confirmDelete === note.id ? "destructive" : "ghost"}
                  size="icon"
                  className={`h-6 w-6 rounded-full ${
                    confirmDelete === note.id ? 
                    "bg-red-500 hover:bg-red-600" : 
                    "bg-white/80 hover:bg-white shadow-sm"
                  }`}
                  onClick={(e) => handleDelete(note.id, e)}
                  title={confirmDelete === note.id ? "Click again to confirm delete" : "Delete note"}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
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
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags
                    .filter(tag => tag.name !== note.category) // Don't show category tag twice
                    .slice(0, 3)
                    .map(tag => (
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
                    ))
                  }
                  {note.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 4} more
                    </Badge>
                  )}
                </div>
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
                onClick={(e) => handleShowDetails(note, e)}
              >
                Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedNote && (
        <NoteDetailsSheet 
          note={selectedNote}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onEdit={() => {
            setIsDetailsOpen(false);
            navigate(`/notes/edit/${selectedNote.id}`);
          }}
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

// Generate a color based on a string (for category tags)
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
