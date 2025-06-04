
import { Archive, Book, Edit, Pin, PinOff, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note } from '@/types/note';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteActionButtonsProps {
  note: Note;
  isDeleting: boolean;
  onEdit: () => void;
  onOpenStudyMode: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const NoteActionButtons = ({
  note,
  isDeleting,
  onEdit,
  onOpenStudyMode,
  onPin,
  onArchive,
  onDelete
}: NoteActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Button 
        variant="default" 
        className="flex items-center gap-2 bg-mint-600 hover:bg-mint-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
        onClick={onOpenStudyMode}
      >
        <Book className="h-4 w-4" />
        Study Mode
      </Button>
    
      <Button 
        variant="outline" 
        onClick={onEdit} 
        className="flex items-center gap-2 border-mint-200 hover:bg-mint-50 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
      >
        <Edit className="h-4 w-4" />
        Edit
      </Button>
      
      {/* Three dots menu - always visible */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 border-mint-200 hover:bg-mint-50 shadow-sm hover:shadow-md transition-all duration-200 font-medium px-3"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onPin}>
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
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="h-4 w-4 mr-2" />
            {note.archived ? 'Restore Note' : 'Archive Note'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Note
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border border-red-200 rounded-lg shadow-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-semibold text-gray-900">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-2">
                  This action cannot be undone. This will permanently delete the note "{note.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-2 mt-6">
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 font-medium">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-500 hover:bg-red-600 text-white border-0 font-medium"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
