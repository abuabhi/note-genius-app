
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

interface UnifiedDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemName: string;
  itemType: 'note' | 'quiz' | 'flashcard' | 'flashcard set';
  description?: string;
  isDestructive?: boolean;
}

export const UnifiedDeleteDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  itemName,
  itemType,
  description,
  isDestructive = true
}: UnifiedDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      
      toast({
        title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted`,
        description: `"${itemName}" has been successfully deleted.`,
      });
      
      onClose();
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete the ${itemType}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDefaultDescription = () => {
    if (description) return description;
    
    return `Are you sure you want to delete "${itemName}"? This action cannot be undone and all ${itemType} data will be permanently removed.`;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {getDefaultDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className={isDestructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {isDeleting ? "Deleting..." : `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
