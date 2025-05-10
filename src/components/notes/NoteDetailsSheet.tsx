
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Note } from '@/types/note';
import { NoteHeader } from './details/NoteHeader';
import { NoteTagList } from './details/NoteTagList';
import { NoteContentSection } from './details/NoteContentSection';
import { NoteAttachments } from './details/NoteAttachments';
import { NoteActionButtons } from './details/NoteActionButtons';
import { useNoteDetails } from './details/useNoteDetails';
import { useNavigate } from 'react-router-dom';
import { SubjectTagSelect } from './tags/SubjectTagSelect';

interface NoteDetailsSheetProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export const NoteDetailsSheet: React.FC<NoteDetailsSheetProps> = ({
  note,
  open,
  onOpenChange,
  onEdit
}) => {
  const navigate = useNavigate();
  const {
    isDeleting,
    noteContent,
    setNoteContent,
    handlePin,
    handleArchive,
    handleDelete,
    handleApplyEnhancement,
    handleOpenStudyMode,
    scanPreviewUrl,
    importPreviewUrl
  } = useNoteDetails(note, onOpenChange);

  const handleEdit = () => {
    onOpenChange(false); // Close the dialog
    navigate(`/notes/edit/${note.id}`); // Navigate to edit page
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-mint-100">
        <DialogHeader>
          <NoteHeader note={note} />
        </DialogHeader>

        <p className="text-md leading-6">{note.description}</p>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-mint-700">Subject</h3>
            <SubjectTagSelect note={note} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-mint-700">Tags</h3>
            <NoteTagList tags={note.tags} showTagIcon={true} />
          </div>
        </div>

        <NoteContentSection
          noteId={note.id}
          noteTitle={note.title}
          content={noteContent}
          onContentChange={setNoteContent}
          onApplyEnhancement={handleApplyEnhancement}
        />
        
        <NoteAttachments
          scanPreviewUrl={scanPreviewUrl}
          importPreviewUrl={importPreviewUrl}
          confidence={note.scanData?.confidence}
          fileType={note.importData?.fileType}
          importedAt={note.importData?.importedAt}
        />

        <NoteActionButtons
          note={note}
          isDeleting={isDeleting}
          onEdit={handleEdit}
          onOpenStudyMode={handleOpenStudyMode}
          onPin={handlePin}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      </DialogContent>
    </Dialog>
  );
};
