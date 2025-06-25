
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface UnifiedBulkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemCount: number;
  itemType: 'note' | 'quiz' | 'flashcard' | 'flashcard set';
}

export const UnifiedBulkDeleteDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemCount,
  itemType
}: UnifiedBulkDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      
      toast({
        title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)}s deleted`,
        description: `${itemCount} ${itemType}${itemCount === 1 ? '' : 's'} deleted successfully.`,
      });
      
      onClose();
    } catch (error) {
      console.error(`Error deleting ${itemType}s:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${itemType}s. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const itemTypeDisplay = itemType === 'flashcard set' ? 'flashcard set' : itemType;
  const pluralType = itemCount === 1 ? itemTypeDisplay : `${itemTypeDisplay}s`;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Selected {pluralType.charAt(0).toUpperCase() + pluralType.slice(1)}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {itemCount} {pluralType}? 
            This action cannot be undone and all data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : `Delete ${itemCount} ${pluralType.charAt(0).toUpperCase() + pluralType.slice(1)}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
