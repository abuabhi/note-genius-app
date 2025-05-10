
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Note } from '@/types/note';
import { Badge } from '@/components/ui/badge';
import { useNotes } from '@/contexts/NoteContext';
import { Textarea } from '@/components/ui/textarea';
import { EnhanceNoteButton } from './enrichment/EnhanceNoteButton';
import { Archive, Copy, Edit, Pin, PinOff, Tags, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface NoteDetailsSheetProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export const NoteDetailsSheet: React.FC<NoteDetailsSheetProps> = ({
  note,
  open,
  onOpenChange,
  onEdit
}) => {
  const { updateNote, pinNote, archiveNote, deleteNote } = useNotes();
  const [isDeleting, setIsDeleting] = useState(false);
  const [noteContent, setNoteContent] = useState(note.content || '');

  const handlePin = async () => {
    try {
      await pinNote(note.id, !note.pinned);
      toast(`Note ${note.pinned ? 'unpinned' : 'pinned'} successfully`, {
        description: note.pinned ? 'The note is no longer pinned' : 'The note is now pinned at the top',
      });
    } catch (error) {
      toast('Failed to pin note', {
        description: 'An error occurred while updating the note',
      });
    }
  };

  const handleArchive = async () => {
    try {
      await archiveNote(note.id, !note.archived);
      toast(`Note ${note.archived ? 'restored' : 'archived'} successfully`, {
        description: note.archived ? 'The note is no longer archived' : 'The note has been moved to archive',
      });
      onOpenChange(false);
    } catch (error) {
      toast('Failed to archive note', {
        description: 'An error occurred while updating the note',
      });
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      await deleteNote(note.id);
      toast('Note deleted successfully', {
        description: 'The note has been permanently deleted',
      });
      onOpenChange(false);
    } catch (error) {
      toast('Failed to delete note', {
        description: 'An error occurred while deleting the note',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyContent = () => {
    if (note.content) {
      navigator.clipboard.writeText(note.content);
      toast('Copied to clipboard', {
        description: 'Note content copied to clipboard',
      });
    }
  };

  const handleApplyEnhancement = (enhancedContent: string) => {
    setNoteContent(enhancedContent);
    updateNote(note.id, { content: enhancedContent });
  };

  const getScanPreviewUrl = () => {
    if (note.sourceType === 'scan' && note.scanData?.originalImageUrl) {
      return note.scanData.originalImageUrl;
    }
    return null;
  };

  const getImportPreviewUrl = () => {
    if (note.sourceType === 'import' && note.importData?.originalFileUrl) {
      return note.importData.originalFileUrl;
    }
    return null;
  };

  const scanPreviewUrl = getScanPreviewUrl();
  const importPreviewUrl = getImportPreviewUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold">{note.title}</DialogTitle>
          <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
            <span>{note.date}</span>
            <span className="text-purple-600">{note.category}</span>
          </div>
        </DialogHeader>

        <p className="text-md leading-6">{note.description}</p>

        {(note.tags && note.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 items-center">
            <Tags className="h-4 w-4 text-muted-foreground" />
            {note.tags.map((tag) => (
              <Badge
                key={tag.id || tag.name}
                style={{
                  backgroundColor: tag.color,
                  color: getBestTextColor(tag.color)
                }}
                className="text-xs"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium">Content</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleCopyContent} title="Copy content">
                <Copy className="h-4 w-4" />
              </Button>
              <EnhanceNoteButton 
                noteId={note.id}
                noteTitle={note.title}
                noteContent={noteContent}
                onEnhance={handleApplyEnhancement}
              />
            </div>
          </div>
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="min-h-[200px] font-mono"
            readOnly
          />
        </div>
        
        {scanPreviewUrl && (
          <div className="space-y-2">
            <h3 className="text-md font-medium">Scanned Image</h3>
            <div className="relative rounded-md overflow-hidden border">
              <img 
                src={scanPreviewUrl} 
                alt="Scanned note" 
                className="w-full h-auto max-h-[300px] object-contain"
              />
              <a 
                href={scanPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-background/70 p-1 rounded-md"
                title="Open original"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            {note.scanData?.confidence && (
              <p className="text-xs text-muted-foreground">
                OCR Confidence: {Math.round(note.scanData.confidence * 100)}%
              </p>
            )}
          </div>
        )}

        {importPreviewUrl && (
          <div className="space-y-2">
            <h3 className="text-md font-medium">Imported File</h3>
            <div className="flex items-center gap-2 p-3 border rounded-md">
              <a 
                href={importPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 flex items-center gap-1"
              >
                {note.importData?.fileType?.toUpperCase()} File <ExternalLink className="h-3 w-3" />
              </a>
              {note.importData?.importedAt && (
                <span className="text-xs text-muted-foreground ml-auto">
                  Imported on {new Date(note.importData.importedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handlePin} className="flex items-center gap-2">
            {note.pinned ? (
              <>
                <PinOff className="h-4 w-4" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="h-4 w-4" />
                Pin
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleArchive} className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            {note.archived ? 'Restore' : 'Archive'}
          </Button>
          <Button 
            variant={isDeleting ? "destructive" : "outline"} 
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Confirm Delete' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to determine text color based on background color
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
